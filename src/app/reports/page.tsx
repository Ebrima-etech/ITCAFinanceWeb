'use client';

import { useState } from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatMoney } from '@/lib/format';
import { inputClass, labelClass } from '@/lib/ui';

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
      <h1 className="text-2xl font-bold text-ink">Reports</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick a period, preview the transactions in it, then export a CSV for budgeting, funding
        proposals, or committee review.
      </p>

      <Card className="mt-6 flex flex-wrap items-end gap-3 p-5">
        <div>
          <label className={labelClass}>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`mt-1 ${inputClass}`} />
        </div>
        <div>
          <label className={labelClass}>To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`mt-1 ${inputClass}`} />
        </div>
        <Button variant="secondary" onClick={handlePreview} disabled={loading}>
          <Eye className="h-4 w-4" /> {loading ? 'Loading...' : 'Preview'}
        </Button>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </Card>

      {preview ? (
        <Card className="mt-6 p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" strokeWidth={2} />
            <p className="text-sm font-semibold text-slate-700">
              {preview.count} transactions &middot; total{' '}
              <span className="tabular-nums">{formatMoney(preview.total)}</span>
            </p>
          </div>
          <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
            {preview.csv}
          </pre>
        </Card>
      ) : (
        <p className="mt-6 text-sm text-slate-400">Choose a period and click Preview to see the rows first.</p>
      )}
    </AppShell>
  );
}
