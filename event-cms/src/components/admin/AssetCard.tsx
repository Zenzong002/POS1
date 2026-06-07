'use client';

import Image from 'next/image';
import { Copy, Trash2 } from 'lucide-react';
import type { AssetCategory } from '@/lib/types';

// ─── Category badge colours ───────────────────────────────────────────────────

const CATEGORY_COLORS: Record<AssetCategory, { bg: string; text: string }> = {
  frames:      { bg: '#ede9fe', text: '#7c3aed' },
  flowers:     { bg: '#fce7f3', text: '#be185d' },
  envelopes:   { bg: '#fef3c7', text: '#b45309' },
  leaves:      { bg: '#dcfce7', text: '#16a34a' },
  ribbons:     { bg: '#fce7f3', text: '#db2777' },
  icons:       { bg: '#e0f2fe', text: '#0369a1' },
  dividers:    { bg: '#f3f4f6', text: '#4b5563' },
  traditional: { bg: '#fee2e2', text: '#b91c1c' },
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AssetCardProps {
  id: string;
  name: string;
  category: AssetCategory;
  imageUrl: string;
  onCopyUrl: (url: string) => void;
  onDelete: (id: string) => void;
  deleting?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssetCard({
  id,
  name,
  category,
  imageUrl,
  onCopyUrl,
  onDelete,
  deleting = false,
}: AssetCardProps) {
  const colors = CATEGORY_COLORS[category];

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Thumbnail */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-contain p-3 transition-transform duration-200 group-hover:scale-105"
          unoptimized
        />

        {/* Hover overlay with copy URL action */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onCopyUrl(imageUrl)}
            className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <Copy size={12} />
            Copy URL
          </button>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 truncate" title={name}>
            {name}
          </p>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mt-0.5 capitalize"
            style={{ background: colors.bg, color: colors.text }}
          >
            {category}
          </span>
        </div>

        <button
          onClick={() => onDelete(id)}
          disabled={deleting}
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
          title="Delete asset"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
