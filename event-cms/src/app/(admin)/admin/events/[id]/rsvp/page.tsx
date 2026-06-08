'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Search, Download, Users, CheckCircle, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import { rsvpsCollection } from '@/lib/firebase/firestore';
import type { RSVPSubmission, AttendanceStatus } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw: RSVPSubmission['createdAt']): string {
  try {
    const d = raw instanceof Date ? raw
      : typeof raw === 'string' ? new Date(raw)
      : 'toDate' in (raw as object) ? (raw as { toDate(): Date }).toDate()
      : new Date();
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return '—'; }
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const map: Record<AttendanceStatus, { bg: string; text: string; label: string; icon: React.ElementType }> = {
    attending: { bg: '#dcfce7', text: '#16a34a', label: 'Attending', icon: CheckCircle },
    not_attending: { bg: '#fee2e2', text: '#dc2626', label: 'Not Attending', icon: XCircle },
    maybe: { bg: '#fef9c3', text: '#ca8a04', label: 'Maybe', icon: HelpCircle },
  };
  const s = map[status];
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}>
      <Icon size={11} />
      {s.label}
    </span>
  );
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCsv(rsvps: RSVPSubmission[]) {
  const headers = ['Name', 'Phone', 'Guests', 'Status', 'Notes', 'Date'];
  const rows = rsvps.map((r) => [
    r.name,
    r.phone,
    String(r.numberOfGuests),
    r.attendanceStatus,
    r.notes ?? '',
    formatDate(r.createdAt),
  ].map((v) => `"${v.replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rsvps.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { value: 'all' | AttendanceStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'attending', label: 'Attending' },
  { value: 'not_attending', label: 'Not Attending' },
  { value: 'maybe', label: 'Maybe' },
];

export default function RSVPManagerPage() {
  const { id } = useParams<{ id: string }>();
  const [rsvps, setRsvps] = useState<RSVPSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');

  useEffect(() => {
    if (!id) return;
    rsvpsCollection.listByEvent(id)
      .then(setRsvps)
      .catch(() => toast.error('Failed to load RSVPs'))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = useMemo(() => {
    return rsvps.filter((r) => {
      const matchStatus = statusFilter === 'all' || r.attendanceStatus === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.phone.includes(q);
      return matchStatus && matchSearch;
    });
  }, [rsvps, statusFilter, search]);

  // Stats
  const attending = rsvps.filter((r) => r.attendanceStatus === 'attending');
  const notAttending = rsvps.filter((r) => r.attendanceStatus === 'not_attending');
  const maybe = rsvps.filter((r) => r.attendanceStatus === 'maybe');
  const totalGuests = attending.reduce((sum, r) => sum + (r.numberOfGuests ?? 0), 0);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center gap-2 text-sm">
        <Link href={`/admin/events/${id}`} className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} />
          Event Editor
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium">RSVPs</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} style={{ color: '#f59e0b' }} />
            RSVP Responses
          </h1>
          <p className="text-sm text-gray-500 mt-1">{rsvps.length} total responses</p>
        </div>
        <button
          onClick={() => exportCsv(filtered)}
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Attending', value: attending.length, color: '#22c55e', icon: CheckCircle },
          { label: 'Not Attending', value: notAttending.length, color: '#ef4444', icon: XCircle },
          { label: 'Maybe', value: maybe.length, color: '#eab308', icon: HelpCircle },
          { label: 'Total Guests', value: totalGuests, color: '#6366f1', icon: Users },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${stat.color}15` }}>
                <Icon size={17} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800 leading-none">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or phone…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {STATUS_FILTERS.map((f) => (
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

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Users size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 font-medium text-sm">No RSVPs found</p>
          {(search || statusFilter !== 'all') && (
            <p className="text-gray-300 text-xs mt-1">Try adjusting your search or filter.</p>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                  {['Name', 'Phone', 'Guests', 'Status', 'Notes', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{r.name}</td>
                    <td className="px-5 py-3 text-gray-500">{r.phone}</td>
                    <td className="px-5 py-3 text-gray-500">{r.numberOfGuests}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.attendanceStatus} /></td>
                    <td className="px-5 py-3 text-gray-400 max-w-[180px] truncate">{r.notes ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
            Showing {filtered.length} of {rsvps.length} responses
          </div>
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
