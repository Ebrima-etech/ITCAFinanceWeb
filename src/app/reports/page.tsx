'use client';

import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { formatMoney } from '@/lib/format';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://itcafinanceback.onrender.com/api';

interface Preview {
  csv: string;
  count: number;
  total: number;
}

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const [from, setFrom] = useState(yearStart);
  const [to, setTo] = useState(today);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePreview() {
    setLoading(true);
    const token = localStorage.getItem('itca_token');
    const res = await fetch(`${API_URL}/reports/transactions?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPreview(await res.json());
    setLoading(false);
  }

  function handleExport() {
    const token = localStorage.getItem('itca_token');
    fetch(`${API_URL}/reports/transactions?from=${from}&to=${to}&format=csv`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `itca-transactions-${from}_to_${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-ink">Reports</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick a period, preview the transactions in it, then export a CSV for budgeting, funding
        proposals, or committee review.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="block text-xs font-medium text-slate-500">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={handlePreview}
          disabled={loading}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          {loading ? 'Loading...' : 'Preview'}
        </button>
        <button
          onClick={handleExport}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
        >
          Export CSV
        </button>
      </div>

      {preview && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            {preview.count} transactions &middot; total {formatMoney(preview.total)}
          </p>
          <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-slate-50 p-4 text-xs text-slate-600">
            {preview.csv}
          </pre>
        </div>
      )}
    </AppShell>
  );
}
