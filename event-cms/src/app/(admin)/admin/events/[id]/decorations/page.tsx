'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Plus,
  Layers,
  RotateCcw,
  Search,
} from 'lucide-react';
import { assetsCollection, eventSectionsCollection } from '@/lib/firebase/firestore';
import type { AssetItem, AssetCategory, DecorationItem } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_CATEGORIES: (AssetCategory | 'all')[] = [
  'all',
  'frames',
  'flowers',
  'envelopes',
  'leaves',
  'ribbons',
  'icons',
  'dividers',
  'traditional',
];

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

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-colors';

const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

// ─── Decoration field editor ──────────────────────────────────────────────────

interface DecEditProps {
  dec: DecorationItem;
  onChange: (id: string, field: keyof DecorationItem, value: string | number) => void;
  onDelete: (id: string) => void;
}

function DecorationEditor({ dec, onChange, onDelete }: DecEditProps) {
  const numField = (
    label: string,
    field: keyof DecorationItem,
    min: number,
    max: number,
    step = 1,
  ) => (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="number"
        value={dec[field] as number}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(dec.id, field, Number(e.target.value))}
        className={inputCls}
      />
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-50">
        <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0 relative">
          <Image
            src={dec.imageUrl}
            alt={dec.name}
            fill
            className="object-contain p-1"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={dec.name}
            onChange={(e) => onChange(dec.id, 'name', e.target.value)}
            className="w-full text-sm font-medium text-gray-800 bg-transparent focus:outline-none focus:bg-gray-50 rounded px-1 -ml-1"
            placeholder="Decoration name"
          />
        </div>
        <button
          onClick={() => onDelete(dec.id)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
          title="Remove decoration"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Fields grid */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {numField('X Position (%)', 'positionX', 0, 100)}
        {numField('Y Position (%)', 'positionY', 0, 100)}
        {numField('Width (px)', 'width', 10, 2000)}
        {numField('Height (px)', 'height', 10, 2000)}
        {numField('Rotation (deg)', 'rotation', -360, 360)}
        {numField('Z-Index', 'zIndex', 0, 999)}

        {/* Opacity slider */}
        <div className="col-span-2">
          <label className={labelCls}>
            Opacity &mdash; {Math.round(dec.opacity * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={dec.opacity}
            onChange={(e) => onChange(dec.id, 'opacity', Number(e.target.value))}
            className="w-full accent-yellow-500"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DecorationsPage() {
  const { id } = useParams<{ id: string }>();

  const [assets, setAssets] = useState<(AssetItem & { id: string })[]>([]);
  const [decorations, setDecorations] = useState<DecorationItem[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [assetCat, setAssetCat] = useState<AssetCategory | 'all'>('all');

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    assetsCollection
      .list()
      .then(setAssets)
      .catch(() => toast.error('Failed to load assets'))
      .finally(() => setAssetsLoading(false));
  }, []);

  useEffect(() => {
    if (!id) return;
    eventSectionsCollection
      .getByEventId(id)
      .then((sections) => {
        if (sections?.decorations) setDecorations(sections.decorations);
      })
      .catch(() => toast.error('Failed to load decorations'))
      .finally(() => setSectionsLoading(false));
  }, [id]);

  // ── Filtered assets ───────────────────────────────────────────────────────

  const filteredAssets = assets.filter((a) => {
    const matchCat = assetCat === 'all' || a.category === assetCat;
    const q = assetSearch.toLowerCase();
    const matchSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  // ── Add decoration from asset ─────────────────────────────────────────────

  const addDecoration = (asset: AssetItem & { id: string }) => {
    const dec: DecorationItem = {
      id: uid(),
      name: asset.name,
      imageUrl: asset.imageUrl,
      positionX: 50,
      positionY: 50,
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
      zIndex: decorations.length + 1,
    };
    setDecorations((prev) => [...prev, dec]);
    toast.success(`Added "${asset.name}"`);
  };

  // ── Update field ──────────────────────────────────────────────────────────

  const updateField = useCallback(
    (decId: string, field: keyof DecorationItem, value: string | number) => {
      setDecorations((prev) =>
        prev.map((d) => (d.id === decId ? { ...d, [field]: value } : d)),
      );
    },
    [],
  );

  // ── Delete ────────────────────────────────────────────────────────────────

  const removeDecoration = (decId: string) => {
    setDecorations((prev) => prev.filter((d) => d.id !== decId));
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const existing = await eventSectionsCollection.getByEventId(id);
      if (existing) {
        await eventSectionsCollection.update(id, { decorations });
      } else {
        await eventSectionsCollection.save(id, { decorations });
      }
      toast.success('Decorations saved');
    } catch {
      toast.error('Failed to save decorations');
    } finally {
      setSaving(false);
    }
  };

  const loading = assetsLoading || sectionsLoading;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
        <span className="text-gray-700 font-medium">Decorations</span>
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers size={22} style={{ color: '#f97316' }} />
            Decorations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pick assets from the library and position them on your event page
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)', color: '#1a1a2e' }}
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save Decorations'}
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-100 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left panel: Asset picker ───────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="font-semibold text-gray-700 text-sm">Asset Library</h2>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets…"
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white"
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAssetCat(cat)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-all capitalize"
                  style={
                    assetCat === cat
                      ? { background: '#1a1a2e', color: '#F5D060' }
                      : { background: '#f3f4f6', color: '#6b7280' }
                  }
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>

            {/* Asset grid */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {filteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
                  <p className="text-gray-300 text-sm">No assets found</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 p-2 max-h-[520px] overflow-y-auto">
                  {filteredAssets.map((asset) => {
                    const colors = CATEGORY_COLORS[asset.category];
                    return (
                      <button
                        key={asset.id}
                        onClick={() => addDecoration(asset)}
                        title={`Add "${asset.name}"`}
                        className="group relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square hover:border-yellow-300 hover:shadow-md transition-all"
                      >
                        <Image
                          src={asset.imageUrl}
                          alt={asset.name}
                          fill
                          className="object-contain p-2 transition-transform group-hover:scale-110"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-end p-1 opacity-0 group-hover:opacity-100">
                          <span
                            className="text-xs font-semibold px-1.5 py-0.5 rounded-full truncate w-full text-center"
                            style={{ background: colors.bg, color: colors.text }}
                          >
                            <Plus size={10} className="inline" /> Add
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right panel: Decorations list + canvas ────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Visual canvas preview */}
            <div>
              <h2 className="font-semibold text-gray-700 text-sm mb-2">
                Canvas Preview
                <span className="text-xs text-gray-400 font-normal ml-2">
                  (positions are % based — 0,0 = top-left)
                </span>
              </h2>
              <div
                className="relative w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden"
                style={{ paddingBottom: '56.25%' /* 16:9 */ }}
              >
                {decorations.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
                    Add decorations from the asset library
                  </div>
                )}
                {decorations.map((dec) => (
                  <div
                    key={dec.id}
                    title={dec.name}
                    className="absolute"
                    style={{
                      left: `${dec.positionX}%`,
                      top: `${dec.positionY}%`,
                      width: `${dec.width}px`,
                      height: `${dec.height}px`,
                      transform: `translate(-50%, -50%) rotate(${dec.rotation}deg)`,
                      opacity: dec.opacity,
                      zIndex: dec.zIndex,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dec.imageUrl}
                      alt={dec.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Decorations list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-gray-700 text-sm">
                  Added Decorations
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    ({decorations.length})
                  </span>
                </h2>
                {decorations.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Remove all decorations?')) setDecorations([]);
                    }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <RotateCcw size={12} />
                    Clear all
                  </button>
                )}
              </div>

              {decorations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-12 gap-2 text-center">
                  <Layers size={32} className="text-gray-200" />
                  <p className="text-gray-400 text-sm font-medium">No decorations added yet</p>
                  <p className="text-gray-300 text-xs">Click an asset on the left to add it</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {decorations.map((dec) => (
                    <DecorationEditor
                      key={dec.id}
                      dec={dec}
                      onChange={updateField}
                      onDelete={removeDecoration}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
