"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, UserPlus, Copy, Check, PlusCircle, List, Loader2 } from "lucide-react";
import { guestsCollection } from "@/lib/firebase/firestore";
import { generateToken, buildInvitationUrl } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const guestSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  nickname: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().max(500, "Notes too long").optional(),
});

type GuestFormValues = z.infer<typeof guestSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INPUT_CLASS =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white text-gray-800 placeholder-gray-400";

function CopyButton({ text }: { text: string }) {
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
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddGuestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedGuestName, setGeneratedGuestName] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
  });

  const onSubmit = async (data: GuestFormValues) => {
    try {
      const token = generateToken();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin;
      const invitationUrl = buildInvitationUrl(baseUrl, token);

      await guestsCollection.create({
        eventId: id,
        fullName: data.fullName,
        nickname: data.nickname ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        token,
        invitationUrl,
        viewed: false,
        reminderSent: false,
        status: "invited",
        notes: data.notes ?? "",
        visitCount: 0,
      });

      setGeneratedUrl(invitationUrl);
      setGeneratedGuestName(data.fullName);
      toast.success("Guest added successfully!");
      reset();
    } catch {
      toast.error("Failed to add guest");
    }
  };

  const handleAddAnother = () => {
    setGeneratedUrl(null);
    setGeneratedGuestName("");
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/admin/events/${id}/guests`}
          className="text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={14} />
          Guest Management
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium">Add Guest</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus size={22} style={{ color: "#D4AF37" }} />
          Add New Guest
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          A personal invitation link will be generated automatically.
        </p>
      </div>

      {/* Success state */}
      {generatedUrl && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={16} style={{ color: "#16a34a" }} />
            </div>
            <div>
              <p className="font-semibold text-green-900 text-sm">{generatedGuestName} added!</p>
              <p className="text-xs text-green-700">Invitation link generated</p>
            </div>
          </div>

          <div className="bg-white border border-green-200 rounded-xl p-3 mb-3">
            <p className="text-xs text-gray-400 mb-1">Invitation URL</p>
            <p className="text-sm text-gray-700 break-all font-mono">{generatedUrl}</p>
          </div>

          <div className="flex gap-2">
            <CopyButton text={generatedUrl} />
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddAnother}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-green-300 text-green-700 hover:bg-green-100 transition-colors"
            >
              <PlusCircle size={14} />
              Add Another
            </button>
            <Link
              href={`/admin/events/${id}/guests`}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #D4AF37, #c9a96e)" }}
            >
              <List size={14} />
              Guest List
            </Link>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register("fullName")}
              type="text"
              placeholder="e.g. Somchai Jaidee"
              className={INPUT_CLASS}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Nickname */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Nickname{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              {...register("nickname")}
              type="text"
              placeholder="e.g. Chai"
              className={INPUT_CLASS}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Phone{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="e.g. 0812345678"
              className={INPUT_CLASS}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Email{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="guest@example.com"
              className={INPUT_CLASS}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Notes{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Any notes about this guest…"
              className={INPUT_CLASS}
              style={{ resize: "vertical" }}
            />
            {errors.notes && (
              <p className="text-xs text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #D4AF37, #c9a96e)" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Add Guest
                </>
              )}
            </button>
            <Link
              href={`/admin/events/${id}/guests`}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
