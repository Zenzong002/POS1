'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, ExternalLink, Sparkles, ImageIcon } from 'lucide-react';
import { eventsCollection, eventSectionsCollection } from '@/lib/firebase/firestore';
import type { HeroData } from '@/lib/types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  eventTitle: z.string().min(1, 'Event title is required'),
  subtitle: z.string().optional(),
  hostName: z.string().min(1, 'Host name is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  countdownDate: z.string().min(1, 'Countdown date is required'),
  heroBackgroundUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  coverImageUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-colors placeholder-gray-300';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';
const errorCls = 'text-xs text-red-500 mt-1';

// ─── Image preview ────────────────────────────────────────────────────────────

function ImagePreview({ url, label }: { url?: string; label: string }) {
  if (!url) {
    return (
      <div className="mt-2 h-28 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-300">
        <ImageIcon size={20} />
        <span className="text-sm">No {label} set</span>
      </div>
    );
  }
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 h-28 relative bg-gray-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={label} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HeroManagerPage() {
  const { id } = useParams<{ id: string }>();
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventTitle: '',
      subtitle: '',
      hostName: '',
      eventDate: '',
      countdownDate: '',
      heroBackgroundUrl: '',
      coverImageUrl: '',
    },
  });

  const heroBgUrl = watch('heroBackgroundUrl');
  const coverUrl = watch('coverImageUrl');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      eventsCollection.get(id),
      eventSectionsCollection.getByEventId(id),
    ])
      .then(([ev, sections]) => {
        if (ev) setSlug(ev.slug);
        if (sections?.heroData) {
          const h = sections.heroData;
          reset({
            eventTitle: h.eventTitle ?? '',
            subtitle: h.subtitle ?? '',
            hostName: h.hostName ?? '',
            eventDate: h.eventDate ?? '',
            countdownDate: h.countdownDate ?? '',
            heroBackgroundUrl: h.heroBackgroundUrl ?? '',
            coverImageUrl: h.coverImageUrl ?? '',
          });
        }
      })
      .catch(() => toast.error('Failed to load hero data'))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const heroData: HeroData = {
      eventTitle: values.eventTitle,
      subtitle: values.subtitle,
      hostName: values.hostName,
      eventDate: values.eventDate,
      countdownDate: values.countdownDate,
      heroBackgroundUrl: values.heroBackgroundUrl || undefined,
      coverImageUrl: values.coverImageUrl || undefined,
    };
    try {
      const existing = await eventSectionsCollection.getByEventId(id);
      if (existing) {
        await eventSectionsCollection.update(id, { heroData });
      } else {
        await eventSectionsCollection.save(id, { heroData });
      }
      toast.success('Hero section saved!');
    } catch {
      toast.error('Failed to save hero data');
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
        <Link href={`/admin/events/${id}`} className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} />
          Event Editor
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium">Hero Section</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={22} style={{ color: '#D4AF37' }} />
            Hero Section
          </h1>
          <p className="text-sm text-gray-500 mt-1">The first thing guests see — make it count.</p>
        </div>
        {slug && (
          <Link
            href={`/events/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
          >
            <ExternalLink size={14} />
            Preview
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Card: Text Content */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Text Content</h2>

          <div>
            <label className={labelCls}>Event Title <span className="text-red-400">*</span></label>
            <input {...register('eventTitle')} placeholder="e.g. Sarah & John's Wedding Day" className={inputCls} />
            {errors.eventTitle && <p className={errorCls}>{errors.eventTitle.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Subtitle</label>
            <input {...register('subtitle')} placeholder="e.g. Together forever" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Host Name <span className="text-red-400">*</span></label>
            <input {...register('hostName')} placeholder="e.g. Sarah & John" className={inputCls} />
            {errors.hostName && <p className={errorCls}>{errors.hostName.message}</p>}
          </div>
        </div>

        {/* Card: Dates */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Dates</h2>

          <div>
            <label className={labelCls}>Event Date <span className="text-red-400">*</span></label>
            <input type="date" {...register('eventDate')} className={inputCls} />
            {errors.eventDate && <p className={errorCls}>{errors.eventDate.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Countdown Target Date & Time <span className="text-red-400">*</span></label>
            <input type="datetime-local" {...register('countdownDate')} className={inputCls} />
            {errors.countdownDate && <p className={errorCls}>{errors.countdownDate.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Used for the live countdown timer on the event page.</p>
          </div>
        </div>

        {/* Card: Images */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Images</h2>

          <div>
            <label className={labelCls}>Hero Background Image URL</label>
            <input {...register('heroBackgroundUrl')} placeholder="https://example.com/hero-bg.jpg" className={inputCls} />
            {errors.heroBackgroundUrl && <p className={errorCls}>{errors.heroBackgroundUrl.message}</p>}
            <ImagePreview url={heroBgUrl} label="background image" />
          </div>

          <div>
            <label className={labelCls}>Cover Image URL</label>
            <input {...register('coverImageUrl')} placeholder="https://example.com/cover.jpg" className={inputCls} />
            {errors.coverImageUrl && <p className={errorCls}>{errors.coverImageUrl.message}</p>}
            <ImagePreview url={coverUrl} label="cover image" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href={`/admin/events/${id}`} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-[#1a1a2e] disabled:opacity-60 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)' }}
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? 'Saving…' : 'Save Hero'}
          </button>
        </div>
      </form>
    </div>
  );
}
