'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Plus, Trash2, PieChart, AlertCircle } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { inputClass, selectClass, thClass, tdClass, trClass } from '@/lib/ui';
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
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink">Budget</h1>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className={`${selectClass} w-auto py-1`}
            >
              {[CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">Proposed spending, compared against the real ledger.</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" /> {showForm ? 'Close form' : 'Add budget line'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mt-4 p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              required
              placeholder="Category (e.g. Venue)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            />
            <input
              required
              placeholder="Line label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={inputClass}
            />
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Planned amount"
              value={plannedAmount}
              onChange={(e) => setPlannedAmount(e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text sm:col-span-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                {error}
              </div>
            )}
            <Button type="submit" className="sm:col-span-4">
              Add line
            </Button>
          </form>
        </Card>
      )}

      <Card className="mt-6 overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} cols={6} />
        ) : items.length === 0 ? (
          <EmptyState icon={PieChart} title={`No budget lines for ${year} yet`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className={thClass}>Category</th>
                  <th className={thClass}>Line</th>
                  <th className={`${thClass} text-right`}>Planned</th>
                  <th className={`${thClass} text-right`}>Actual ({year})</th>
                  <th className={`${thClass} text-right`}>Variance</th>
                  <th className={`${thClass} text-right`}>Prior year actual</th>
                  {canEdit && <th className={thClass} />}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={trClass}>
                    <td className={tdClass}>{item.category}</td>
                    <td className={`${tdClass} font-medium text-slate-900`}>{item.label}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(item.plannedAmount)}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(item.actual)}</td>
                    <td className={`${tdClass} text-right`}>
                      <Badge tone={item.variance >= 0 ? 'success' : 'danger'}>{formatMoney(item.variance)}</Badge>
                    </td>
                    <td className={`${tdClass} text-right tabular-nums text-slate-500`}>
                      {formatMoney(item.priorYearActual)}
                    </td>
                    {canEdit && (
                      <td className={tdClass}>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Remove"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-danger-bg hover:text-danger-text"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50/70 font-semibold">
                  <td className={tdClass} colSpan={2}>
                    Total
                  </td>
                  <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(totals.planned)}</td>
                  <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(totals.actual)}</td>
                  <td className={`${tdClass} text-right tabular-nums`}>
                    {formatMoney(totals.planned - totals.actual)}
                  </td>
                  <td colSpan={canEdit ? 2 : 1} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
