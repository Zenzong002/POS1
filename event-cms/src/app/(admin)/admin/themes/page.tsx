'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, X, Loader2, Palette } from 'lucide-react';
import { themesCollection } from '@/lib/firebase/firestore';
import ThemeCard from '@/components/admin/ThemeCard';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import type { Theme, ButtonStyle } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  'Playfair Display',
  'Cormorant Garamond',
  'Great Vibes',
  'Cinzel',
  'Lato',
  'Inter',
] as const;

const BORDER_RADIUS_OPTIONS = ['none', 'small', 'medium', 'large', 'full'] as const;

const BUTTON_STYLE_OPTIONS: ButtonStyle[] = ['rounded', 'square', 'pill'];

const PRESET_THEMES: Omit<Theme, 'id'>[] = [
  {
    name: 'Luxury Gold',
    primaryColor: '#D4AF37',
    secondaryColor: '#1a1a2e',
    accentColor: '#c9a84c',
    fontFamily: 'Playfair Display',
    borderRadius: 'medium',
    buttonStyle: 'rounded',
  },
  {
    name: 'Garden Wedding',
    primaryColor: '#4a7c59',
    secondaryColor: '#f5f5f0',
    accentColor: '#8fb996',
    fontFamily: 'Cormorant Garamond',
    borderRadius: 'large',
    buttonStyle: 'pill',
  },
  {
    name: 'Modern Minimal',
    primaryColor: '#1a1a1a',
    secondaryColor: '#ffffff',
    accentColor: '#666666',
    fontFamily: 'Inter',
    borderRadius: 'small',
    buttonStyle: 'square',
  },
  {
    name: 'Traditional Thai',
    primaryColor: '#8b0000',
    secondaryColor: '#fdf5e6',
    accentColor: '#c9a84c',
    fontFamily: 'Cinzel',
    borderRadius: 'none',
    buttonStyle: 'square',
  },
  {
    name: 'Romantic Rose',
    primaryColor: '#c2185b',
    secondaryColor: '#fce4ec',
    accentColor: '#f06292',
    fontFamily: 'Great Vibes',
    borderRadius: 'full',
    buttonStyle: 'pill',
  },
];

const EMPTY_FORM: Omit<Theme, 'id'> = {
  name: '',
  primaryColor: '#D4AF37',
  secondaryColor: '#1a1a2e',
  accentColor: '#c9a84c',
  fontFamily: 'Playfair Display',
  borderRadius: 'medium',
  buttonStyle: 'rounded',
  previewImageUrl: '',
};

const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 ' +
  'transition-colors placeholder-gray-300';

const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

// ─── Mini preview ─────────────────────────────────────────────────────────────

