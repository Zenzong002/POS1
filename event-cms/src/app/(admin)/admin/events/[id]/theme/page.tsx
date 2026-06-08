'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, Palette, CheckCircle2 } from 'lucide-react';
import { eventsCollection, themesCollection } from '@/lib/firebase/firestore';
import ThemeCard from '@/components/admin/ThemeCard';
import type { Theme } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ThemeOverrides {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 ' +
  'transition-colors placeholder-gray-300';

const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

// ─── Color override field ─────────────────────────────────────────────────────

interface ColorFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}

function ColorOverrideField({ label, placeholder, value, onChange }: ColorFieldProps) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2 py-1.5 bg-white focus-within:ring-2 focus-within:ring-yellow-400/40">
        <input
          type="color"
          value={value || placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border-none bg-transparent p-0"
          title={`Pick ${label} color`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 text-sm font-mono text-gray-700 bg-transparent focus:outline-none placeholder-gray-300"
          maxLength={7}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
            title="Clear override"
          >
            ×
          </button>
        )}
      </div>
      {!value && (
        <p className="text-xs text-gray-400 mt-1">Leave blank to use theme default</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventThemePage() {
  const { id } = useParams<{ id: string }>();

  const [themes, setThemes] = useState<(Theme & { id: string })[]>([]);
  const [currentThemeId, setCurrentThemeId] = useState<string>('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [overrides, setOverrides] = useState<ThemeOverrides>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    Promise.all([
      eventsCollection.get(id),
      themesCollection.list(),
    ])
      .then(([event, allThemes]) => {
        setThemes(allThemes);
        if (event?.themeId) {
          setCurrentThemeId(event.themeId);
          setSelectedThemeId(event.themeId);
        }
        // Load any existing overrides stored on the event document
        const ev = event as (typeof event & { themeOverrides?: ThemeOverrides }) | null;
        if (ev?.themeOverrides) {
          setOverrides(ev.themeOverrides);
        }
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Effective preview theme ───────────────────────────────────────────────

  const selectedTheme = themes.find((t) => t.id === selectedThemeId);
  const effectiveTheme = selectedTheme
    ? {
        ...selectedTheme,
        primaryColor: overrides.primaryColor || selectedTheme.primaryColor,
        secondaryColor: overrides.secondaryColor || selectedTheme.secondaryColor,
        accentColor: overrides.accentColor || selectedTheme.accentColor,
      }
    : null;

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!id || !selectedThemeId) {
      toast.error('Please select a theme first');
      return;
    }
    setSaving(true);
    try {
      await eventsCollection.update(id, {
        themeId: selectedThemeId,
        // Store overrides as extra field on the event document
        // (safe to cast as UpdateData allows extra fields via DocumentData)
        ...(Object.keys(overrides).length > 0 ? { themeOverrides: overrides } : { themeOverrides: null }),
      } as Parameters<typeof eventsCollection.update>[1]);
      setCurrentThemeId(selectedThemeId);
      toast.success('Theme applied to event');
    } catch {
      toast.error('Failed to apply theme');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    selectedThemeId !== currentThemeId ||
    Object.values(overrides).some(Boolean);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/admin/events/${id}`}
          className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={14} />
          Event Editor
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium">Theme</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Palette size={22} style={{ color: '#6366f1' }} />
            Apply Theme
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose a visual theme for this event page
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading || !selectedThemeId}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)', color: '#1a1a2e' }}
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? 'Saving…' : hasChanges ? 'Apply Theme' : 'Saved'}
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* Theme grid */}
          <div className="xl:col-span-3 space-y-4">
            {themes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Palette size={40} className="text-gray-200" />
                <p className="text-gray-400 font-medium">No themes available</p>
                <p className="text-gray-300 text-sm">
                  Create themes in the Theme Manager first.
                </p>
                <Link
                  href="/admin/themes"
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)', color: '#1a1a2e' }}
                >
                  Go to Theme Manager
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Click a theme to select it &mdash; then save to apply it to this event.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className="cursor-pointer"
                    >
                      <ThemeCard
                        theme={theme}
                        selected={selectedThemeId === theme.id}
                        actionLabel={
                          currentThemeId === theme.id ? 'Currently Applied' : 'Select'
                        }
                        onApply={(t) => setSelectedThemeId(t.id)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right panel: overrides & selected summary */}
          <div className="xl:col-span-1 space-y-4">

            {/* Currently selected summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <h2 className="font-semibold text-gray-800 text-sm">Selected Theme</h2>
              {selectedTheme ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[
                        effectiveTheme?.primaryColor,
                        effectiveTheme?.secondaryColor,
                        effectiveTheme?.accentColor,
                      ].map((c, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border border-white shadow-sm ring-1 ring-gray-200"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-sm font-semibold text-gray-800 truncate"
                      style={{ fontFamily: selectedTheme.fontFamily }}
                    >
                      {selectedTheme.name}
                    </span>
                  </div>

                  {selectedThemeId === currentThemeId && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600">
                      <CheckCircle2 size={13} />
                      Currently applied to this event
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">No theme selected</p>
              )}
            </div>

            {/* Color overrides */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-800 text-sm">Custom Overrides</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Override specific colors for this event only
                </p>
              </div>

              <ColorOverrideField
                label="Override Primary Color"
                placeholder={selectedTheme?.primaryColor ?? '#D4AF37'}
                value={overrides.primaryColor ?? ''}
                onChange={(v) => setOverrides((o) => ({ ...o, primaryColor: v || undefined }))}
              />

              <ColorOverrideField
                label="Override Secondary Color"
                placeholder={selectedTheme?.secondaryColor ?? '#1a1a2e'}
                value={overrides.secondaryColor ?? ''}
                onChange={(v) => setOverrides((o) => ({ ...o, secondaryColor: v || undefined }))}
              />

              <ColorOverrideField
                label="Override Accent Color"
                placeholder={selectedTheme?.accentColor ?? '#c9a84c'}
                value={overrides.accentColor ?? ''}
                onChange={(v) => setOverrides((o) => ({ ...o, accentColor: v || undefined }))}
              />

              {Object.values(overrides).some(Boolean) && (
                <button
                  type="button"
                  onClick={() => setOverrides({})}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Clear all overrides
                </button>
              )}
            </div>

            {/* Effective preview */}
            {effectiveTheme && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <h2 className="font-semibold text-gray-800 text-sm">Effective Preview</h2>
                <div
                  className="rounded-xl overflow-hidden border border-gray-100"
                  style={{ background: effectiveTheme.secondaryColor }}
                >
                  <div
                    className="px-3 py-2"
                    style={{ background: effectiveTheme.primaryColor }}
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: effectiveTheme.secondaryColor,
                        fontFamily: effectiveTheme.fontFamily,
                      }}
                    >
                      {effectiveTheme.name}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex gap-1">
                    {[
                      effectiveTheme.primaryColor,
                      effectiveTheme.secondaryColor,
                      effectiveTheme.accentColor,
                    ].map((c, i) => (
                      <div
                        key={i}
                        className="flex-1 h-5 rounded"
                        style={{ background: c, border: '1px solid rgba(0,0,0,0.06)' }}
                        title={['Primary', 'Secondary', 'Accent'][i] + ': ' + c}
                      />
                    ))}
                  </div>
                  <p
                    className="px-3 pb-2 text-xs"
                    style={{ color: effectiveTheme.primaryColor, fontFamily: effectiveTheme.fontFamily }}
                  >
                    {effectiveTheme.fontFamily}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
