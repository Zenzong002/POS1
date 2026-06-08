"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Copy,
  Check,
  Trash2,
  Eye,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import type { Guest, GuestStatus, AttendanceStatus } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(raw: Guest["createdAt"]): string {
  try {
    const d =
      raw instanceof Date
        ? raw
        : typeof raw === "string"
        ? new Date(raw)
        : "toDate" in (raw as object)
        ? (raw as { toDate(): Date }).toDate()
        : null;
    if (!d) return "—";
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function lastActivity(guest: Guest): Guest["createdAt"] {
  return guest.rsvpAt ?? guest.viewedAt ?? guest.createdAt;
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function RsvpBadge({ status }: { status?: AttendanceStatus }) {
  if (!status)
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ background: "#f3f4f6", color: "#9ca3af" }}>
        Pending
      </span>
    );
  const map: Record<AttendanceStatus, { bg: string; text: string; label: string }> = {
    attending: { bg: "#dcfce7", text: "#16a34a", label: "Attending" },
    not_attending: { bg: "#fee2e2", text: "#dc2626", label: "Not Attending" },
    maybe: { bg: "#fef9c3", text: "#ca8a04", label: "Maybe" },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

function ViewedBadge({ viewed }: { viewed: boolean }) {
  return viewed ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "#16a34a" }}>
      <Check size={12} />
      Viewed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "#9ca3af" }}>
      — Not viewed
    </span>
  );
}

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors"
      style={{
        borderColor: copied ? "#16a34a30" : "rgba(0,0,0,0.1)",
        color: copied ? "#16a34a" : "#6b7280",
        background: copied ? "#f0fdf4" : "transparent",
      }}
      title={`Copy ${label}`}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : label}
    </button>
  );
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

type FilterValue = "all" | GuestStatus;

const FILTER_TABS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "invited", label: "Invited" },
  { value: "viewed", label: "Viewed" },
  { value: "attending", label: "Attending" },
  { value: "not_attending", label: "Not Attending" },
  { value: "rsvp_pending", label: "Pending" },
];

type SortKey = "name" | "lastActivity" | "rsvpStatus";

// ─── Props ────────────────────────────────────────────────────────────────────

interface GuestTableProps {
  guests: Guest[];
  onUpdate: (id: string, data: Partial<Guest>) => void;
  onDelete: (id: string) => void;
  eventSlug: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuestTable({
  guests,
  onDelete,
  eventSlug,
}: GuestTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");
  const [sortKey, setSortKey] = useState<SortKey>("lastActivity");
  const [reminderGuestId, setReminderGuestId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = guests.filter((g) => {
      const matchStatus = statusFilter === "all" || g.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        g.fullName.toLowerCase().includes(q) ||
        (g.nickname ?? "").toLowerCase().includes(q) ||
        (g.phone ?? "").includes(q) ||
        (g.email ?? "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });

    list = list.slice().sort((a, b) => {
      if (sortKey === "name") return a.fullName.localeCompare(b.fullName);
      if (sortKey === "rsvpStatus") {
        return (a.rsvpStatus ?? "").localeCompare(b.rsvpStatus ?? "");
      }
      // lastActivity
      const toMs = (g: Guest) => {
        const raw = lastActivity(g);
        try {
          if (!raw) return 0;
          if (raw instanceof Date) return raw.getTime();
          if (typeof raw === "string") return new Date(raw).getTime();
          if ("toDate" in (raw as object)) return (raw as { toDate(): Date }).toDate().getTime();
          return 0;
        } catch { return 0; }
      };
      return toMs(b) - toMs(a);
    });

    return list;
  }, [guests, statusFilter, search, sortKey]);

  const reminderGuest = reminderGuestId ? guests.find((g) => g.id === reminderGuestId) : null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white"
          />
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white focus:outline-none"
        >
          <option value="lastActivity">Sort: Last Activity</option>
          <option value="name">Sort: Name</option>
          <option value="rsvpStatus">Sort: RSVP Status</option>
        </select>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {FILTER_TABS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={
              statusFilter === f.value
                ? { background: "#fff", color: "#111827", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { color: "#6b7280" }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reminder modal */}
      {reminderGuest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setReminderGuestId(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 mb-1">Reminder Message</h3>
            <p className="text-xs text-gray-400 mb-3">Copy and send via LINE / WhatsApp</p>
            <textarea
              readOnly
              rows={6}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none"
              value={`สวัสดี ${reminderGuest.nickname ?? reminderGuest.fullName},\nเราขอเชิญท่านร่วมงาน\nกรุณาเปิดบัตรเชิญของท่าน:\n${reminderGuest.invitationUrl}`}
            />
            <div className="flex gap-2 mt-3">
              <CopyButton
                text={`สวัสดี ${reminderGuest.nickname ?? reminderGuest.fullName},\nเราขอเชิญท่านร่วมงาน\nกรุณาเปิดบัตรเชิญของท่าน:\n${reminderGuest.invitationUrl}`}
                label="Copy Message"
              />
              <button
                onClick={() => setReminderGuestId(null)}
                className="ml-auto text-sm text-gray-400 hover:text-gray-700 px-3 py-1 rounded-lg border border-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-gray-400 font-medium text-sm">No guests found</p>
          {(search || statusFilter !== "all") && (
            <p className="text-gray-300 text-xs mt-1">Try adjusting your search or filter.</p>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                    {["Name", "Phone", "Invitation Link", "Viewed", "RSVP", "Guests", "Last Activity", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{guest.fullName}</p>
                        {guest.nickname && (
                          <p className="text-xs text-gray-400">{guest.nickname}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{guest.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 max-w-[160px]">
                          <span className="text-xs text-gray-400 truncate">
                            …/{guest.token}
                          </span>
                          <CopyButton text={guest.invitationUrl} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ViewedBadge viewed={guest.viewed} />
                      </td>
                      <td className="px-4 py-3">
                        <RsvpBadge status={guest.rsvpStatus} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-center">
                        {guest.guestCount ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {relativeTime(lastActivity(guest))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/events/${guest.eventId}/guests/${guest.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Profile"
                          >
                            <Eye size={14} />
                          </Link>
                          <a
                            href={guest.invitationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="Open Invitation"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={() => setReminderGuestId(guest.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                            title="Send Reminder"
                          >
                            <MessageSquare size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(guest.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {filtered.length} of {guests.length} guests
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((guest) => (
              <div key={guest.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{guest.fullName}</p>
                    {guest.nickname && (
                      <p className="text-xs text-gray-400">({guest.nickname})</p>
                    )}
                    {guest.phone && (
                      <p className="text-xs text-gray-500 mt-0.5">{guest.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <RsvpBadge status={guest.rsvpStatus} />
                    <ViewedBadge viewed={guest.viewed} />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-xs text-gray-400 truncate flex-1">…/{guest.token}</span>
                  <CopyButton text={guest.invitationUrl} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{relativeTime(lastActivity(guest))}</span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/events/${guest.eventId}/guests/${guest.id}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Eye size={14} />
                    </Link>
                    <button
                      onClick={() => setReminderGuestId(guest.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                    >
                      <MessageSquare size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(guest.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
