'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, MapPin, ExternalLink } from 'lucide-react';
import { eventsCollection, eventSectionsCollection } from '@/lib/firebase/firestore';
import type { LocationData } from '@/lib/types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  venueName: z.string().min(1, 'Venue name is required'),
  address: z.string().min(1, 'Address is required'),
  googleMapsEmbedUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof schema>;

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-colors placeholder-gray-300';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';
const errorCls = 'text-xs text-red-500 mt-1';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocationManagerPage() {
  const { id } = useParams<{ id: string }>();
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { venueName: '', address: '', googleMapsEmbedUrl: '' },
  });

  const mapUrl = watch('googleMapsEmbedUrl');

  useEffect(() => {
    if (!id) return;
    Promise.all([eventsCollection.get(id), eventSectionsCollection.getByEventId(id)])
      .then(([ev, sections]) => {
        if (ev) setSlug(ev.slug);
        if (sections?.locationData) {
          reset({
            venueName: sections.locationData.venueName ?? '',
            address: sections.locationData.address ?? '',
            googleMapsEmbedUrl: sections.locationData.googleMapsEmbedUrl ?? '',
          });
        }
      })
      .catch(() => toast.error('Failed to load location data'))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const locationData: LocationData = {
      venueName: values.venueName,
      address: values.address,
      googleMapsEmbedUrl: values.googleMapsEmbedUrl || undefined,
    };
    try {
      const existing = await eventSectionsCollection.getByEventId(id);
      if (existing) {
        await eventSectionsCollection.update(id, { locationData });
      } else {
        await eventSectionsCollection.save(id, { locationData });
      }
      toast.success('Location saved!');
    } catch {
      toast.error('Failed to save location');
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

      <div className="flex items-center gap-2 text-sm">
        <Link href={`/admin/events/${id}`} className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} />
          Event Editor
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium">Location</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={22} style={{ color: '#22c55e' }} />
            Location
          </h1>
          <p className="text-sm text-gray-500 mt-1">Venue details and Google Maps embed.</p>
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
        {/* Venue info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Venue Details</h2>

          <div>
            <label className={labelCls}>Venue Name <span className="text-red-400">*</span></label>
            <input {...register('venueName')} placeholder="e.g. Grand Ballroom Hotel" className={inputCls} />
            {errors.venueName && <p className={errorCls}>{errors.venueName.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Address <span className="text-red-400">*</span></label>
            <textarea {...register('address')} rows={3} placeholder="Full venue address…" className={`${inputCls} resize-y`} />
            {errors.address && <p className={errorCls}>{errors.address.message}</p>}
          </div>
        </div>

        {/* Map embed */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Google Maps Embed</h2>

          <div>
            <label className={labelCls}>Google Maps Embed URL</label>
            <input {...register('googleMapsEmbedUrl')} placeholder="https://www.google.com/maps/embed?pb=..." className={inputCls} />
            {errors.googleMapsEmbedUrl && <p className={errorCls}>{errors.googleMapsEmbedUrl.message}</p>}
            <p className="text-xs text-gray-400 mt-1">
              Go to Google Maps &rarr; Share &rarr; Embed a map &rarr; copy the <code className="text-xs bg-gray-100 px-1 rounded">src</code> URL.
            </p>
          </div>

          {/* Map preview */}
          {mapUrl ? (
            <div className="rounded-xl overflow-hidden border border-gray-200 h-64 bg-gray-50">
              <iframe
                src={mapUrl}
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map preview"
              />
            </div>
          ) : (
            <div className="h-48 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-300">
              <MapPin size={22} />
              <span className="text-sm">Map preview will appear here</span>
            </div>
          )}
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
            {saving ? 'Saving…' : 'Save Location'}
          </button>
        </div>
      </form>
    </div>
  );
}
