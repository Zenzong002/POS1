'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { eventsCollection, themesCollection } from '@/lib/firebase/firestore';
import { generateSlug } from '@/lib/utils';
import type { EventType, EventStatus, Template, Theme } from '@/lib/types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and hyphens'),
  eventType: z.enum(['wedding', 'birthday', 'housewarming', 'community', 'family_gathering']),
  templateId: z.string().min(1, 'Please select a template'),
  themeId: z.string().min(1, 'Please select a theme'),
  status: z.enum(['draft', 'published', 'archived']),
});

type FormValues = z.infer<typeof schema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'housewarming', label: 'Housewarming' },
  { value: 'community', label: 'Community' },
  { value: 'family_gathering', label: 'Family Gathering' },
];

const STATUS_OPTIONS: { value: EventStatus; label: string; desc: string }[] = [
  { value: 'draft', label: 'Draft', desc: 'Only visible to you' },
  { value: 'published', label: 'Published', desc: 'Live and accessible by guests' },
  { value: 'archived', label: 'Archived', desc: 'Hidden from guests' },
];

// ─── Field styles ─────────────────────────────────────────────────────────────

const inputCls = [
  'w-full px-4 py-2.5 border rounded-xl text-sm bg-white',
  'focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400',
  'transition-colors placeholder-gray-300',
].join(' ');

const errorCls = 'text-xs text-red-500 mt-1';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewEventPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<(Template & { id: string })[]>([]);
  const [themes, setThemes] = useState<(Theme & { id: string })[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      eventType: 'wedding',
      templateId: '',
      themeId: '',
      status: 'draft',
    },
  });

  const titleValue = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (titleValue) {
      setValue('slug', generateSlug(titleValue), { shouldValidate: true });
    }
  }, [titleValue, setValue]);

  // Load templates & themes
  useEffect(() => {
    // Static template defaults (no dedicated Firestore collection yet)
    setTemplates([
      { id: 'classic', name: 'Classic', eventType: 'wedding', description: 'Elegant classic layout' },
      { id: 'modern', name: 'Modern', eventType: 'birthday', description: 'Clean modern layout' },
      { id: 'minimal', name: 'Minimal', eventType: 'housewarming', description: 'Simple minimal layout' },
    ]);

    themesCollection.list()
      .then(setThemes)
      .catch(() => setThemes([]))
      .finally(() => setLoadingMeta(false));
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const id = await eventsCollection.create({
        title: values.title,
        slug: values.slug,
        eventType: values.eventType,
        templateId: values.templateId,
        themeId: values.themeId,
        status: values.status,
        userId: 'admin',
      });
      toast.success('Event created!');
      router.push(`/admin/events/${id}`);
    } catch {
      toast.error('Failed to create event. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/events"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Events
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-sm font-medium text-gray-700">New Event</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={22} style={{ color: '#D4AF37' }} />
          Create New Event
        </h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to create your event page.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Card: Basic Info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Basic Information</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Event Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Sarah & John's Wedding"
              className={`${inputCls} ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
            />
            {errors.title && <p className={errorCls}>{errors.title.message}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              URL Slug <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400/40"
              style={{ borderColor: errors.slug ? '#fca5a5' : '#e5e7eb' }}>
              <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 shrink-0">
                /events/
              </span>
              <input
                {...register('slug')}
                placeholder="sarah-john-wedding"
                className="flex-1 px-3 py-2.5 text-sm bg-white focus:outline-none"
              />
            </div>
            {errors.slug && <p className={errorCls}>{errors.slug.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Auto-generated from title. Lowercase letters, numbers and hyphens only.</p>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Event Type <span className="text-red-400">*</span>
            </label>
            <select
              {...register('eventType')}
              className={`${inputCls} ${errors.eventType ? 'border-red-300' : 'border-gray-200'}`}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.eventType && <p className={errorCls}>{errors.eventType.message}</p>}
          </div>
        </div>

        {/* Card: Template & Theme */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Design</h2>

          {loadingMeta ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Template <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('templateId')}
                  className={`${inputCls} ${errors.templateId ? 'border-red-300' : 'border-gray-200'}`}
                >
                  <option value="">Select a template…</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors.templateId && <p className={errorCls}>{errors.templateId.message}</p>}
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Theme <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('themeId')}
                  className={`${inputCls} ${errors.themeId ? 'border-red-300' : 'border-gray-200'}`}
                >
                  <option value="">Select a theme…</option>
                  {themes.length > 0 ? (
                    themes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))
                  ) : (
                    <option value="default">Default Theme</option>
                  )}
                </select>
                {errors.themeId && <p className={errorCls}>{errors.themeId.message}</p>}
              </div>
            </>
          )}
        </div>

        {/* Card: Status */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Publication Status</h2>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors hover:bg-gray-50"
                style={{ borderColor: '#e5e7eb' }}
              >
                <input
                  type="radio"
                  value={opt.value}
                  {...register('status')}
                  className="accent-yellow-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            href="/admin/events"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-[#1a1a2e] disabled:opacity-60 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)' }}
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? 'Creating…' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
