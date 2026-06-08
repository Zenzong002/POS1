'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, Feather, Eye, EyeOff } from 'lucide-react';
import { eventSectionsCollection } from '@/lib/firebase/firestore';
import type { FloatingDecorationConfig, FloatingAnimationType } from '@/lib/types';

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-colors placeholder-gray-300';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className="relative w-10 h-5 rounded-full transition-colors"
        style={{ background: checked ? '#D4AF37' : '#e5e7eb' }}
      >
        <div
          className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-gray-800">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-yellow-500"
      />
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

interface PresetOption {
  value: FloatingDecorationConfig['preset'];
  emoji: string;
  label: string;
}

const PRESETS: PresetOption[] = [
  { value: 'flowers', emoji: '🌸', label: 'Flowers' },
  { value: 'leaves', emoji: '🍃', label: 'Leaves' },
  { value: 'sparkles', emoji: '✨', label: 'Sparkles' },
  { value: 'particles', emoji: '🔵', label: 'Particles' },
  { value: 'custom', emoji: '🖼️', label: 'Custom' },
  { value: 'none', emoji: '🚫', label: 'None' },
];

const ANIMATION_TYPES: { value: FloatingAnimationType; label: string; hint: string }[] = [
  { value: 'fall', label: 'Fall', hint: 'Elements fall from top' },
  { value: 'float', label: 'Float', hint: 'Elements gently float' },
  { value: 'sparkle', label: 'Sparkle', hint: 'Twinkling effect' },
  { value: 'drift', label: 'Drift', hint: 'Drifts across the screen' },
];

const defaults: FloatingDecorationConfig = {
  enabled: false,
  preset: 'flowers',
  imageUrl: '',
  speed: 5,
  density: 15,
  opacity: 0.7,
  animationType: 'fall',
};

// ─── CSS demo animation ───────────────────────────────────────────────────────

const DEMO_KEYFRAMES = `
@keyframes floatDemo {
  0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
}
@keyframes sparkleDemo {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1.2); }
}
`;

const presetEmoji: Record<string, string> = {
  flowers: '🌸', leaves: '🍃', sparkles: '✨', particles: '●', custom: '●', none: '',
};

function FloatingPreview({
  config,
}: {
  config: FloatingDecorationConfig;
}) {
  const emoji = presetEmoji[config.preset ?? 'flowers'] ?? '🌸';
  const count = Math.min(config.density, 20);
  const duration = 12 / config.speed;
  const animName = config.animationType === 'sparkle' ? 'sparkleDemo' : 'floatDemo';

  return (
    <div
      className="relative w-full h-36 rounded-xl overflow-hidden"
      style={{ background: '#f0fdf4' }}
    >
      <style>{DEMO_KEYFRAMES}</style>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute text-lg select-none pointer-events-none"
          style={{
            left: `${(i / count) * 100}%`,
            top: `${Math.random() * 60}%`,
            opacity: config.opacity,
            animation: `${animName} ${duration + Math.random() * 2}s ${
              Math.random() * duration
            }s linear infinite`,
            fontSize: config.preset === 'particles' ? '8px' : '18px',
          }}
        >
          {config.imageUrl && config.preset === 'custom' ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={config.imageUrl} alt="" style={{ width: 20, height: 20 }} />
          ) : (
            emoji
          )}
        </span>
      ))}
      <p className="absolute bottom-2 left-2 text-xs text-green-600 font-medium opacity-70">
        Preview ({count} elements shown)
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FloatingPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<FloatingDecorationConfig>(defaults);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!id) return;
    eventSectionsCollection
      .getByEventId(id)
      .then((sections) => {
        if (sections?.visualSettings?.floatingDecorations) {
          setConfig({ ...defaults, ...sections.visualSettings.floatingDecorations });
        }
      })
      .catch(() => toast.error('Failed to load floating decoration settings'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof FloatingDecorationConfig>(
    key: K,
    value: FloatingDecorationConfig[K]
  ) => setConfig((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await eventSectionsCollection.save(id, {
        visualSettings: { floatingDecorations: config },
      } as Parameters<typeof eventSectionsCollection.save>[1]);
      toast.success('Floating decoration settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-80 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
        <span className="text-gray-700 font-medium">Floating Decorations</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Feather size={22} style={{ color: '#ec4899' }} />
            Floating Decorations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Add floating elements that drift across your event page
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-opacity hover:opacity-90 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)',
            color: '#1a1a2e',
          }}
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* Enabled toggle + preview button */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-4">
        <Toggle
          checked={config.enabled}
          onChange={(v) => set('enabled', v)}
          label="Enable Floating Decorations"
        />
        <button
          type="button"
          onClick={() => setShowPreview((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* Live preview */}
      {showPreview && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">Animation Preview</p>
          <FloatingPreview config={config} />
        </div>
      )}

      {/* Settings (shown regardless of enabled, so admin can configure before enabling) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {/* Preset selector */}
        <div>
          <label className={labelCls}>Preset</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1">
            {PRESETS.map((preset) => {
              const active = config.preset === preset.value;
              return (
                <button
                  key={preset.value ?? 'none'}
                  onClick={() => set('preset', preset.value)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all"
                  style={{
                    borderColor: active ? '#ec4899' : '#f3f4f6',
                    background: active ? '#fce7f3' : 'white',
                  }}
                >
                  <span className="text-xl">{preset.emoji}</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: active ? '#be185d' : '#6b7280' }}
                  >
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom image URL (only when preset = custom) */}
        {config.preset === 'custom' && (
          <div>
            <label className={labelCls}>Custom Image URL</label>
            <input
              type="url"
              value={config.imageUrl ?? ''}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="https://example.com/petal.png"
              className={inputCls}
            />
          </div>
        )}

        <div className="border-t border-gray-50" />

        {/* Sliders */}
        <Slider
          label="Speed"
          value={config.speed}
          min={1}
          max={10}
          onChange={(v) => set('speed', v)}
        />
        <Slider
          label="Density"
          value={config.density}
          min={1}
          max={50}
          format={(v) => `${v} elements`}
          onChange={(v) => set('density', v)}
        />
        <Slider
          label="Opacity"
          value={config.opacity}
          min={0}
          max={1}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => set('opacity', v)}
        />

        <div className="border-t border-gray-50" />

        {/* Animation type */}
        <div>
          <label className={labelCls}>Animation Type</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {ANIMATION_TYPES.map((a) => {
              const active = config.animationType === a.value;
              return (
                <button
                  key={a.value}
                  onClick={() => set('animationType', a.value)}
                  className="flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: active ? '#ec4899' : '#f3f4f6',
                    background: active ? '#fce7f3' : 'white',
                  }}
                >
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: active ? '#be185d' : '#374151' }}
                    >
                      {a.label}
                    </p>
                    <p className="text-xs text-gray-400">{a.hint}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)',
            color: '#1a1a2e',
          }}
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
