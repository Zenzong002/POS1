"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  UserPlus,
  Upload,
  Download,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart2,
  Loader2,
} from "lucide-react";
import { guestsCollection, eventsCollection } from "@/lib/firebase/firestore";
import { guestsToCSV } from "@/lib/utils";
import type { Guest, GuestStatus } from "@/lib/types";
import GuestTable from "@/components/admin/GuestTable";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}

const PIPELINE: { status: GuestStatus; label: string; color: string }[] = [
  { status: "invited", label: "Invited", color: "#6366f1" },
  { status: "viewed", label: "Viewed", color: "#0ea5e9" },
  { status: "rsvp_pending", label: "RSVP Pending", color: "#f59e0b" },
  { status: "attending", label: "Attending", color: "#22c55e" },
  { status: "not_attending", label: "Not Attending", color: "#ef4444" },
  { status: "completed", label: "Completed", color: "#8b5cf6" },
];

// ─── CSV export helper ────────────────────────────────────────────────────────

function exportCSV(guests: Guest[]) {
  const csv = guestsToCSV(guests);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `guests-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuestManagerPage() {
  const { id } = useParams<{ id: string }>();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventSlug, setEventSlug] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      guestsCollection.listByEvent(id),
      eventsCollection.get(id),
    ])
      .then(([guestList, event]) => {
        setGuests(guestList);
        setEventSlug(event?.slug ?? "");
      })
      .catch(() => toast.error("Failed to load guests"))
      .finally(() => setLoading(false));
  }, [id]);

  // Stats
  const stats = useMemo(() => {
    const total = guests.length;
    const viewed = guests.filter((g) => g.viewed).length;
    const rsvpd = guests.filter((g) => g.rsvpStatus).length;
    const attending = guests.filter((g) => g.rsvpStatus === "attending").length;
    const notAttending = guests.filter((g) => g.rsvpStatus === "not_attending").length;
    const pending = guests.filter((g) => !g.rsvpStatus).length;
    return { total, viewed, rsvpd, attending, notAttending, pending };
  }, [guests]);

  const statCards: StatCard[] = [
    { label: "Total", value: stats.total, color: "#6366f1", icon: Users },
    { label: "Viewed", value: stats.viewed, color: "#0ea5e9", icon: Eye },
    { label: "RSVP'd", value: stats.rsvpd, color: "#f59e0b", icon: Clock },
    { label: "Attending", value: stats.attending, color: "#22c55e", icon: CheckCircle },
    { label: "Not Attending", value: stats.notAttending, color: "#ef4444", icon: XCircle },
    { label: "Pending", value: stats.pending, color: "#9ca3af", icon: BarChart2 },
  ];

  // Pipeline counts by status
  const pipelineCounts = useMemo(() => {
    const map: Record<GuestStatus, number> = {
      invited: 0,
      viewed: 0,
      rsvp_pending: 0,
      attending: 0,
      not_attending: 0,
      completed: 0,
    };
    guests.forEach((g) => { map[g.status] = (map[g.status] ?? 0) + 1; });
    return map;
  }, [guests]);

  const handleUpdate = (id: string, data: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  };

  const handleDelete = async (guestId: string) => {
    if (!confirm("Delete this guest? This cannot be undone.")) return;
    try {
      await guestsCollection.remove(guestId);
      setGuests((prev) => prev.filter((g) => g.id !== guestId));
      toast.success("Guest deleted");
    } catch {
      toast.error("Failed to delete guest");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/admin/events/${id}`}
          className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={14} />
          Event Editor
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium">Guest Management</span>
      </div>

      {/* Title + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} style={{ color: "#D4AF37" }} />
            Guest Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">{guests.length} total guests</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportCSV(guests)}
            disabled={guests.length === 0}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-40"
          >
            <Download size={14} />
            Export CSV
          </button>
          <Link
            href={`/admin/events/${id}/guests/import`}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
          >
            <Upload size={14} />
            Import CSV
          </Link>
          <Link
            href={`/admin/events/${id}/guests/new`}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #D4AF37, #c9a96e)" }}
          >
            <UserPlus size={14} />
            Add Guest
          </Link>
          <Link
            href={`/admin/events/${id}/analytics`}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
          >
            <BarChart2 size={14} />
            Analytics
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center shadow-sm"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
                style={{ background: `${stat.color}15` }}
              >
                <Icon size={17} style={{ color: stat.color }} />
              </div>
              <p className="text-xl font-bold text-gray-800 leading-none">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1 text-center">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Guest Pipeline</h2>
        <div className="flex flex-wrap gap-2">
          {PIPELINE.map((step, i) => (
            <div key={step.status} className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: `${step.color}15`, color: step.color }}
              >
                <span>{pipelineCounts[step.status] ?? 0}</span>
                <span>{step.label}</span>
              </div>
              {i < PIPELINE.length - 1 && (
                <span className="text-gray-300 text-xs">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Guest table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-300" />
        </div>
      ) : (
        <GuestTable
          guests={guests}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          eventSlug={eventSlug}
        />
      )}

      <div className="flex justify-end pb-8">
        <Link
          href={`/admin/events/${id}`}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Back to Event
        </Link>
      </div>
    </div>
  );
}
