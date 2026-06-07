'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Globe,
  EyeOff,
  Users,
  Heart,
  Image,
  MapPin,
  Clock,
  Calendar,
  BookOpen,
  Gift,
  Sparkles,
  Palette,
  ChevronRight,
} from 'lucide-react';
import { eventsCollection, rsvpsCollection, blessingsCollection } from '@/lib/firebase/firestore';
import type { Event, EventStatus } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw: Event['createdAt']): string {
  try {
    const d =
      raw instanceof Date ? raw
      : typeof raw === 'string' ? new Date(raw)
      : 'toDate' in (raw as object) ? (raw as { toDate(): Date }).toDate()
      : new Date();
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return '—'; }
}

function StatusBadge({ status }: { status: EventStatus }) {
  const map: Record<EventStatus, { bg: string; text: string; label: string }> = {
    published: { bg: '#dcfce7', text: '#16a34a', label: 'Published' },
    draft: { bg: '#f3f4f6', text: '#6b7280', label: 'Draft' },
    archived: { bg: '#fee2e2', text: '#dc2626', label: 'Archived' },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

// ─── Section nav items ────────────────────────────────────────────────────────

interface NavSection {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const SECTIONS: NavSection[] = [
  { key: 'hero', label: 'Hero', description: 'Title, date, background & cover images', icon: Sparkles, color: '#D4AF37' },
  { key: 'story', label: 'Story', description: 'Your event story and description', icon: BookOpen, color: '#6366f1' },
  { key: 'timeline', label: 'Timeline', description: 'Key moments and milestones', icon: Clock, color: '#8b5cf6' },
  { key: 'schedule', label: 'Schedule', description: 'Day-of program and timings', icon: Calendar, color: '#0ea5e9' },
  { key: 'gallery', label: 'Gallery', description: 'Photo gallery for your event', icon: Image, color: '#ec4899' },
  { key: 'location', label: 'Location', description: 'Venue details and map', icon: MapPin, color: '#22c55e' },
  { key: 'rsvp', label: 'RSVP', description: 'Guest responses and attendance', icon: Users, color: '#f59e0b' },
  { key: 'blessings', label: 'Blessings', description: 'Guest messages and wishes', icon: Heart, color: '#ef4444' },
  { key: 'gift', label: 'Gift', description: 'Bank details and QR code', icon: Gift, color: '#14b8a6' },
  { key: 'decorations', label: 'Decorations', description: 'Visual decorations and overlays', icon: Palette, color: '#f97316' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<(Event & { id: string }) | null>(null);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [blessingCount, setBlessingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      eventsCollection.get(id),
      rsvpsCollection.listByEvent(id),
      blessingsCollection.listByEvent(id),
    ])
      .then(([ev, rsvps, blessings]) => {
        if (!ev) { router.replace('/admin/events'); return; }
        setEvent(ev);
        setRsvpCount(rsvps.length);
        setBlessingCount(blessings.length);
      })
      .catch(() => toast.error('Failed to load event'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleTogglePublish = async () => {
    if (!event) return;
    setToggling(true);
    const nextStatus: EventStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await eventsCollection.update(event.id, { status: nextStatus });
      setEvent((prev) => prev ? { ...prev, status: nextStatus } : prev);
      toast.success(nextStatus === 'published' ? 'Event published!' : 'Event unpublished');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setToggling(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/events" className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} />
          Events
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{event.title}</span>
      </div>

      {/* Event header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
              <StatusBadge status={event.status} />
            </div>
            <p className="text-sm text-gray-400 mt-1">
              /{event.slug} &bull; {event.eventType.replace('_', ' ')} &bull; Created {formatDate(event.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {event.status === 'published' && (
              <Link
                href={`/events/${event.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ color: '#22c55e' }}
              >
                <ExternalLink size={14} />
                Preview
              </Link>
            )}
            <button
              onClick={handleTogglePublish}
              disabled={toggling}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{
                background: event.status === 'published'
                  ? 'linear-gradient(135deg, #6b7280, #9ca3af)'
                  : 'linear-gradient(135deg, #22c55e, #16a34a)',
              }}
            >
              {toggling ? <Loader2 size={14} className="animate-spin" /> : event.status === 'published' ? <EyeOff size={14} /> : <Globe size={14} />}
              {event.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-gray-50 px-6 py-4 flex gap-6">
          <Link
            href={`/admin/events/${id}/rsvp`}
            className="flex items-center gap-2 text-sm group"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <Users size={15} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="font-bold text-gray-800 leading-none">{rsvpCount}</p>
              <p className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">RSVPs</p>
            </div>
          </Link>
          <Link
            href={`/admin/events/${id}/blessings`}
            className="flex items-center gap-2 text-sm group"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)' }}>
              <Heart size={15} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p className="font-bold text-gray-800 leading-none">{blessingCount}</p>
              <p className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">Blessings</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Section navigation grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Edit Sections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.key}
                href={`/admin/events/${id}/${section.key}`}
                className="group bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:border-opacity-50"
                style={{ '--hover-color': section.color } as React.CSSProperties}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${section.color}40`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f3f4f6'; }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: `${section.color}15` }}
                >
                  <Icon size={19} style={{ color: section.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{section.label}</p>
                  <p className="text-xs text-gray-400 truncate">{section.description}</p>
                </div>
                <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-400 transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
