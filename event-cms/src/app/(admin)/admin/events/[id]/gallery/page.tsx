'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { eventSectionsCollection } from '@/lib/firebase/firestore';
import { randomId } from '@/lib/utils';
import type { GalleryItem } from '@/lib/types';

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-colors placeholder-gray-300';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GalleryManagerPage() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Single add
  const [singleUrl, setSingleUrl] = useState('');
  const [singleCaption, setSingleCaption] = useState('');

  // Bulk add
  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  useEffect(() => {
    if (!id) return;
    eventSectionsCollection.getByEventId(id)
      .then((s) => {
        if (s?.galleryItems) {
          setItems([...s.galleryItems].sort((a, b) => a.order - b.order));
        }
      })
      .catch(() => toast.error('Failed to load gallery'))
      .finally(() => setLoading(false));
  }, [id]);

  const persist = async (updated: GalleryItem[]) => {
    setSaving(true);
    try {
      const existing = await eventSectionsCollection.getByEventId(id);
      if (existing) {
        await eventSectionsCollection.update(id, { galleryItems: updated });
      } else {
        await eventSectionsCollection.save(id, { galleryItems: updated });
      }
      toast.success('Gallery saved!');
    } catch {
      toast.error('Failed to save gallery');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSingle = async () => {
    if (!singleUrl.trim()) {
      toast.error('Image URL is required');
      return;
    }
    const newItem: GalleryItem = {
      id: randomId(),
      imageUrl: singleUrl.trim(),
      caption: singleCaption.trim() || undefined,
      order: items.length,
    };
    const updated = [...items, newItem];
    setItems(updated);
    setSingleUrl('');
    setSingleCaption('');
    await persist(updated);
  };

  const handleBulkAdd = async () => {
    const urls = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!urls.length) { toast.error('No URLs found'); return; }
    const newItems: GalleryItem[] = urls.map((url, i) => ({
      id: randomId(),
      imageUrl: url,
      order: items.length + i,
    }));
    const updated = [...items, ...newItems];
    setItems(updated);
    setBulkText('');
    setShowBulk(false);
    await persist(updated);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Remove this image?')) return;
    const updated = items.filter((it) => it.id !== itemId).map((it, idx) => ({ ...it, order: idx }));
    setItems(updated);
    await persist(updated);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center gap-2 text-sm">
        <Link href={`/admin/events/${id}`} className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} />
          Event Editor
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium">Gallery</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon size={22} style={{ color: '#ec4899' }} />
            Gallery
          </h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} image{items.length !== 1 ? 's' : ''} in gallery</p>
        </div>
        {saving && <Loader2 size={18} className="animate-spin text-yellow-500" />}
      </div>

      {/* Add single */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Add Image</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Image URL <span className="text-red-400">*</span></label>
            <input value={singleUrl} onChange={(e) => setSingleUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Caption</label>
            <input value={singleCaption} onChange={(e) => setSingleCaption(e.target.value)}
              placeholder="Optional caption…" className={inputCls} />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddSingle}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-[#1a1a2e]"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)' }}
          >
            <Plus size={14} /> Add Image
          </button>
          <button onClick={() => setShowBulk(!showBulk)}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Bulk Add
          </button>
        </div>
      </div>

      {/* Bulk add panel */}
      {showBulk && (
        <div className="bg-white border border-yellow-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Bulk Add — one URL per line</h3>
            <button onClick={() => setShowBulk(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
            className={`${inputCls} resize-y font-mono text-xs`}
          />
          <button onClick={handleBulkAdd}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-[#1a1a2e]"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)' }}>
            <Plus size={14} /> Add All
          </button>
        </div>
      )}

      {/* Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.caption ?? ''}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {item.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                  <p className="text-white text-xs truncate">{item.caption}</p>
                </div>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <ImageIcon size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 font-medium text-sm">No images yet</p>
          <p className="text-gray-300 text-xs mt-1">Add images using the form above.</p>
        </div>
      )}

      <div className="flex justify-end pb-8">
        <Link href={`/admin/events/${id}`} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
          Back to Event
        </Link>
      </div>
    </div>
  );
}
