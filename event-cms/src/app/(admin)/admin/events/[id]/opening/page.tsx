'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Play,
  Pause,
} from 'lucide-react';
import { eventSectionsCollection } from '@/lib/firebase/firestore';
import type { OpeningSettings, OpeningStyle } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-colors placeholder-gray-300';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

interface StyleOption {
  style: OpeningStyle;
  emoji: string;
  label: string;
  description: string;
  preview: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    style: 'envelope',
    emoji: '✉️',
    label: 'Envelope',
    description: 'Classic envelope opening animation',
    preview: 'The envelope flap opens from the center revealing your invitation.',
  },
  {
    style: 'curtain',
    emoji: '🎭',
    label: 'Curtain',
    description: 'Dramatic curtain reveal',
    preview: 'Two curtains sweep apart from the center to reveal your event page.',
  },
  {
    style: 'fade',
    emoji: '🌅',
    label: 'Fade',
    description: 'Elegant fade reveal',
    preview: 'The invitation gently fades into view with smooth opacity transition.',
  },
  {
    style: 'flower_bloom',
    emoji: '🌸',
    label: 'Flower Bloom',
    description: 'Romantic flower animation',
    preview: 'Petals bloom outward from the center in a romantic flower animation.',
  },
  {
    style: 'none',
    emoji: '⏩',
    label: 'None',
    description: 'No opening animation',
    preview: 'Guests go directly to the event page without any opening sequence.',
  },
];

const defaults: OpeningSettings = {
  style: 'fade',
  musicUrl: '',
  musicTitle: '',
  duration: 3,
  buttonText: 'Open Invitation',
};

// ─── Audio preview ─────────────────────────────────────────────────────────────

function AudioPreview({ url }: { url?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current || !url) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  useEffect(() => {
    setPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  }, [url]);

  if (!url) return null;

  return (
    <div className="mt-2 flex items-center gap-3">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
        {playing ? 'Pause' : 'Play Preview'}
      </button>
      <span className="text-xs text-gray-400 truncate max-w-[180px]">{url}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OpeningPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<OpeningSettings>(defaults);

  useEffect(() => {
    if (!id) return;
    eventSectionsCollection
      .getByEventId(id)
      .then((sections) => {
        if (sections?.visualSettings?.openingSettings) {
          setSettings({ ...defaults, ...sections.visualSettings.openingSettings });
        }
      })
      .catch(() => toast.error('Failed to load opening settings'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof OpeningSettings>(key: K, value: OpeningSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await eventSectionsCollection.save(id, {
        visualSettings: { openingSettings: settings },
      } as Parameters<typeof eventSectionsCollection.save>[1]);
      toast.success('Opening settings saved!');
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
        <div className="h-64 bg-gray-100 rounded-2xl" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  const selectedOption = STYLE_OPTIONS.find((o) => o.style === settings.style);

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
        <span className="text-gray-700 font-medium">Opening Animation</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={22} style={{ color: '#8b5cf6' }} />
            Opening Animation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure how guests experience the opening of your invitation
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

      {/* Opening style selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Opening Style
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STYLE_OPTIONS.map((opt) => {
            const active = settings.style === opt.style;
            return (
              <button
                key={opt.style}
                onClick={() => set('style', opt.style)}
                className="text-left p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: active ? '#8b5cf6' : '#f3f4f6',
                  background: active ? '#8b5cf610' : 'white',
                }}
              >
                <div className="text-2xl mb-2">{opt.emoji}</div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: active ? '#8b5cf6' : '#111827' }}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
              </button>
            );
          })}
        </div>

        {/* Preview description */}
        {selectedOption && selectedOption.style !== 'none' && (
          <div
            className="mt-4 p-4 rounded-xl text-sm text-gray-600 border"
            style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}
          >
            <span className="font-semibold text-purple-700">Preview: </span>
            {selectedOption.preview}
          </div>
        )}
      </div>

      {/* Music & config */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Music & Configuration
        </h2>

        <div>
          <label className={labelCls}>Opening Music URL</label>
          <input
            type="url"
            value={settings.musicUrl ?? ''}
            onChange={(e) => set('musicUrl', e.target.value)}
            placeholder="https://example.com/music.mp3"
            className={inputCls}
          />
          <AudioPreview url={settings.musicUrl} />
        </div>

        <div>
          <label className={labelCls}>Music Title</label>
          <input
            type="text"
            value={settings.musicTitle ?? ''}
            onChange={(e) => set('musicTitle', e.target.value)}
            placeholder="e.g. A Thousand Years"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            Duration <span className="text-gray-400 font-normal">(seconds)</span>
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={settings.duration}
            onChange={(e) => set('duration', Number(e.target.value))}
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1">
            How long the opening animation plays before revealing the page.
          </p>
        </div>

        <div>
          <label className={labelCls}>Button Text</label>
          <input
            type="text"
            value={settings.buttonText ?? 'Open Invitation'}
            onChange={(e) => set('buttonText', e.target.value)}
            placeholder="Open Invitation"
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1">
            Text on the button guests click to open the invitation.
          </p>
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
