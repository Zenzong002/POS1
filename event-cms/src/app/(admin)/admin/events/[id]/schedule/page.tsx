'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Calendar, Check, X } from 'lucide-react';
import { eventSectionsCollection } from '@/lib/firebase/firestore';
import { randomId } from '@/lib/utils';
import type { ScheduleItem } from '@/lib/types';

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-colors placeholder-gray-300';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const emptyItem = (): Omit<ScheduleItem, 'id' | 'order'> => ({
  time: '',
  eventName: '',
  description: '',
});

// ─── Inline item form ──────────────────────────────────────────────────────────

interface ItemFormProps {
  initial?: Partial<ScheduleItem>;
  onSave: (data: Omit<ScheduleItem, 'id' | 'order'>) => void;
  onCancel: () => void;
}

function ItemForm({ initial, onSave, onCancel }: ItemFormProps) {
  const [form, setForm] = useState({ ...emptyItem(), ...initial });
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));
  const valid = form.time.trim() && form.eventName.trim();

  return (
    <div className="bg-white border border-yellow-200 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Time <span className="text-red-400">*</span></label>
          <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Event Name <span className="text-red-400">*</span></label>
          <input value={form.eventName} onChange={(e) => set('eventName', e.target.value)} placeholder="e.g. Ceremony Begins" className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
          rows={2} placeholder="Additional details…" className={`${inputCls} resize-none`} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => valid && onSave(form)} disabled={!valid}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-[#1a1a2e] disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)' }}>
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

export default function ScheduleManagerPage() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    eventSectionsCollection.getByEventId(id)
      .then((s) => {
        if (s?.scheduleItems) {
          setItems([...s.scheduleItems].sort((a, b) => a.order - b.order));
        }
      })
      .catch(() => toast.error('Failed to load schedule'))
      .finally(() => setLoading(false));
  }, [id]);

  const persist = async (updated: ScheduleItem[]) => {
    setSaving(true);
    try {
      const existing = await eventSectionsCollection.getByEventId(id);
      if (existing) {
        await eventSectionsCollection.update(id, { scheduleItems: updated });
      } else {
        await eventSectionsCollection.save(id, { scheduleItems: updated });
      }
      toast.success('Schedule saved!');
    } catch {
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (data: Omit<ScheduleItem, 'id' | 'order'>) => {
    const newItem: ScheduleItem = { ...data, id: randomId(), order: items.length };
    const updated = [...items, newItem];
    setItems(updated);
    setShowAddForm(false);
    await persist(updated);
  };

  const handleEdit = async (itemId: string, data: Omit<ScheduleItem, 'id' | 'order'>) => {
    const updated = items.map((it) => it.id === itemId ? { ...it, ...data } : it);
    setItems(updated);
    setEditingId(null);
    await persist(updated);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this schedule item?')) return;
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

      <div className="flex items-center gap-2 text-sm">
        <Link href={`/admin/events/${id}`} className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} />
          Event Editor
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium">Schedule</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={22} style={{ color: '#0ea5e9' }} />
            Schedule
          </h1>
          <p className="text-sm text-gray-500 mt-1">Day-of program with times and descriptions.</p>
        </div>
        {saving && <Loader2 size={18} className="animate-spin text-yellow-500" />}
      </div>

      <div className="space-y-3">
        {items.length === 0 && !showAddForm && (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <Calendar size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 font-medium text-sm">No schedule items yet</p>
            <p className="text-gray-300 text-xs mt-1">Add items to build the event program.</p>
          </div>
        )}

        {items.map((item) => (
          <div key={item.id}>
            {editingId === item.id ? (
              <ItemForm initial={item} onSave={(d) => handleEdit(item.id, d)} onCancel={() => setEditingId(null)} />
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                <div className="shrink-0 w-16 text-center">
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 rounded-lg px-2 py-1">
                    {item.time}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item.eventName}</p>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditingId(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
          <button onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-yellow-300 hover:text-yellow-600 transition-colors">
            <Plus size={16} />
            Add Schedule Item
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
