'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  ExternalLink,
  CalendarDays,
  ChevronDown,
  Users,
} from 'lucide-react';
import {
  eventsCollection,
  rsvpsCollection,
  fetchDocs,
  COLLECTIONS,
  buildWhere,
} from '@/lib/firebase/firestore';
import type { Event, EventStatus } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw: Event['createdAt']): string {
  try {
    const d =
      raw instanceof Date
        ? raw
        : typeof raw === 'string'
        ? new Date(raw)
        : 'toDate' in (raw as object)
        ? (raw as { toDate(): Date }).toDate()
        : new Date();
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EventStatus }) {
  const map: Record<EventStatus, { bg: string; text: string; label: string }> = {
    published: { bg: '#dcfce7', text: '#16a34a', label: 'Published' },
    draft: { bg: '#f3f4f6', text: '#6b7280', label: 'Draft' },
    archived: { bg: '#fee2e2', text: '#dc2626', label: 'Archived' },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-16 bg-gray-100 rounded-lg" />
        <div className="h-8 w-16 bg-gray-100 rounded-lg" />
        <div className="h-8 w-16 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: 'all' | EventStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = useState<(Event & { id: string })[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | EventStatus>('all');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  // Load events
  const loadEvents = () => {
    setLoading(true);
    eventsCollection
      .list()
      .then((data) => {
        setEvents(data);
        // Fetch RSVP counts per event
        return Promise.all(
          data.map(async (ev) => {
            const rsvps = await rsvpsCollection.listByEvent(ev.id);
            return { id: ev.id, count: rsvps.length };
          })
        );
      })
      .then((counts) => {
        const map: Record<string, number> = {};
        counts.forEach(({ id, count }) => { map[id] = count; });
        setRsvpCounts(map);
      })
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  // Filtered list
  const filtered = useMemo(() => {
    return events.filter((ev) => {
      const matchStatus = statusFilter === 'all' || ev.status === statusFilter;
      const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.slug.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [events, statusFilter, search]);

  // Delete
  const handleDelete = async (ev: Event & { id: string }) => {
    if (!confirm(`Delete "${ev.title}"? This cannot be undone.`)) return;
    setDeleting(ev.id);
    try {
      await eventsCollection.remove(ev.id);
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  // Duplicate
  const handleDuplicate = async (ev: Event & { id: string }) => {
    setDuplicating(ev.id);
    try {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = ev;
      const newSlug = slugify(`${ev.title} copy`);
      const newId = await eventsCollection.create({
        ...rest,
        title: `${ev.title} (Copy)`,
        slug: newSlug,
        status: 'draft',
      } as Parameters<typeof eventsCollection.create>[0]);
      toast.success('Event duplicated');
      setEvents((prev) => [
        { ...rest, id: newId, title: `${ev.title} (Copy)`, slug: newSlug, status: 'draft', createdAt: new Date(), updatedAt: new Date() },
        ...prev,
      ]);
    } catch {
      toast.error('Failed to duplicate event');
    } finally {
      setDuplicating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all your event pages</p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)', color: '#1a1a2e' }}
        >
          <Plus size={16} />
          Create New Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={
                statusFilter === f.value
                  ? { background: '#fff', color: '#111827', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { color: '#6b7280' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <CalendarDays size={48} className="text-gray-200" />
          <p className="text-gray-400 font-medium">No events found</p>
          <p className="text-gray-300 text-sm">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Create your first event to get started.'}
          </p>
          {!search && statusFilter === 'all' && (
            <Link
              href="/admin/events/new"
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)', color: '#1a1a2e' }}
            >
              <Plus size={14} />
              Create Event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{ev.title}</h3>
                  <p className="text-xs text-gray-400 truncate mt-0.5">/{ev.slug}</p>
                </div>
                <StatusBadge status={ev.status} />
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="capitalize">{ev.eventType.replace('_', ' ')}</span>
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {rsvpCounts[ev.id] ?? 0} RSVPs
                </span>
                <span>{formatDate(ev.createdAt)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                <Link
                  href={`/admin/events/${ev.id}`}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                  style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.08)' }}
                >
                  <Pencil size={11} />
                  Edit
                </Link>

                {ev.status === 'published' && (
                  <Link
                    href={`/events/${ev.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                    style={{ color: '#16a34a', background: 'rgba(34,197,94,0.08)' }}
                  >
                    <ExternalLink size={11} />
                    View
                  </Link>
                )}

                <button
                  onClick={() => handleDuplicate(ev)}
                  disabled={duplicating === ev.id}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  style={{ color: '#6366f1', background: 'rgba(99,102,241,0.08)' }}
                >
                  <Copy size={11} />
                  {duplicating === ev.id ? '…' : 'Dupe'}
                </button>

                <button
                  onClick={() => handleDelete(ev)}
                  disabled={deleting === ev.id}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ml-auto"
                  style={{ color: '#dc2626', background: 'rgba(239,68,68,0.06)' }}
                >
                  <Trash2 size={11} />
                  {deleting === ev.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
