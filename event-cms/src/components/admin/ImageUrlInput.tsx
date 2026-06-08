'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, AlertCircle, ImageIcon } from 'lucide-react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ImageUrlInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageUrlInput({
  label,
  value,
  onChange,
  placeholder = 'https://example.com/image.png',
}: ImageUrlInputProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const hasUrl = value.trim().length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImgError(false);
    setImgLoaded(false);
    onChange(e.target.value);
  };

  const handleClear = () => {
    setImgError(false);
    setImgLoaded(false);
    onChange('');
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Input row */}
      <div className="relative">
        <input
          type="url"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={[
            'w-full px-3 py-2.5 pr-9 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors',
            imgError && hasUrl
              ? 'border-red-300 focus:ring-red-200 bg-red-50'
              : 'border-gray-200 focus:ring-yellow-400/40 bg-white',
          ].join(' ')}
        />
        {hasUrl && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear URL"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Error message */}
      {imgError && hasUrl && (
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle size={12} />
          <span>Image failed to load. Check the URL.</span>
        </div>
      )}

      {/* Preview */}
      {hasUrl && (
        <div className="relative w-full h-32 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-gray-300">
              <ImageIcon size={20} />
              <span className="text-xs">Loading preview…</span>
            </div>
          )}
          {imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300">
              <AlertCircle size={20} />
              <span className="text-xs text-gray-400">Cannot preview image</span>
            </div>
          ) : (
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-contain p-2"
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgError(true); setImgLoaded(false); }}
              unoptimized
            />
          )}
        </div>
      )}
    </div>
  );
}