function MiniPreview({ form }: { form: Omit<Theme, 'id'> }) {
  const btnRadius: Record<string, string> = {
    none: '0px',
    small: '4px',
    medium: '8px',
    large: '16px',
    full: '9999px',
  };

  return (
    <div
      className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      style={{ background: form.secondaryColor }}
    >
      {/* Header stripe */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: form.primaryColor }}
      >
        <span
          className="text-sm font-bold truncate"
          style={{ color: form.secondaryColor, fontFamily: form.fontFamily }}
        >
          {form.name || 'Theme Preview'}
        </span>
        <div
          className="w-5 h-5 rounded-full border-2"
          style={{ background: form.accentColor, borderColor: form.secondaryColor }}
        />
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <p
          className="text-xs"
          style={{ color: form.primaryColor, fontFamily: form.fontFamily }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
        <button
          className="px-3 py-1.5 text-xs font-semibold transition-all"
          style={{
            background: form.buttonStyle === 'outlined' ? 'transparent' : form.primaryColor,
            color: form.buttonStyle === 'outlined' ? form.primaryColor : form.secondaryColor,
            borderRadius: btnRadius[form.borderRadius] ?? '8px',
            border: `1.5px solid ${form.primaryColor}`,
          }}
        >
          Sample Button
        </button>
      </div>

      {/* Swatch row */}
      <div className="flex border-t border-black/5">
        {[form.primaryColor, form.secondaryColor, form.accentColor].map((c, i) => (
          <div
            key={i}
            className="flex-1 h-4"
            style={{ background: c }}
            title={['Primary', 'Secondary', 'Accent'][i] + ': ' + c}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ThemesPage() {
  const [themes, setThemes] = useState<(Theme & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Theme, 'id'>>(EMPTY_FORM);

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadThemes = () => {
    setLoading(true);
    themesCollection
      .list()
      .then(setThemes)
      .catch(() => toast.error('Failed to load themes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadThemes(); }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (theme: Theme) => {
    setEditingId(theme.id);
    setForm({
      name: theme.name,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      fontFamily: theme.fontFamily,
      borderRadius: theme.borderRadius,
      buttonStyle: theme.buttonStyle,
      previewImageUrl: theme.previewImageUrl ?? '',
    });
    setShowForm(true);
  };

  const applyPreset = (preset: Omit<Theme, 'id'>) => {
    setForm((f) => ({ ...f, ...preset }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Theme name is required'); return; }
    setSaving(true);
    const payload = {
      ...form,
      previewImageUrl: form.previewImageUrl || undefined,
    };
    try {
      if (editingId) {
        await themesCollection.update(editingId, payload);
        setThemes((prev) =>
          prev.map((t) => (t.id === editingId ? { ...t, ...payload } : t)),
        );
        toast.success('Theme updated');
      } else {
        const id = await themesCollection.create(payload);
        setThemes((prev) => [{ id, ...payload }, ...prev]);
        toast.success('Theme created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch {
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (theme: Theme) => {
    if (!confirm(`Delete theme "${theme.name}"? This cannot be undone.`)) return;
    setDeleting(theme.id);
    try {
      await themesCollection.remove(theme.id);
      setThemes((prev) => prev.filter((t) => t.id !== theme.id));
      toast.success('Theme deleted');
    } catch {
      toast.error('Failed to delete theme');
    } finally {
      setDeleting(null);
    }
  };

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Theme Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create and manage visual themes for your event pages
          </p>
        </div>
        <button
          onClick={showForm ? () => { setShowForm(false); setEditingId(null); } : openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
          style={{
            background: showForm
              ? '#f3f4f6'
              : 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)',
            color: showForm ? '#374151' : '#1a1a2e',
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Theme'}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
            {editingId ? 'Edit Theme' : 'New Theme'}
          </h2>

          {/* Preset chips */}
          <div>
            <p className={labelCls}>Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_THEMES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: preset.primaryColor }}
                  />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className={labelCls}>
                  Theme Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Luxury Gold"
                  className={inputCls}
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { key: 'primaryColor', label: 'Primary' },
                    { key: 'secondaryColor', label: 'Secondary' },
                    { key: 'accentColor', label: 'Accent' },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2 py-1.5 bg-white focus-within:ring-2 focus-within:ring-yellow-400/40">
                      <input
                        type="color"
                        value={form[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border-none bg-transparent p-0"
                        title={`Pick ${label} color`}
                      />
                      <input
                        type="text"
                        value={form[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        className="flex-1 min-w-0 text-xs font-mono text-gray-700 bg-transparent focus:outline-none"
                        maxLength={7}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Font Family */}
              <div>
                <label className={labelCls}>Font Family</label>
                <select
                  value={form.fontFamily}
                  onChange={(e) => setField('fontFamily', e.target.value)}
                  className={inputCls}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Border Radius */}
              <div>
                <label className={labelCls}>Border Radius</label>
                <select
                  value={form.borderRadius}
                  onChange={(e) => setField('borderRadius', e.target.value)}
                  className={inputCls}
                >
                  {BORDER_RADIUS_OPTIONS.map((r) => (
                    <option key={r} value={r} className="capitalize">
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Button Style */}
              <div>
                <label className={labelCls}>Button Style</label>
                <select
                  value={form.buttonStyle}
                  onChange={(e) => setField('buttonStyle', e.target.value as ButtonStyle)}
                  className={inputCls}
                >
                  {BUTTON_STYLE_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview image */}
              <ImageUrlInput
                label="Preview Image URL"
                value={form.previewImageUrl ?? ''}
                onChange={(v) => setField('previewImageUrl', v)}
                placeholder="https://example.com/theme-preview.jpg"
              />
            </div>

            {/* Right column: live preview */}
            <div className="space-y-3">
              <p className={labelCls}>Live Preview</p>
              <MiniPreview form={form} />
              <p className="text-xs text-gray-400 text-center">
                Font: <span style={{ fontFamily: form.fontFamily }}>{form.fontFamily}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)', color: '#1a1a2e' }}
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? 'Saving…' : editingId ? 'Update Theme' : 'Create Theme'}
            </button>
          </div>
        </div>
      )}

      {/* Themes grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="h-10 bg-gray-100 rounded-lg" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full" />
                <div className="w-6 h-6 bg-gray-100 rounded-full" />
                <div className="w-6 h-6 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Palette size={48} className="text-gray-200" />
          <p className="text-gray-400 font-medium">No themes yet</p>
          <p className="text-gray-300 text-sm">Create your first theme or use a preset to get started.</p>
          <button
            onClick={openCreate}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)', color: '#1a1a2e' }}
          >
            <Plus size={14} />
            Create Theme
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {themes.map((theme) => (
            <div key={theme.id} className={deleting === theme.id ? 'opacity-50 pointer-events-none' : ''}>
              <ThemeCard
                theme={theme}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && themes.length > 0 && (
        <p className="text-xs text-gray-400 text-center pb-4">
          {themes.length} theme{themes.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
