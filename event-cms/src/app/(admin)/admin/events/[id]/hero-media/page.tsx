'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  Loader2,
  Film,
  ExternalLink,
  ImageIcon,
  Wind,
  Video,
  PlayCircle,
  ChevronDown,
} from 'lucide-react';
import { eventsCollection, eventSectionsCollection } from '@/lib/firebase/firestore';
import type {
  HeroMode,
  HeroMediaSettings,
  KenBurnsDirection,
} from '@/lib/types';

// ─── Shared styles ─────────────────────────────────────────────────────────────

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

// ─── Mode card ────────────────────────────────────────────────────────────────

interface ModeOption {
  mode: HeroMode;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const MODES: ModeOption[] = [
  {
    mode: 'static',
    label: 'Static Image',
    description: 'A fixed background image',
    icon: ImageIcon,
    color: '#6366f1',
  },
  {
    mode: 'ken_burns',
    label: 'Ken Burns',
    description: 'Slow pan & zoom on image',
    icon: Wind,
    color: '#f59e0b',
  },
  {
    mode: 'video_background',
    label: 'Video Background',
    description: 'Looping video behind content',
    icon: Video,
    color: '#ec4899',
  },
  {
    mode: 'intro_video',
    label: 'Intro Video',
    description: 'Full-screen video before main page',
    icon: PlayCircle,
    color: '#14b8a6',
  },
];

const KB_DIRECTIONS: { value: KenBurnsDirection; label: string }[] = [
  { value: 'zoom_in', label: 'Zoom In' },
  { value: 'zoom_out', label: 'Zoom Out' },
  { value: 'pan_left', label: 'Pan Left' },
  { value: 'pan_right', label: 'Pan Right' },
];

// ─── Default settings ─────────────────────────────────────────────────────────

const defaultSettings = (): HeroMediaSettings => ({
  mode: 'static',
  imageUrl: '',
  kenBurns: { direction: 'zoom_in', duration: 20, scale: 1.2 },
  videoBackground: {
    videoUrl: '',
    posterUrl: '',
    autoplay: true,
    loop: true,
    muted: true,
    overlayOpacity: 0.4,
  },
  introVideo: { videoUrl: '', skipEnabled: true, autoSkipSeconds: 0 },
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HeroMediaPage() {
  const { id } = useParams<{ id: string }>();
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HeroMediaSettings>(defaultSettings());

  useEffect(() => {
    if (!id) return;
    Promise.all([
      eventsCollection.get(id),
      eventSectionsCollection.getByEventId(id),
    ])
      .then(([ev, sections]) => {
        if (ev) setSlug(ev.slug);
        if (sections?.visualSettings?.heroMedia) {
          setSettings({ ...defaultSettings(), ...sections.visualSettings.heroMedia });
        }
      })
      .catch(() => toast.error('Failed to load hero media settings'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof HeroMediaSettings>(key: K, value: HeroMediaSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await eventSectionsCollection.save(id, {
        visualSettings: { heroMedia: settings },
      } as Parameters<typeof eventSectionsCollection.save>[1]);
      toast.success('Hero media settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  const activeMode = settings.mode;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
        <span className="text-gray-700 font-medium">Hero Media</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Film size={22} style={{ color: '#6366f1' }} />
            Hero Media Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose how the hero section background is displayed
          </p>
        </div>
        <div className="flex items-center gap-2">
          {slug && (
            <Link
              href={`/event/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
            >
              <ExternalLink size={14} />
              Preview
            </Link>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
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

      {/* Mode selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Select Hero Mode
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MODES.map(({ mode, label, description, icon: Icon, color }) => {
            const active = activeMode === mode;
            return (
              <button
                key={mode}
                onClick={() => set('mode', mode)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all"
                style={{
                  borderColor: active ? color : '#f3f4f6',
                  background: active ? `${color}10` : 'white',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}20` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: active ? color : '#374151' }}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode-specific settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* ── Static Image ─────────────────────────────────────────────────── */}
        {activeMode === 'static' && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Static Image Settings
            </h2>
            <div>
              <label className={labelCls}>Image URL</label>
              <input
                type="url"
                value={settings.imageUrl ?? ''}
                onChange={(e) => set('imageUrl', e.target.value)}
                placeholder="https://example.com/hero.jpg"
                className={inputCls}
              />
            </div>
            {settings.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 h-40 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.imageUrl}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.2';
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* ── Ken Burns ────────────────────────────────────────────────────── */}
        {activeMode === 'ken_burns' && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Ken Burns Settings
            </h2>
            <div>
              <label className={labelCls}>Image URL</label>
              <input
                type="url"
                value={settings.imageUrl ?? ''}
                onChange={(e) => set('imageUrl', e.target.value)}
                placeholder="https://example.com/hero.jpg"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Direction</label>
              <div className="relative">
                <select
                  value={settings.kenBurns?.direction ?? 'zoom_in'}
                  onChange={(e) =>
                    set('kenBurns', {
                      ...settings.kenBurns!,
                      direction: e.target.value as KenBurnsDirection,
                    })
                  }
                  className={inputCls + ' appearance-none pr-10'}
                >
                  {KB_DIRECTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            <Slider
              label="Duration"
              value={settings.kenBurns?.duration ?? 20}
              min={5}
              max={60}
              format={(v) => `${v}s`}
              onChange={(v) =>
                set('kenBurns', { ...settings.kenBurns!, duration: v })
              }
            />
            <Slider
              label="Scale"
              value={settings.kenBurns?.scale ?? 1.2}
              min={1.0}
              max={1.5}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={(v) =>
                set('kenBurns', { ...settings.kenBurns!, scale: v })
              }
            />
          </>
        )}

        {/* ── Video Background ─────────────────────────────────────────────── */}
        {activeMode === 'video_background' && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Video Background Settings
            </h2>
            <div>
              <label className={labelCls}>Video URL</label>
              <input
                type="url"
                value={settings.videoBackground?.videoUrl ?? ''}
                onChange={(e) =>
                  set('videoBackground', {
                    ...settings.videoBackground!,
                    videoUrl: e.target.value,
                  })
                }
                placeholder="https://example.com/video.mp4"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Poster / Fallback Image URL</label>
              <input
                type="url"
                value={settings.videoBackground?.posterUrl ?? ''}
                onChange={(e) =>
                  set('videoBackground', {
                    ...settings.videoBackground!,
                    posterUrl: e.target.value,
                  })
                }
                placeholder="https://example.com/poster.jpg"
                className={inputCls}
              />
            </div>

            <div className="space-y-3 pt-1">
              <Toggle
                checked={settings.videoBackground?.autoplay ?? true}
                onChange={(v) =>
                  set('videoBackground', {
                    ...settings.videoBackground!,
                    autoplay: v,
                  })
                }
                label="Autoplay"
              />
              <Toggle
                checked={settings.videoBackground?.loop ?? true}
                onChange={(v) =>
                  set('videoBackground', {
                    ...settings.videoBackground!,
                    loop: v,
                  })
                }
                label="Loop"
              />
              <Toggle
                checked={settings.videoBackground?.muted ?? true}
                onChange={(v) =>
                  set('videoBackground', {
                    ...settings.videoBackground!,
                    muted: v,
                  })
                }
                label="Muted"
              />
            </div>

            <Slider
              label="Overlay Opacity"
              value={settings.videoBackground?.overlayOpacity ?? 0.4}
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(v) =>
                set('videoBackground', {
                  ...settings.videoBackground!,
                  overlayOpacity: v,
                })
              }
            />
          </>
        )}

        {/* ── Intro Video ──────────────────────────────────────────────────── */}
        {activeMode === 'intro_video' && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Intro Video Settings
            </h2>
            <div>
              <label className={labelCls}>Video URL</label>
              <input
                type="url"
                value={settings.introVideo?.videoUrl ?? ''}
                onChange={(e) =>
                  set('introVideo', {
                    ...settings.introVideo!,
                    videoUrl: e.target.value,
                  })
                }
                placeholder="https://example.com/intro.mp4"
                className={inputCls}
              />
            </div>

            <Toggle
              checked={settings.introVideo?.skipEnabled ?? true}
              onChange={(v) =>
                set('introVideo', {
                  ...settings.introVideo!,
                  skipEnabled: v,
                })
              }
              label="Enable Skip Button"
            />

            <div>
              <label className={labelCls}>
                Auto-Skip After (seconds) &mdash;{' '}
                <span className="text-gray-400 font-normal">0 = no auto-skip</span>
              </label>
              <input
                type="number"
                min={0}
                value={settings.introVideo?.autoSkipSeconds ?? 0}
                onChange={(e) =>
                  set('introVideo', {
                    ...settings.introVideo!,
                    autoSkipSeconds: Number(e.target.value),
                  })
                }
                className={inputCls}
              />
            </div>
          </>
        )}
      </div>

      {/* Bottom save bar */}
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
