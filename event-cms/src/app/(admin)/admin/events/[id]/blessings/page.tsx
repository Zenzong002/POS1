'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Heart, Check, X, Trash2, Loader2, Search } from 'lucide-react';
import { blessingsCollection } from '@/lib/firebase/firestore';
import type { Blessing, BlessingStatus } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw: Blessing['createdAt']): string {
  try {
    const d = raw instanceof Date ? raw
      : typeof raw === 'string' ? new Date(raw)
      : 'toDate' in (raw as object) ? (raw as { toDate(): Date }).toDate()
      : new Date();
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return '—'; }
}

function StatusBadge({ status }: { status: BlessingStatus }) {
  const map: Record<BlessingStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: '#fef9c3', text: '#ca8a04', label: 'Pending' },
    approved: { bg: '#dcfce7', text: '#16a34a', label: 'Approved' },
    rejected: { bg: '#fee2e2', text: '#dc2626', label: 'Rejected' },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTERS: { value: 'all' | BlessingStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlessingsManagerPage() {
  const { id } = useParams<{ id: string }>();
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | BlessingStatus>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!id) return;
    blessingsCollection.listByEvent(id)
      .then(setBlessings)
      .catch(() => toast.error('Failed to load blessings'))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = useMemo(() => {
    return blessings.filter((b) => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || b.name.toLowerCase().includes(q) || b.message.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [blessings, statusFilter, search]);

  const handleStatusChange = async (blessing: Blessing, newStatus: BlessingStatus) => {
    setActionId(blessing.id);
    try {
      await blessingsCollection.update(blessing.id, { status: newStatus });
      setBlessings((prev) => prev.map((b) => b.id === blessing.id ? { ...b, status: newStatus } : b));
      toast.success(`Blessing ${newStatus}`);
    } catch {
      toast.error('Failed to update blessing');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (blessing: Blessing) => {
    if (!confirm(`Delete blessing from "${blessing.name}"?`)) return;
    setActionId(blessing.id);
    try {
      await blessingsCollection.remove(blessing.id);
      setBlessings((prev) => prev.filter((b) => b.id !== blessing.id));
      toast.success('Blessing deleted');
    } catch {
      toast.error('Failed to delete blessing');
    } finally {
      setActionId(null);
    }
  };

  // Counts
  const pending = blessings.filter((b) => b.status === 'pending').length;
  const approved = blessings.filter((b) => b.status === 'approved').length;
  const rejected = blessings.filter((b) => b.status === 'rejected').length;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center gap-2 text-sm">
        <Link href={`/admin/events/${id}`} className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} />
          Event Editor
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium">Blessings</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart size={22} style={{ color: '#ef4444' }} />
          Blessings & Wishes
        </h1>
        <p className="text-sm text-gray-500 mt-1">{blessings.length} total messages from guests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', count: pending, color: '#eab308' },
          { label: 'Approved', count: approved, color: '#22c55e' },
          { label: 'Rejected', count: rejected, color: '#ef4444' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or message…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={statusFilter === f.value
                ? { background: '#fff', color: '#111827', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: '#6b7280' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Heart size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 font-medium text-sm">No blessings found</p>
          {(search || statusFilter !== 'all') && (
            <p className="text-gray-300 text-xs mt-1">Try adjusting your search or filter.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((blessing) => (
            <div key={blessing.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{blessing.name}</p>
                    <StatusBadge status={blessing.status} />
                    <span className="text-xs text-gray-400">{formatDate(blessing.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{blessing.message}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {blessing.status !== 'approved' && (
                    <button
                      onClick={() => handleStatusChange(blessing, 'approved')}
                      disabled={actionId === blessing.id}
                      title="Approve"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                    >
                      {actionId === blessing.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </button>
                  )}
                  {blessing.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(blessing, 'rejected')}
                      disabled={actionId === blessing.id}
                      title="Reject"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(blessing)}
                    disabled={actionId === blessing.id}
                    title="Delete"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
