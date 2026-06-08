'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, Download, Loader2, CheckCircle, Users } from 'lucide-react';
import { guestsCollection } from '@/lib/firebase/firestore';
import { generateToken, parseGuestCSV, buildInvitationUrl } from '@/lib/utils';

interface ParsedGuest { fullName: string; phone: string; email: string; valid: boolean }

const SAMPLE_CSV = `Name,Phone,Email
สมชาย ใจดี,0812345678,somchai@example.com
สมหญิง รักดี,0898765432,somying@example.com
นายก สุขสันต์,0876543210,nayok@example.com`;

export default function ImportGuestsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';

  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState<ParsedGuest[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleParse = () => {
    if (!csvText.trim()) { toast.error('Paste CSV data first'); return; }
    const rows = parseGuestCSV(csvText);
    setParsed(rows.map(r => ({ ...r, valid: r.fullName.trim().length > 0 })));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      const rows = parseGuestCSV(text);
      setParsed(rows.map(r => ({ ...r, valid: r.fullName.trim().length > 0 })));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const valid = parsed.filter(g => g.valid);
    if (valid.length === 0) { toast.error('No valid guests to import'); return; }
    setImporting(true);
    setProgress(0);
    let count = 0;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      for (const g of valid) {
        const token = generateToken();
        const invitationUrl = buildInvitationUrl(baseUrl, token);
        await guestsCollection.create({
          eventId: id,
          fullName: g.fullName,
          phone: g.phone || undefined,
          email: g.email || undefined,
          token,
          invitationUrl,
          viewed: false,
          reminderSent: false,
          status: 'invited',
        });
        count++;
        setProgress(Math.round((count / valid.length) * 100));
      }
      setDone(true);
      toast.success(`${count} guests imported!`);
    } catch {
      toast.error('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Import Complete!</h2>
        <p className="text-gray-500">{parsed.filter(g => g.valid).length} guests were imported successfully.</p>
        <div className="flex gap-3 justify-center">
          <Link href={`/admin/events/${id}/guests`}
            className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors flex items-center gap-2">
            <Users size={16} /> View Guest List
          </Link>
          <button onClick={() => { setDone(false); setParsed([]); setCsvText(''); }}
            className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
            Import More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/admin/events/${id}/guests`}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={16} /> Guests
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Upload className="w-5 h-5 text-yellow-500" /> Import Guests
        </h1>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700 space-y-1">
        <p className="font-semibold">CSV Format: Name, Phone, Email</p>
        <p>The first row can be a header (it will be skipped). Separate columns with commas.</p>
        <button onClick={downloadSample}
          className="flex items-center gap-1.5 mt-2 text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2">
          <Download size={14} /> Download sample template
        </button>
      </div>

      {/* Upload area */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-3">Drag & drop a CSV file or</p>
        <button onClick={() => fileRef.current?.click()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
          Browse File
        </button>
      </div>

      {/* Paste area */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
        <label className="block text-sm font-medium text-gray-700">Or paste CSV data:</label>
        <textarea
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          rows={8}
          placeholder={SAMPLE_CSV}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400"
        />
        <button onClick={handleParse}
          className="px-5 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors text-sm font-medium">
          Parse & Preview
        </button>
      </div>

      {/* Preview table */}
      {parsed.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">
              Preview — {parsed.filter(g => g.valid).length} valid, {parsed.filter(g => !g.valid).length} invalid
            </h2>
            {!importing && (
              <button onClick={handleImport}
                className="px-5 py-2 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors text-sm">
                Import {parsed.filter(g => g.valid).length} Guests
              </button>
            )}
          </div>
          {importing && (
            <div className="px-5 py-4 bg-yellow-50 border-b border-yellow-100">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                <span className="text-sm text-yellow-700 font-medium">Importing... {progress}%</span>
              </div>
              <div className="h-2 bg-yellow-100 rounded-full overflow-hidden">
                <div className="h-2 bg-yellow-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {parsed.map((g, i) => (
                  <tr key={i} className={g.valid ? '' : 'bg-red-50'}>
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{g.fullName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{g.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{g.email || '—'}</td>
                    <td className="px-4 py-3">
                      {g.valid
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">✓ Valid</span>
                        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">✗ Missing name</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
