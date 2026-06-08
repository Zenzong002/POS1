'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, Zap, RotateCcw, CopyCheck } from 'lucide-react';
import { eventSectionsCollection } from '@/lib/firebase/firestore';
import type { AnimationType, SectionAnimationConfig } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const ANIMATION_TYPES: { value: AnimationType; label: string; hint: string }[] = [
  { value: 'none', label: 'None', hint: 'No animation' },
  { value: 'fade_up', label: 'Fade Up', hint: 'Slides in from below' },
  { value: 'fade_down', label: 'Fade Down', hint: 'Slides in from above' },
  { value: 'fade_left', label: 'Fade Left', hint: 'Slides in from right' },
  { value: 'fade_right', label: 'Fade Right', hint: 'Slides in from left' },
  { value: 'scale_in', label: 'Scale In', hint: 'Grows from small' },
  { value: 'zoom_in', label: 'Zoom In', hint: 'Zooms into view' },
  { value: 'blur_reveal', label: 'Blur Reveal', hint: 'Unblurs from fuzzy' },
  { value: 'parallax', label: 'Parallax', hint: 'Depth scrolling effect' },
];

interface SectionDef {
  key: keyof SectionAnimationConfig;
  label: string;
  color: string;
}

const SECTIONS: SectionDef[] = [
  { key: 'heroAnimation', label: 'Hero', color: '#D4AF37' },
  { key: 'storyAnimation', label: 'Story', color: '#6366f1' },
  { key: 'timelineAnimation', label: 'Timeline', color: '#8b5cf6' },
  { key: 'scheduleAnimation', label: 'Schedule', color: '#0ea5e9' },
  { key: 'galleryAnimation', label: 'Gallery', color: '#ec4899' },
  { key: 'locationAnimation', label: 'Location', color: '#22c55e' },
  { key: 'rsvpAnimation', label: 'RSVP', color: '#f59e0b' },
  { key: 'blessingAnimation', label: 'Blessing', color: '#ef4444' },
  { key: 'giftAnimation', label: 'Gift', color: '#14b8a6' },
];

const defaultAnimations = (): SectionAnimationConfig => ({
  heroAnimation: 'none',
  storyAnimation: 'fade_up',
  timelineAnimation: 'fade_up',
  scheduleAnimation: 'fade_up',
  galleryAnimation: 'fade_up',
  locationAnimation: 'fade_up',
  rsvpAnimation: 'fade_up',
  blessingAnimation: 'fade_up',
  giftAnimation: 'fade_up',
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnimationsPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [animations, setAnimations] = useState<SectionAnimationConfig>(defaultAnimations());
  const [applyAllValue, setApplyAllValue] = useState<AnimationType>('fade_up');

  useEffect(() => {
    if (!id) return;
    eventSectionsCollection
      .getByEventId(id)
      .then((sections) => {
        if (sections?.visualSettings?.sectionAnimations) {
          setAnimations({ ...defaultAnimations(), ...sections.visualSettings.sectionAnimations });
        }
      })
      .catch(() => toast.error('Failed to load animation settings'))
      .finally(() => setLoading(false));
  }, [id]);

  const setAnimation = (key: keyof SectionAnimationConfig, value: AnimationType) =>
    setAnimations((prev) => ({ ...prev, [key]: value }));

  const applyAll = () => {
    const updated = Object.fromEntries(
      SECTIONS.map((s) => [s.key, applyAllValue])
    ) as unknown as SectionAnimationConfig;
    setAnimations(updated);
    toast.success(`Applied "${applyAllValue}" to all sections`);
  };

  const resetAll = () => {
    setAnimations(defaultAnimations());
    toast('Reset all animations');
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await eventSectionsCollection.save(id, {
        visualSettings: { sectionAnimations: animations },
      } as Parameters<typeof eventSectionsCollection.save>[1]);
      toast.success('Animation settings saved!');
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
        <div className="h-96 bg-gray-100 rounded-2xl" />
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
        <span className="text-gray-700 font-medium">Section Animations</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap size={22} style={{ color: '#f59e0b' }} />
            Section Animations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Set entrance animations for each section of your event page
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

      {/* Bulk actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-600 shrink-0">Bulk actions:</span>
        <select
          value={applyAllValue}
          onChange={(e) => setApplyAllValue(e.target.value as AnimationType)}
          className="flex-1 min-w-[140px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
        >
          {ANIMATION_TYPES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <button
          onClick={applyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
        >
          <CopyCheck size={14} />
          Apply All
        </button>
        <button
          onClick={resetAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors text-gray-400"
        >
          <RotateCcw size={14} />
          Reset All
        </button>
      </div>

      {/* Section list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {SECTIONS.map((section, idx) => {
          const currentAnim = animations[section.key];
          const animDef = ANIMATION_TYPES.find((a) => a.value === currentAnim);
          return (
            <div
              key={section.key}
              className={`flex items-center gap-4 px-6 py-4 ${
                idx !== SECTIONS.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              {/* Color dot + label */}
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: section.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{section.label}</p>
                {animDef && currentAnim !== 'none' && (
                  <p className="text-xs text-gray-400">{animDef.hint}</p>
                )}
              </div>

              {/* Animation selector */}
              <select
                value={currentAnim}
                onChange={(e) =>
                  setAnimation(section.key, e.target.value as AnimationType)
                }
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 min-w-[140px]"
              >
                {ANIMATION_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>

              {/* Active badge */}
              {currentAnim !== 'none' && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{ background: `${section.color}15`, color: section.color }}
                >
                  Active
                </span>
              )}
            </div>
          );
        })}
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
