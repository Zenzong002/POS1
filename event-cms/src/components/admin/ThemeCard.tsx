'use client';

import Image from 'next/image';
import { Pencil, CheckCircle2, Trash2 } from 'lucide-react';
import type { Theme } from '@/lib/types';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThemeCardProps {
  theme: Theme;
  selected?: boolean;
  onApply?: (theme: Theme) => void;
  onEdit?: (theme: Theme) => void;
  onDelete?: (theme: Theme) => void;
  actionLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ThemeCard({
  theme,
  selected = false,
  onApply,
  onEdit,
  onDelete,
  actionLabel = 'Apply',
}: ThemeCardProps) {
  return (
    <div
      className={[
        'relative bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition-all duration-200',
        selected
          ? 'border-yellow-400 shadow-yellow-100 shadow-lg'
          : 'border-gray-100 hover:shadow-md hover:border-gray-200',
      ].join(' ')}
    >
      {/* Selected checkmark */}
      {selected && (
        <div className="absolute top-3 right-3 z-10">
          <CheckCircle2 size={20} className="text-yellow-500 fill-yellow-100" />
        </div>
      )}

      {/* Preview image */}
      {theme.previewImageUrl ? (
        <div className="relative w-full h-28 bg-gray-50">
          <Image
            src={theme.previewImageUrl}
            alt={theme.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        /* Colour stripe preview */
        <div
          className="w-full h-10 flex"
          aria-label="Theme colour preview"
        >
          <div className="flex-1" style={{ background: theme.primaryColor }} />
          <div className="flex-1" style={{ background: theme.secondaryColor }} />
          <div className="flex-1" style={{ background: theme.accentColor }} />
        </div>
      )}

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Name + font */}
        <div>
          <h3
            className="font-semibold text-gray-900 text-sm truncate"
            style={{ fontFamily: theme.fontFamily }}
          >
            {theme.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{theme.fontFamily}</p>
        </div>

        {/* Colour swatches */}
        <div className="flex items-center gap-2">
          {[
            { color: theme.primaryColor, title: 'Primary' },
            { color: theme.secondaryColor, title: 'Secondary' },
            { color: theme.accentColor, title: 'Accent' },
          ].map(({ color, title }) => (
            <div
              key={title}
              title={`${title}: ${color}`}
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
              style={{ background: color }}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1 capitalize">{theme.borderRadius} radius</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
          {onApply && (
            <button
              onClick={() => onApply(theme)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-colors"
              style={{
                background: selected
                  ? 'linear-gradient(135deg, #D4AF37, #F5D060)'
                  : 'rgba(212,175,55,0.1)',
                color: selected ? '#1a1a2e' : '#b45309',
              }}
            >
              {selected ? 'Applied' : actionLabel}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(theme)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Edit theme"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(theme)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete theme"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
