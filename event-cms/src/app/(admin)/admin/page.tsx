'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  CalendarDays,
  Users,
  Heart,
  Globe,
  Plus,
  ArrowRight,
  ExternalLink,
  Pencil,
  TrendingUp,
} from 'lucide-react';
import { eventsCollection } from '@/lib/firebase/firestore';
import type { Event } from '@/lib/types';

// ─── Animation variants ───────────────────────────────────────────────────────

const EASE_CUSTOM = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: EASE_CUSTOM },
  }),
};

// ─── Stat card data type ──────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  loading: boolean;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Event['status'] }) {
  const styles: Record<Event['status'], { bg: string; text: string; label: string }> = {
    published: { bg: 'rgba(34,197,94,0.12)', text: '#16a34a', label: 'Published' },
    draft: { bg: 'rgba(107,114,128,0.12)', text: '#6b7280', label: 'Draft' },
    archived: { bg: 'rgba(239,68,68,0.10)', text: '#dc2626', label: 'Archived' },
  };
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

// ─── Format Firestore timestamp ───────────────────────────────────────────────

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

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [events, setEvents] = useState<(Event & { id: string })[]>([]);
  const [totalRsvps, setTotalRsvps] = useState(0);
  const [pendingBlessings, setPendingBlessings] = useState(0);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRsvps, setLoadingRsvps] = useState(true);
  const [loadingBlessings, setLoadingBlessings] = useState(true);

  // Fetch data
  useEffect(() => {
    eventsCollection
      .list()
      .then((data) => setEvents(data))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, []);

  useEffect(() => {
    // Count all RSVPs across all events — we fetch all and count
    import('@/lib/firebase/firestore')
      .then(({ fetchDocs, COLLECTIONS }) =>
        fetchDocs(COLLECTIONS.RSVPS, [])
      )
      .then((data) => setTotalRsvps(data.length))
      .catch(() => setTotalRsvps(0))
      .finally(() => setLoadingRsvps(false));
  }, []);

  useEffect(() => {
    import('@/lib/firebase/firestore')
      .then(({ fetchDocs, COLLECTIONS, buildWhere }) =>
        fetchDocs(COLLECTIONS.BLESSINGS, [buildWhere('status', '==', 'pending')])
      )
      .then((data) => setPendingBlessings(data.length))
      .catch(() => setPendingBlessings(0))
      .finally(() => setLoadingBlessings(false));
  }, []);

  const publishedCount = events.filter((e) => e.status === 'published').length;
  const recentEvents = [...events]
    .sort((a, b) => {
      const toMs = (v: Event['createdAt']) => {
        if (v instanceof Date) return v.getTime();
        if (typeof v === 'string') return new Date(v).getTime();
        if (v && typeof v === 'object' && 'toDate' in v) return (v as { toDate(): Date }).toDate().getTime();
        return 0;
      };
      return toMs(b.createdAt) - toMs(a.createdAt);
    })
    .slice(0, 5);

  const stats: StatCard[] = [
    {
      label: 'Total Events',
      value: loadingEvents ? '—' : events.length,
      icon: CalendarDays,
      color: '#D4AF37',
      gradient: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)',
      loading: loadingEvents,
    },
    {
      label: 'Total RSVPs',
      value: loadingRsvps ? '—' : totalRsvps,
      icon: Users,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 100%)',
      loading: loadingRsvps,
    },
    {
      label: 'Pending Blessings',
      value: loadingBlessings ? '—' : pendingBlessings,
      icon: Heart,
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, rgba(236,72,153,0.12) 0%, rgba(236,72,153,0.04) 100%)',
      loading: loadingBlessings,
    },
    {
      label: 'Published Events',
      value: loadingEvents ? '—' : publishedCount,
      icon: Globe,
      color: '#22c55e',
      gradient: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 100%)',
      loading: loadingEvents,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* ── Welcome banner ─────────────────────────────────────────────────── */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)',
          border: '1px solid rgba(212,175,55,0.2)',
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} style={{ color: '#D4AF37' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.7)' }}>
              Overview
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">Good day, Admin</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Here&apos;s what&apos;s happening with your events today.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 50%, #D4AF37 100%)',
            color: '#1a1a2e',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <Plus size={16} />
          Create New Event
        </Link>
      </motion.div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              custom={i + 1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{
                background: stat.gradient,
                border: `1px solid ${stat.color}22`,
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}18` }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>

              {/* Value */}
              <div>
                {stat.loading ? (
                  <div
                    className="h-8 w-16 rounded-lg animate-pulse"
                    style={{ background: `${stat.color}20` }}
                  />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Recent events table ─────────────────────────────────────────────── */}
      <motion.div
        custom={6}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(0,0,0,0.07)', background: '#fff' }}
      >
        {/* Table header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(0,0,0,0.06)' }}
        >
          <h3 className="font-semibold text-gray-800">Recent Events</h3>
          <Link
            href="/admin/events"
            className="flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: '#D4AF37' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#a87d20'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Table */}
        {loadingEvents ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-lg animate-pulse"
                style={{ background: 'rgba(0,0,0,0.04)' }}
              />
            ))}
          </div>
        ) : recentEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CalendarDays size={40} className="text-gray-300" />
            <p className="text-gray-400 text-sm">No events yet.</p>
            <Link
              href="/admin/events/new"
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
                color: '#1a1a2e',
              }}
            >
              <Plus size={14} />
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                  {['Event Name', 'Type', 'Status', 'Created', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                {recentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="transition-colors"
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(212,175,55,0.03)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'transparent';
                    }}
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800 truncate max-w-[180px] block">
                        {event.title}
                      </span>
                      <span className="text-xs text-gray-400 mt-0.5 block">/{event.slug}</span>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 text-gray-500 capitalize">
                      {event.eventType.replace('_', ' ')}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={event.status} />
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {formatDate(event.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                          style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.08)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(212,175,55,0.16)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
                          }}
                        >
                          <Pencil size={12} />
                          Edit
                        </Link>
                        {event.status === 'published' && (
                          <Link
                            href={`/events/${event.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                            style={{ color: '#22c55e', background: 'rgba(34,197,94,0.08)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(34,197,94,0.16)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(34,197,94,0.08)';
                            }}
                          >
                            <ExternalLink size={12} />
                            View
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Quick actions ───────────────────────────────────────────────────── */}
      <motion.div
        custom={7}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            label: 'Create New Event',
            description: 'Start building a beautiful event page.',
            href: '/admin/events/new',
            icon: CalendarDays,
            color: '#D4AF37',
          },
          {
            label: 'Manage Assets',
            description: 'Upload frames, flowers, and decorations.',
            href: '/admin/assets',
            icon: Plus,
            color: '#6366f1',
          },
          {
            label: 'Browse Themes',
            description: 'Choose colors, fonts and button styles.',
            href: '/admin/themes',
            icon: Globe,
            color: '#ec4899',
          },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              href={action.href}
              className="flex items-start gap-4 rounded-2xl p-5 transition-all duration-200 group"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.07)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = `1px solid ${action.color}40`;
                e.currentTarget.style.boxShadow = `0 4px 20px ${action.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid rgba(0,0,0,0.07)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${action.color}15` }}
              >
                <Icon size={20} style={{ color: action.color }} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{action.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
