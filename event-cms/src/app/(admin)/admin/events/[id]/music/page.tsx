'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, Music, Info } from 'lucide-react';
import { eventSectionsCollection } from '@/lib/firebase/firestore';
import type { MusicSettings } from '@/lib/types';

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
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        onClick={() => onChange(!checked)}
        className="mt-0.5 relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0"
        style={{ background: checked ? '#D4AF37' : '#e5e7eb' }}
      >
        <div
          className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaults: MusicSettings = {
  musicUrl: '',
  musicTitle: '',
  autoPlay: false,
  loop: true,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MusicSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<MusicSettings>(defaults);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!id) return;
    eventSectionsCollection
      .getByEventId(id)
      .then((sections) => {
        if (sections?.visualSettings?.musicSettings) {
          setSettings({ ...defaults, ...sections.visualSettings.musicSettings });
        }
      })
      .catch(() => toast.error('Failed to load music settings'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof MusicSettings>(key: K, value: MusicSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await eventSectionsCollection.save(id, {
        visualSettings: { musicSettings: settings },
      } as Parameters<typeof eventSectionsCollection.save>[1]);
      toast.success('Music settings saved!');
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
        <span className="text-gray-700 font-medium">Music Settings</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Music size={22} style={{ color: '#ec4899' }} />
            Music Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure background music for your event page
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

      {/* Notice */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl border text-sm"
        style={{ background: '#fffbeb', borderColor: '#fde68a' }}
      >
        <Info size={16} className="mt-0.5 shrink-0" style={{ color: '#b45309' }} />
        <p style={{ color: '#92400e' }}>
          <span className="font-semibold">Note:</span> Browsers may block autoplay. Music will
          play on first user interaction.
        </p>
      </div>

      {/* Settings card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {/* Music URL */}
        <div>
          <label className={labelCls}>Background Music URL</label>
          <input
            type="url"
            value={settings.musicUrl ?? ''}
            onChange={(e) => set('musicUrl', e.target.value)}
            placeholder="https://example.com/music.mp3"
            className={inputCls}
          />
          {/* Native audio preview */}
          {settings.musicUrl && (
            <div className="mt-3">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio
                ref={audioRef}
                key={settings.musicUrl}
                src={settings.musicUrl}
                controls
                className="w-full rounded-lg"
                style={{ height: 40 }}
              />
            </div>
          )}
        </div>

        {/* Music title */}
        <div>
          <label className={labelCls}>Music Title</label>
          <input
            type="text"
            value={settings.musicTitle ?? ''}
            onChange={(e) => set('musicTitle', e.target.value)}
            placeholder="e.g. A Thousand Years — Christina Perri"
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1">
            Displayed in the floating music player on the event page.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-50" />

        {/* Toggles */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Playback Options
          </h3>
          <Toggle
            checked={settings.autoPlay}
            onChange={(v) => set('autoPlay', v)}
            label="Auto Play"
            description="Start playing automatically when the page loads (subject to browser restrictions)."
          />
          <Toggle
            checked={settings.loop}
            onChange={(v) => set('loop', v)}
            label="Loop"
            description="Repeat the track when it finishes."
          />
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
