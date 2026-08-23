'use client';

import { FormEvent, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatMoney } from '@/lib/format';
import type { BudgetItem } from '@/lib/types';

const CURRENT_YEAR = new Date().getFullYear();

export default function BudgetPage() {
  const { user } = useAuth();
  // Budget planning is deliberately open to committee members, not just
  // finance officers - it's their proposed spending, per the build guide.
  const canEdit = user?.role !== undefined;

  const [year, setYear] = useState(CURRENT_YEAR + 1);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [category, setCategory] = useState('');
  const [label, setLabel] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const result = await api.get<BudgetItem[]>(`/budget?year=${year}`);
    setItems(result);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/budget', {
        year,
        category,
        label,
        plannedAmount: parseFloat(plannedAmount),
        notes: notes || undefined,
      });
      setCategory('');
      setLabel('');
      setPlannedAmount('');
      setNotes('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add budget line');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this budget line?')) return;
    await api.delete(`/budget/${id}`);
    load();
  }

  const totals = items.reduce(
    (acc, item) => ({
      planned: acc.planned + item.plannedAmount,
      actual: acc.actual + item.actual,
    }),
    { planned: 0, actual: 0 },
  );

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-ink">Budget</h1>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          >
            {[CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
          >
            {showForm ? 'Close form' : '+ Add budget line'}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-4"
        >
          <input
            required
            placeholder="Category (e.g. Venue)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Line label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Planned amount"
            value={plannedAmount}
            onChange={(e) => setPlannedAmount(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600 sm:col-span-4">{error}</p>}
          <button
            type="submit"
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 sm:col-span-4"
          >
            Add line
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-5 py-6 text-sm text-slate-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">No budget lines for {year} yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-2">Category</th>
                <th className="px-5 py-2">Line</th>
                <th className="px-5 py-2 text-right">Planned</th>
                <th className="px-5 py-2 text-right">Actual ({year})</th>
                <th className="px-5 py-2 text-right">Variance</th>
                <th className="px-5 py-2 text-right">Prior year actual</th>
                {canEdit && <th className="px-5 py-2" />}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-5 py-2">{item.category}</td>
                  <td className="px-5 py-2 font-medium">{item.label}</td>
                  <td className="px-5 py-2 text-right">{formatMoney(item.plannedAmount)}</td>
                  <td className="px-5 py-2 text-right">{formatMoney(item.actual)}</td>
                  <td
                    className={`px-5 py-2 text-right font-medium ${
                      item.variance >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {formatMoney(item.variance)}
                  </td>
                  <td className="px-5 py-2 text-right text-slate-500">
                    {formatMoney(item.priorYearActual)}
                  </td>
                  {canEdit && (
                    <td className="px-5 py-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 font-semibold">
                <td className="px-5 py-2" colSpan={2}>
                  Total
                </td>
                <td className="px-5 py-2 text-right">{formatMoney(totals.planned)}</td>
                <td className="px-5 py-2 text-right">{formatMoney(totals.actual)}</td>
                <td className="px-5 py-2 text-right">{formatMoney(totals.planned - totals.actual)}</td>
                <td colSpan={canEdit ? 2 : 1} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </AppShell>
  );
}
