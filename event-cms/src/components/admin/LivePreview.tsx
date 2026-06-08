'use client';

import { useState, useRef } from 'react';
import { X, Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from 'lucide-react';

type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICE_CONFIG: Record<Device, { width: number; label: string; icon: React.ElementType; frameClass: string }> = {
  desktop: { width: 1200, label: 'Desktop', icon: Monitor, frameClass: 'preview-desktop' },
  tablet:  { width: 768,  label: 'Tablet',  icon: Tablet,  frameClass: 'preview-tablet'  },
  mobile:  { width: 375,  label: 'Mobile',  icon: Smartphone, frameClass: 'preview-mobile' },
};

interface Props {
  eventSlug: string;
  onClose?: () => void;
}

export default function LivePreview({ eventSlug, onClose }: Props) {
  const [device, setDevice] = useState<Device>('mobile');
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const cfg = DEVICE_CONFIG[device];
  const previewUrl = `/event/${eventSlug}`;

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-1">
          {(Object.entries(DEVICE_CONFIG) as [Device, typeof DEVICE_CONFIG[Device]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              title={cfg.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                device === key
                  ? 'bg-yellow-500 text-gray-900'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <cfg.icon size={15} />
              <span className="hidden sm:inline">{cfg.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKey(k => k + 1)}
            title="Refresh"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={15} />
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <ExternalLink size={15} />
          </a>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-start justify-center overflow-auto py-6 bg-gray-800">
        <div
          className={`overflow-hidden shadow-2xl ${cfg.frameClass} transition-all duration-300`}
          style={{ width: Math.min(cfg.width, typeof window !== 'undefined' ? window.innerWidth - 48 : cfg.width) }}
        >
          <iframe
            key={key}
            ref={iframeRef}
            src={previewUrl}
            title={`Preview – ${device}`}
            className="block w-full bg-white"
            style={{
              height: device === 'mobile' ? '667px' : device === 'tablet' ? '1024px' : '800px',
              border: 'none',
            }}
          />
        </div>
      </div>

      {/* Device label */}
      <div className="text-center py-2 text-xs text-gray-500 border-t border-gray-700">
        {cfg.label} — {cfg.width}px wide
      </div>
    </div>
  );
}
