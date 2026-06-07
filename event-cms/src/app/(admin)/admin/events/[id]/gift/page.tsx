'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, Gift, ExternalLink, ImageIcon } from 'lucide-react';
import { eventsCollection, eventSectionsCollection } from '@/lib/firebase/firestore';
import type { GiftInfo } from '@/lib/types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountName: z.string().min(1, 'Account name is required'),
  qrCodeUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof schema>;

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-colors placeholder-gray-300';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';
const errorCls = 'text-xs text-red-500 mt-1';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GiftManagerPage() {
  const { id } = useParams<{ id: string }>();
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { bankName: '', accountNumber: '', accountName: '', qrCodeUrl: '' },
  });

  const qrUrl = watch('qrCodeUrl');

  useEffect(() => {
    if (!id) return;
    Promise.all([eventsCollection.get(id), eventSectionsCollection.getByEventId(id)])
      .then(([ev, sections]) => {
        if (ev) setSlug(ev.slug);
        if (sections?.giftInfo) {
          reset({
            bankName: sections.giftInfo.bankName ?? '',
            accountNumber: sections.giftInfo.accountNumber ?? '',
            accountName: sections.giftInfo.accountName ?? '',
            qrCodeUrl: sections.giftInfo.qrCodeUrl ?? '',
          });
        }
      })
      .catch(() => toast.error('Failed to load gift info'))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const giftInfo: GiftInfo = {
      bankName: values.bankName,
      accountNumber: values.accountNumber,
      accountName: values.accountName,
      qrCodeUrl: values.qrCodeUrl || undefined,
    };
    try {
      const existing = await eventSectionsCollection.getByEventId(id);
      if (existing) {
        await eventSectionsCollection.update(id, { giftInfo });
      } else {
        await eventSectionsCollection.save(id, { giftInfo });
      }
      toast.success('Gift info saved!');
    } catch {
      toast.error('Failed to save gift info');
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
        <span className="text-gray-700 font-medium">Gift</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift size={22} style={{ color: '#14b8a6' }} />
            Gift Information
          </h1>
          <p className="text-sm text-gray-500 mt-1">Bank transfer details and QR code for gifts.</p>
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
        {/* Bank details */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Bank Transfer Details</h2>

          <div>
            <label className={labelCls}>Bank Name <span className="text-red-400">*</span></label>
            <input {...register('bankName')} placeholder="e.g. Bangkok Bank" className={inputCls} />
            {errors.bankName && <p className={errorCls}>{errors.bankName.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Account Number <span className="text-red-400">*</span></label>
            <input {...register('accountNumber')} placeholder="e.g. 123-456-7890" className={inputCls} />
            {errors.accountNumber && <p className={errorCls}>{errors.accountNumber.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Account Name <span className="text-red-400">*</span></label>
            <input {...register('accountName')} placeholder="e.g. Sarah Johnson" className={inputCls} />
            {errors.accountName && <p className={errorCls}>{errors.accountName.message}</p>}
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">QR Code</h2>

          <div>
            <label className={labelCls}>QR Code Image URL</label>
            <input {...register('qrCodeUrl')} placeholder="https://example.com/qr-code.png" className={inputCls} />
            {errors.qrCodeUrl && <p className={errorCls}>{errors.qrCodeUrl.message}</p>}
          </div>

          {/* QR Preview */}
          {qrUrl ? (
            <div className="flex justify-center">
              <div className="border border-gray-200 rounded-xl p-4 inline-flex bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="QR Code" className="w-40 h-40 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            </div>
          ) : (
            <div className="h-40 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-300">
              <ImageIcon size={32} />
              <span className="text-sm">QR code preview will appear here</span>
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
            {saving ? 'Saving…' : 'Save Gift Info'}
          </button>
        </div>
      </form>
    </div>
  );
}
