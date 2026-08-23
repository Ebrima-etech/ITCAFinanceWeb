'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

const CURRENT_YEAR = new Date().getFullYear();

export default function DashboardPage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<DashboardSummary>(`/dashboard?year=${year}`)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [year]);

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Dashboard</h1>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          {[CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading || !summary ? (
        <p className="mt-8 text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Income" value={formatMoney(summary.income)} tone="positive" />
            <StatCard label="Expenses" value={formatMoney(summary.expenses)} tone="negative" />
            <StatCard
              label="Net"
              value={formatMoney(summary.net)}
              tone={summary.net >= 0 ? 'positive' : 'negative'}
            />
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700">Income vs expenses by month</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value: number) => formatMoney(value)} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#0f2540" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#c9962c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
            <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
              Profit / loss per event
            </h2>
            {summary.events.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400">No events recorded for {year} yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-2">Event</th>
                    <th className="px-5 py-2">Date</th>
                    <th className="px-5 py-2 text-right">Revenue</th>
                    <th className="px-5 py-2 text-right">Cost</th>
                    <th className="px-5 py-2 text-right">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.events.map((event) => (
                    <tr key={event.id} className="border-t border-slate-100">
                      <td className="px-5 py-2 font-medium">{event.name}</td>
                      <td className="px-5 py-2 text-slate-500">{formatDate(event.date)}</td>
                      <td className="px-5 py-2 text-right">{formatMoney(event.revenue)}</td>
                      <td className="px-5 py-2 text-right">{formatMoney(event.cost)}</td>
                      <td
                        className={`px-5 py-2 text-right font-semibold ${
                          event.result >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {formatMoney(event.result)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
