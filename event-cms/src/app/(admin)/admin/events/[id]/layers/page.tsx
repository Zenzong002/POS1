'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Layers } from 'lucide-react';
import { eventSectionsCollection } from '@/lib/firebase/firestore';
import type { Layer, LayerType } from '@/lib/types';

const SECTIONS = ['hero','story','timeline','schedule','gallery','location','rsvp','blessing','gift'];

const LAYER_TYPES: LayerType[] = ['background','image','video','decoration','text','overlay'];

const LAYER_COLORS: Record<LayerType, string> = {
  background: 'bg-blue-100 text-blue-700',
  image:       'bg-green-100 text-green-700',
  video:       'bg-purple-100 text-purple-700',
  decoration:  'bg-yellow-100 text-yellow-700',
  text:        'bg-gray-100 text-gray-700',
  overlay:     'bg-red-100 text-red-700',
};

function randomId() { return Math.random().toString(36).slice(2, 10); }

function newLayer(type: LayerType): Layer {
  return { id: randomId(), name: `New ${type}`, type, positionX: 0, positionY: 0, width: 100, height: 100, rotation: 0, opacity: 1, zIndex: 1 };
}

function Slider({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span><span>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-yellow-500" />
    </div>
  );
}

export default function LayersPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [section, setSection] = useState('hero');
  const [allLayers, setAllLayers] = useState<Record<string, Layer[]>>({});
  const [selected, setSelected] = useState<Layer | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const sectionLayers = allLayers[section] ?? [];

  const load = useCallback(async () => {
    try {
      const data = await eventSectionsCollection.getByEventId(id);
      setAllLayers((data?.visualSettings?.layers as Record<string, Layer[]>) ?? {});
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const save = async (updated: Record<string, Layer[]>) => {
    setSaving(true);
    try {
      await eventSectionsCollection.save(id, {
        visualSettings: { layers: updated } as never,
      });
      toast.success('Layers saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const updateSectionLayers = (layers: Layer[]) => {
    const updated = { ...allLayers, [section]: layers };
    setAllLayers(updated);
    return updated;
  };

  const addLayer = (type: LayerType) => {
    const layer = newLayer(type);
    const updated = updateSectionLayers([...sectionLayers, layer]);
    setSelected(layer);
    save(updated);
  };

  const deleteLayer = (layerId: string) => {
    const updated = updateSectionLayers(sectionLayers.filter(l => l.id !== layerId));
    if (selected?.id === layerId) setSelected(null);
    save(updated);
  };

  const moveLayer = (layerId: string, dir: -1 | 1) => {
    const idx = sectionLayers.findIndex(l => l.id === layerId);
    if (idx + dir < 0 || idx + dir >= sectionLayers.length) return;
    const arr = [...sectionLayers];
    [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
    const updated = updateSectionLayers(arr);
    save(updated);
  };

  const updateSelected = (patch: Partial<Layer>) => {
    if (!selected) return;
    const updated_layer = { ...selected, ...patch };
    setSelected(updated_layer);
    const updated = updateSectionLayers(sectionLayers.map(l => l.id === updated_layer.id ? updated_layer : l));
    save(updated);
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/admin/events/${id}`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={16} /> Event
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-yellow-500" /> Layer Editor
        </h1>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => { setSection(s); setSelected(null); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              section === s ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: layer list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 capitalize">{section} Layers ({sectionLayers.length})</h2>
            <div className="flex gap-1">
              {LAYER_TYPES.map(t => (
                <button key={t} onClick={() => addLayer(t)} title={`Add ${t} layer`}
                  className={`px-2 py-1 text-xs rounded-lg font-medium ${LAYER_COLORS[t]} hover:opacity-80 transition-opacity`}>
                  + {t}
                </button>
              ))}
            </div>
          </div>
          {sectionLayers.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No layers yet. Add one above.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {sectionLayers.map((layer, i) => (
                <li key={layer.id}
                  onClick={() => setSelected(layer)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    selected?.id === layer.id ? 'bg-yellow-50' : 'hover:bg-gray-50'
                  }`}>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${LAYER_COLORS[layer.type]}`}>{layer.type}</span>
                  <span className="flex-1 text-sm text-gray-800 truncate">{layer.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); moveLayer(layer.id, -1); }}
                      disabled={i === 0}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); moveLayer(layer.id, 1); }}
                      disabled={i === sectionLayers.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20">
                      <ChevronDown size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteLayer(layer.id); }}
                      className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: layer editor */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Edit Layer</h2>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input value={selected.name} onChange={e => updateSelected({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
            </div>

            {(selected.type === 'image' || selected.type === 'decoration') && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                <input value={selected.imageUrl ?? ''} onChange={e => updateSelected({ imageUrl: e.target.value })}
                  placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
                {selected.imageUrl && (
                  <img src={selected.imageUrl} alt="" className="mt-2 h-16 object-contain rounded border border-gray-100" />
                )}
              </div>
            )}

            {selected.type === 'video' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Video URL</label>
                <input value={selected.videoUrl ?? ''} onChange={e => updateSelected({ videoUrl: e.target.value })}
                  placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
              </div>
            )}

            {selected.type === 'text' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
                <textarea value={selected.text ?? ''} onChange={e => updateSelected({ text: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 resize-none" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Slider label="Position X (%)" value={selected.positionX} min={0} max={100} onChange={v => updateSelected({ positionX: v })} />
              <Slider label="Position Y (%)" value={selected.positionY} min={0} max={100} onChange={v => updateSelected({ positionY: v })} />
              <Slider label="Width (%)" value={selected.width} min={1} max={200} onChange={v => updateSelected({ width: v })} />
              <Slider label="Height (%)" value={selected.height} min={1} max={200} onChange={v => updateSelected({ height: v })} />
              <Slider label="Rotation (°)" value={selected.rotation} min={-360} max={360} onChange={v => updateSelected({ rotation: v })} />
              <Slider label="Opacity" value={selected.opacity} min={0} max={1} step={0.05} onChange={v => updateSelected({ opacity: v })} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Z-Index</label>
              <input type="number" value={selected.zIndex} onChange={e => updateSelected({ zIndex: Number(e.target.value) })}
                className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
            </div>

            {saving && <p className="text-xs text-yellow-600">Saving...</p>}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Plus className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a layer to edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
