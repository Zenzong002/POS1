'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader2, Clock, ImageIcon, Check, X,
} from 'lucide-react';
import { eventSectionsCollection } from '@/lib/firebase/firestore';
import { randomId } from '@/lib/utils';
import type { TimelineItem } from '@/lib/types';

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-colors placeholder-gray-300';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

// ─── Empty form state ──────────────────────────────────────────────────────────

const emptyItem = (): Omit<TimelineItem, 'id' | 'order'> => ({
  date: '',
  title: '',
  description: '',
  imageUrl: '',
});

// ─── Inline item form ──────────────────────────────────────────────────────────

interface ItemFormProps {
  initial?: Partial<TimelineItem>;
  onSave: (data: Omit<TimelineItem, 'id' | 'order'>) => void;
  onCancel: () => void;
}

function ItemForm({ initial, onSave, onCancel }: ItemFormProps) {
  const [form, setForm] = useState({ ...emptyItem(), ...initial });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const valid = form.date.trim() && form.title.trim();

  return (
    <div className="bg-white border border-yellow-200 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Date <span className="text-red-400">*</span></label>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Title <span className="text-red-400">*</span></label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Milestone title" className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
          rows={2} placeholder="Optional description…" className={`${inputCls} resize-none`} />
      </div>
      <div>
        <label className={labelCls}>Image URL</label>
        <input value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)}
          placeholder="https://example.com/photo.jpg" className={inputCls} />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => valid && onSave(form)}
          disabled={!valid}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-[#1a1a2e] disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)' }}
        >
          <Check size={13} /> Save
        </button>
        <button onClick={onCancel} className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TimelineManagerPage() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    eventSectionsCollection.getByEventId(id)
      .then((sections) => {
        if (sections?.timelineItems) {
          setItems([...sections.timelineItems].sort((a, b) => a.order - b.order));
        }
      })
      .catch(() => toast.error('Failed to load timeline'))
      .finally(() => setLoading(false));
  }, [id]);

  const persist = async (updated: TimelineItem[]) => {
    setSaving(true);
    try {
      const existing = await eventSectionsCollection.getByEventId(id);
      if (existing) {
        await eventSectionsCollection.update(id, { timelineItems: updated });
      } else {
        await eventSectionsCollection.save(id, { timelineItems: updated });
      }
      toast.success('Timeline saved!');
    } catch {
      toast.error('Failed to save timeline');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (data: Omit<TimelineItem, 'id' | 'order'>) => {
    const newItem: TimelineItem = { ...data, id: randomId(), order: items.length };
    const updated = [...items, newItem];
    setItems(updated);
    setShowAddForm(false);
    await persist(updated);
  };

  const handleEdit = async (itemId: string, data: Omit<TimelineItem, 'id' | 'order'>) => {
    const updated = items.map((it) => it.id === itemId ? { ...it, ...data } : it);
    setItems(updated);
    setEditingId(null);
    await persist(updated);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this timeline item?')) return;
    const updated = items.filter((it) => it.id !== itemId).map((it, idx) => ({ ...it, order: idx }));
    setItems(updated);
    await persist(updated);
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
        <Link href={`/admin/events/${id}`} className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} />
          Event Editor
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium">Timeline</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock size={22} style={{ color: '#8b5cf6' }} />
            Timeline
          </h1>
          <p className="text-sm text-gray-500 mt-1">Add key moments and milestones to your event story.</p>
        </div>
        {saving && <Loader2 size={18} className="animate-spin text-yellow-500" />}
      </div>

      {/* Item list */}
      <div className="space-y-3">
        {items.length === 0 && !showAddForm && (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <Clock size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 font-medium text-sm">No timeline items yet</p>
            <p className="text-gray-300 text-xs mt-1">Add your first milestone below.</p>
          </div>
        )}

        {items.map((item) => (
          <div key={item.id}>
            {editingId === item.id ? (
              <ItemForm
                initial={item}
                onSave={(data) => handleEdit(item.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0 border border-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <ImageIcon size={18} className="text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-medium">{item.date}</p>
                  <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditingId(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {showAddForm ? (
          <ItemForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-yellow-300 hover:text-yellow-600 transition-colors"
          >
            <Plus size={16} />
            Add Timeline Item
          </button>
        )}
      </div>

      <div className="flex justify-end pb-8">
        <Link href={`/admin/events/${id}`} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
          Back to Event
        </Link>
      </div>
    </div>
  );
}
