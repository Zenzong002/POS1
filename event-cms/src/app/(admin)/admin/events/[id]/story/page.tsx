'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, ExternalLink, BookOpen, ImageIcon } from 'lucide-react';
import { eventsCollection, eventSectionsCollection } from '@/lib/firebase/firestore';
import type { StoryData } from '@/lib/types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Story description is required'),
  storyImageUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof schema>;

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-colors placeholder-gray-300';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';
const errorCls = 'text-xs text-red-500 mt-1';

function ImagePreview({ url }: { url?: string }) {
  if (!url) {
    return (
      <div className="mt-2 h-40 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-300">
        <ImageIcon size={22} />
        <span className="text-sm">No image set</span>
      </div>
    );
  }
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 h-40 bg-gray-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Story" className="w-full h-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StoryManagerPage() {
  const { id } = useParams<{ id: string }>();
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', storyImageUrl: '' },
  });

  const imageUrl = watch('storyImageUrl');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      eventsCollection.get(id),
      eventSectionsCollection.getByEventId(id),
    ])
      .then(([ev, sections]) => {
        if (ev) setSlug(ev.slug);
        if (sections?.storyData) {
          reset({
            title: sections.storyData.title ?? '',
            description: sections.storyData.description ?? '',
            storyImageUrl: sections.storyData.storyImageUrl ?? '',
          });
        }
      })
      .catch(() => toast.error('Failed to load story data'))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const storyData: StoryData = {
      title: values.title,
      description: values.description,
      storyImageUrl: values.storyImageUrl || undefined,
    };
    try {
      const existing = await eventSectionsCollection.getByEventId(id);
      if (existing) {
        await eventSectionsCollection.update(id, { storyData });
      } else {
        await eventSectionsCollection.save(id, { storyData });
      }
      toast.success('Story saved!');
    } catch {
      toast.error('Failed to save story');
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
        <span className="text-gray-700 font-medium">Story</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={22} style={{ color: '#6366f1' }} />
            Story Section
          </h1>
          <p className="text-sm text-gray-500 mt-1">Tell the story behind your event.</p>
        </div>
        {slug && (
          <Link href={`/events/${slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600">
            <ExternalLink size={14} />
            Preview
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Story Content</h2>

          <div>
            <label className={labelCls}>Section Title <span className="text-red-400">*</span></label>
            <input {...register('title')} placeholder="e.g. Our Story" className={inputCls} />
            {errors.title && <p className={errorCls}>{errors.title.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Story Description <span className="text-red-400">*</span></label>
            <textarea
              {...register('description')}
              rows={6}
              placeholder="Share the story of how this event came to be…"
              className={`${inputCls} resize-y`}
            />
            {errors.description && <p className={errorCls}>{errors.description.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Story Image URL</label>
            <input {...register('storyImageUrl')} placeholder="https://example.com/story.jpg" className={inputCls} />
            {errors.storyImageUrl && <p className={errorCls}>{errors.storyImageUrl.message}</p>}
            <ImagePreview url={imageUrl} />
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
            {saving ? 'Saving…' : 'Save Story'}
          </button>
        </div>
      </form>
    </div>
  );
}
