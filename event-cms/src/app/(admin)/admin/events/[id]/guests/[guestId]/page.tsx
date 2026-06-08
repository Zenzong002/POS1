"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  Eye,
  MessageSquare,
  Loader2,
  Save,
} from "lucide-react";
import { guestsCollection, eventsCollection } from "@/lib/firebase/firestore";
import type { Guest, GuestStatus, AttendanceStatus, Event } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTs(raw: Guest["createdAt"]): string {
  try {
    if (!raw) return "—";
    const d =
      raw instanceof Date ? raw
      : typeof raw === "string" ? new Date(raw)
      : "toDate" in (raw as object) ? (raw as { toDate(): Date }).toDate()
      : null;
    if (!d) return "—";
    return d.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const editSchema = z.object({
  fullName: z.string().min(1, "Required"),
  nickname: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
  status: z.enum(["invited", "viewed", "rsvp_pending", "attending", "not_attending", "completed"]),
});

type EditFormValues = z.infer<typeof editSchema>;

// ─── Small components ─────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors"
      style={{
        borderColor: copied ? "#16a34a40" : "rgba(0,0,0,0.12)",
        color: copied ? "#16a34a" : "#6b7280",
        background: copied ? "#f0fdf4" : "transparent",
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

function RsvpBadge({ status }: { status?: AttendanceStatus }) {
  if (!status) return <span className="text-xs text-gray-400">Not submitted</span>;
  const map: Record<AttendanceStatus, { bg: string; text: string; label: string }> = {
    attending: { bg: "#dcfce7", text: "#16a34a", label: "Attending" },
    not_attending: { bg: "#fee2e2", text: "#dc2626", label: "Not Attending" },
    maybe: { bg: "#fef9c3", text: "#ca8a04", label: "Maybe" },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

const TIMELINE_STEPS: { key: keyof Pick<Guest, "createdAt" | "viewedAt" | "rsvpAt">; label: string; icon: React.ElementType }[] = [
  { key: "createdAt", label: "Invited", icon: User },
  { key: "viewedAt", label: "Viewed", icon: Eye },
  { key: "rsvpAt", label: "RSVP'd", icon: Check },
];

const INPUT_CLASS =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white text-gray-800 placeholder-gray-400";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuestProfilePage() {
  const { id, guestId } = useParams<{ id: string; guestId: string }>();
  const router = useRouter();

  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (!id || !guestId) return;
    Promise.all([
      guestsCollection.get(guestId),
      eventsCollection.get(id),
    ])
      .then(([g, ev]) => {
        if (!g) { toast.error("Guest not found"); router.replace(`/admin/events/${id}/guests`); return; }
        setGuest(g);
        setEvent(ev);
        reset({
          fullName: g.fullName,
          nickname: g.nickname ?? "",
          phone: g.phone ?? "",
          email: g.email ?? "",
          notes: g.notes ?? "",
          status: g.status as EditFormValues["status"],
        });
      })
      .catch(() => toast.error("Failed to load guest"))
      .finally(() => setLoading(false));
  }, [id, guestId, reset, router]);

  const onSubmit = async (data: EditFormValues) => {
    if (!guest) return;
    setSaving(true);
    try {
      await guestsCollection.update(guest.id, {
        fullName: data.fullName,
        nickname: data.nickname ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        notes: data.notes ?? "",
        status: data.status as GuestStatus,
      });
      setGuest((prev) => prev ? { ...prev, ...data } : prev);
      toast.success("Guest updated");
    } catch {
      toast.error("Failed to update guest");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!guest) return;
    if (!confirm(`Delete guest "${guest.fullName}"? This cannot be undone.`)) return;
    try {
      await guestsCollection.remove(guest.id);
      toast.success("Guest deleted");
      router.replace(`/admin/events/${id}/guests`);
    } catch {
      toast.error("Failed to delete guest");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!guest) return null;

  const reminderMessage = `สวัสดี ${guest.nickname ?? guest.fullName},\nเราขอเชิญท่านร่วมงาน${event ? ` ${event.title}` : ""}\nกรุณาเปิดบัตรเชิญของท่าน:\n${guest.invitationUrl}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href={`/admin/events/${id}/guests`}
          className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} />
          Guest Management
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium truncate max-w-[180px]">{guest.fullName}</span>
      </div>

      {/* Guest info card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(212,175,55,0.12)", border: "1.5px solid rgba(212,175,55,0.3)" }}>
              <User size={22} style={{ color: "#D4AF37" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{guest.fullName}</h1>
              {guest.nickname && <p className="text-sm text-gray-400">({guest.nickname})</p>}
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {guest.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={14} className="text-gray-400" />
              {guest.phone}
            </div>
          )}
          {guest.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={14} className="text-gray-400" />
              {guest.email}
            </div>
          )}
          {guest.notes && (
            <div className="flex items-start gap-2 text-gray-600 sm:col-span-2">
              <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <span className="text-sm">{guest.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Invitation URL */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Invitation Link</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3">
          <p className="text-sm text-gray-700 break-all font-mono">{guest.invitationUrl}</p>
        </div>
        <div className="flex gap-2">
          <CopyButton text={guest.invitationUrl} label="Copy Link" />
          <a
            href={guest.invitationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Open
          </a>
        </div>
      </div>

      {/* Status timeline */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Status Timeline</h2>
        <div className="flex items-center gap-0">
          {TIMELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            const ts = guest[step.key];
            const done = Boolean(ts);
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: done ? "#dcfce7" : "#f3f4f6",
                      border: `1.5px solid ${done ? "#16a34a" : "#e5e7eb"}`,
                    }}
                  >
                    <Icon size={14} style={{ color: done ? "#16a34a" : "#9ca3af" }} />
                  </div>
                  <p className="text-xs font-medium mt-1" style={{ color: done ? "#16a34a" : "#9ca3af" }}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 text-center max-w-[80px] leading-tight">
                    {done ? formatTs(ts as Guest["createdAt"]) : "—"}
                  </p>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2" style={{ background: done ? "#86efac" : "#e5e7eb" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* View history */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Eye size={14} style={{ color: "#6366f1" }} />
          View History
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">{guest.visitCount ?? 0}</p>
            <p className="text-xs text-gray-400">Total Views</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{formatTs(guest.firstVisit)}</p>
            <p className="text-xs text-gray-400">First Visit</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{formatTs(guest.lastVisit)}</p>
            <p className="text-xs text-gray-400">Last Visit</p>
          </div>
        </div>
      </div>

      {/* RSVP details */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">RSVP Details</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <RsvpBadge status={guest.rsvpStatus} />
            <p className="text-xs text-gray-400 mt-1">Status</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{formatTs(guest.rsvpAt)}</p>
            <p className="text-xs text-gray-400">Submitted</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{guest.guestCount ?? "—"}</p>
            <p className="text-xs text-gray-400">Guests</p>
          </div>
        </div>
      </div>

      {/* Reminder section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MessageSquare size={14} style={{ color: "#f59e0b" }} />
            Reminder
          </h2>
          <button
            onClick={() => setShowReminder((v) => !v)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-yellow-300 text-yellow-700 hover:bg-yellow-50 transition-colors"
          >
            {showReminder ? "Hide" : "Generate Reminder"}
          </button>
        </div>

        {showReminder && (
          <div className="mt-2 space-y-2">
            <textarea
              readOnly
              rows={5}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none"
              value={reminderMessage}
            />
            <div className="flex gap-2">
              <CopyButton text={reminderMessage} label="Copy Message" />
              <span className="text-xs text-gray-400 self-center">
                {guest.reminderSent
                  ? `Last sent: ${formatTs(guest.reminderSentAt)}`
                  : "Not yet sent"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Edit guest form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Edit Guest Info</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Full Name *</label>
              <input {...register("fullName")} type="text" className={INPUT_CLASS} />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Nickname</label>
              <input {...register("nickname")} type="text" className={INPUT_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Phone</label>
              <input {...register("phone")} type="tel" className={INPUT_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Email</label>
              <input {...register("email")} type="email" className={INPUT_CLASS} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Notes</label>
            <textarea {...register("notes")} rows={2} className={INPUT_CLASS} style={{ resize: "vertical" }} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Status</label>
            <select {...register("status")} className={INPUT_CLASS}>
              <option value="invited">Invited</option>
              <option value="viewed">Viewed</option>
              <option value="rsvp_pending">RSVP Pending</option>
              <option value="attending">Attending</option>
              <option value="not_attending">Not Attending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #D4AF37, #c9a96e)" }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-end pb-8">
        <Link
          href={`/admin/events/${id}/guests`}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
        >
          <Clock size={14} />
          Back to Guest List
        </Link>
      </div>
    </div>
  );
}
