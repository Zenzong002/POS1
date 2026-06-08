'use client';

import { useEffect, useState, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus,
  Search,
  Images,
  X,
  Loader2,
  Tag,
} from 'lucide-react';
import { assetsCollection } from '@/lib/firebase/firestore';
import AssetCard from '@/components/admin/AssetCard';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import type { AssetItem, AssetCategory } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_CATEGORIES: AssetCategory[] = [
  'frames',
  'flowers',
  'envelopes',
  'leaves',
  'ribbons',
  'icons',
  'dividers',
  'traditional',
];

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  frames:      'Frames',
  flowers:     'Flowers',
  envelopes:   'Envelopes',
  leaves:      'Leaves',
  ribbons:     'Ribbons',
  icons:       'Icons',
  dividers:    'Dividers',
  traditional: 'Traditional',
};

const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 ' +
  'transition-colors placeholder-gray-300';

const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

// ─── Empty default form ───────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '',
  category: 'flowers' as AssetCategory,
  imageUrl: '',
  tags: '',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [assets, setAssets] = useState<(AssetItem & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadAssets = () => {
    setLoading(true);
    assetsCollection
      .list()
      .then(setAssets)
      .catch(() => toast.error('Failed to load assets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAssets(); }, []);

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assets.filter((a) => {
      const matchCat = categoryFilter === 'all' || a.category === categoryFilter;
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [assets, categoryFilter, search]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Asset name is required'); return; }
    if (!form.imageUrl.trim()) { toast.error('Image URL is required'); return; }
    setSaving(true);
    try {
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const id = await assetsCollection.create({
        name: form.name.trim(),
        category: form.category,
        imageUrl: form.imageUrl.trim(),
        tags,
      });
      const newAsset: AssetItem & { id: string } = {
        id,
        name: form.name.trim(),
        category: form.category,
        imageUrl: form.imageUrl.trim(),
        tags,
      };
      setAssets((prev) => [newAsset, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success('Asset added');
    } catch {
      toast.error('Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await assetsCollection.remove(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      toast.success('Asset deleted');
    } catch {
      toast.error('Failed to delete asset');
    } finally {
      setDeleting(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => toast.success('URL copied to clipboard'),
      () => toast.error('Failed to copy URL'),
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage decoration images, icons, and graphic elements
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
          style={{
            background: showForm
              ? '#f3f4f6'
              : 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)',
            color: showForm ? '#374151' : '#1a1a2e',
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add Asset'}
        </button>
      </div>

      {/* Add Asset Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
            New Asset
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className={labelCls}>
                Asset Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Gold Rose Frame"
                className={inputCls}
              />
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AssetCategory }))}
                className={inputCls}
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="sm:col-span-2">
              <label className={labelCls}>
                <span className="flex items-center gap-1.5">
                  <Tag size={13} />
                  Tags
                  <span className="text-gray-400 font-normal">(comma-separated)</span>
                </span>
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="e.g. gold, frame, luxury, wedding"
                className={inputCls}
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <ImageUrlInput
                label="Image URL *"
                value={form.imageUrl}
                onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
                placeholder="https://example.com/asset.png"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
            <button
              type="button"
              onClick={() => { setForm(EMPTY_FORM); setShowForm(false); }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 100%)', color: '#1a1a2e' }}
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? 'Saving…' : 'Save Asset'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 bg-white"
          />
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
          style={
            categoryFilter === 'all'
              ? { background: '#1a1a2e', color: '#F5D060' }
              : { background: '#f3f4f6', color: '#6b7280' }
          }
        >
          All ({assets.length})
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const count = assets.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize"
              style={
                categoryFilter === cat
                  ? { background: '#1a1a2e', color: '#F5D060' }
                  : { background: '#f3f4f6', color: '#6b7280' }
              }
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-2xl mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Images size={48} className="text-gray-200" />
          <p className="text-gray-400 font-medium">No assets found</p>
          <p className="text-gray-300 text-sm">
            {search || categoryFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Add your first asset to get started.'}
          </p>
          {!search && categoryFilter === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)', color: '#1a1a2e' }}
            >
              <Plus size={14} />
              Add Asset
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              id={asset.id}
              name={asset.name}
              category={asset.category}
              imageUrl={asset.imageUrl}
              onCopyUrl={handleCopyUrl}
              onDelete={handleDelete}
              deleting={deleting === asset.id}
            />
          ))}
        </div>
      )}

      {/* Count footer */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center pb-4">
          Showing {filtered.length} of {assets.length} assets
        </p>
      )}
    </div>
  );
}
