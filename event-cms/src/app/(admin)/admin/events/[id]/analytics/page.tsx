'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, RefreshCw, Users, Eye, CheckCircle, XCircle, Clock, BarChart2, Download } from 'lucide-react';
import { guestsCollection, rsvpsCollection } from '@/lib/firebase/firestore';
import type { Guest, RSVPSubmission, InvitationAnalytics } from '@/lib/types';

function calcAnalytics(guests: Guest[], rsvps: RSVPSubmission[]): InvitationAnalytics {
  const total = guests.length;
  const viewed = guests.filter(g => g.viewed).length;
  const attending = guests.filter(g => g.rsvpStatus === 'attending').length;
  const notAttending = guests.filter(g => g.rsvpStatus === 'not_attending').length;
  const maybe = guests.filter(g => g.rsvpStatus === 'maybe').length;
  const rsvpTotal = attending + notAttending + maybe;

  // Group views and RSVPs by date
  const viewsByDay: Record<string, number> = {};
  const rsvpsByDay: Record<string, number> = {};

  guests.forEach(g => {
    if (g.viewedAt) {
      const d = new Date(g.viewedAt as string).toISOString().slice(0, 10);
      viewsByDay[d] = (viewsByDay[d] ?? 0) + 1;
    }
    if (g.rsvpAt) {
      const d = new Date(g.rsvpAt as string).toISOString().slice(0, 10);
      rsvpsByDay[d] = (rsvpsByDay[d] ?? 0) + 1;
    }
  });

  return {
    totalGuests: total,
    viewed,
    notViewed: total - viewed,
    openRate: total > 0 ? Math.round((viewed / total) * 100) : 0,
    rsvpTotal,
    attending,
    notAttending,
    maybe,
    rsvpRate: total > 0 ? Math.round((rsvpTotal / total) * 100) : 0,
    viewsByDay,
    rsvpsByDay,
  };
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className={`h-3 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{value}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [analytics, setAnalytics] = useState<InvitationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [guests, rsvps] = await Promise.all([
        guestsCollection.listByEvent(id),
        rsvpsCollection.listByEvent(id),
      ]);
      setAnalytics(calcAnalytics(guests, rsvps));
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const exportReport = () => {
    if (!analytics) return;
    const lines = [
      `EventCraft Analytics Report`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `Total Guests:    ${analytics.totalGuests}`,
      `Viewed:          ${analytics.viewed} (${analytics.openRate}%)`,
      `Not Viewed:      ${analytics.notViewed}`,
      ``,
      `Total RSVPs:     ${analytics.rsvpTotal} (${analytics.rsvpRate}%)`,
      `Attending:       ${analytics.attending}`,
      `Not Attending:   ${analytics.notAttending}`,
      `Maybe:           ${analytics.maybe}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/admin/events/${id}`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={16} /> Event
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-yellow-500" /> Analytics
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportReport} className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-yellow-500 rounded-xl hover:bg-yellow-600 transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Guests" value={analytics.totalGuests} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard label="Invitations Viewed" value={analytics.viewed} icon={Eye} color="bg-green-50 text-green-600" />
        <StatCard label="Open Rate" value={`${analytics.openRate}%`} icon={BarChart2} color="bg-yellow-50 text-yellow-600" />
        <StatCard label="Attending" value={analytics.attending} icon={CheckCircle} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Not Attending" value={analytics.notAttending} icon={XCircle} color="bg-red-50 text-red-600" />
        <StatCard label="RSVP Rate" value={`${analytics.rsvpRate}%`} icon={Clock} color="bg-purple-50 text-purple-600" />
      </div>

      {/* RSVP breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-gray-800">RSVP Breakdown</h2>
        <div className="space-y-4">
          <BarRow label="Attending" value={analytics.attending} max={analytics.totalGuests} color="bg-emerald-500" />
          <BarRow label="Not Attending" value={analytics.notAttending} max={analytics.totalGuests} color="bg-red-400" />
          <BarRow label="Maybe" value={analytics.maybe} max={analytics.totalGuests} color="bg-yellow-400" />
          <BarRow label="Not Responded" value={analytics.totalGuests - analytics.rsvpTotal} max={analytics.totalGuests} color="bg-gray-300" />
        </div>
      </div>

      {/* Invitation pipeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-5">Invitation Pipeline</h2>
        <div className="grid grid-cols-4 gap-0">
          {[
            { label: 'Invited', value: analytics.totalGuests, color: 'bg-blue-500' },
            { label: 'Viewed', value: analytics.viewed, color: 'bg-indigo-500' },
            { label: "RSVP'd", value: analytics.rsvpTotal, color: 'bg-violet-500' },
            { label: 'Attending', value: analytics.attending, color: 'bg-emerald-500' },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex flex-col items-center">
              <div className={`w-full h-3 ${step.color} ${i === 0 ? 'rounded-l-full' : ''} ${i === arr.length - 1 ? 'rounded-r-full' : ''}`}
                style={{ opacity: 0.4 + (i * 0.2) }} />
              <p className="text-2xl font-bold text-gray-900 mt-2">{step.value}</p>
              <p className="text-xs text-gray-500">{step.label}</p>
              {i < arr.length - 1 && (
                <p className="text-xs text-gray-400">
                  {step.value > 0 ? Math.round((arr[i + 1].value / step.value) * 100) : 0}% →
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Views by day */}
      {Object.keys(analytics.viewsByDay).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-5">Views by Day</h2>
          <div className="space-y-2">
            {Object.entries(analytics.viewsByDay).sort().map(([date, count]) => (
              <BarRow key={date} label={date} value={count}
                max={Math.max(...Object.values(analytics.viewsByDay))} color="bg-blue-400" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
