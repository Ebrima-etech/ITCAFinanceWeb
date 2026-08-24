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
import { TrendingUp, TrendingDown, Scale, CalendarRange } from 'lucide-react';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCards, SkeletonTable } from '@/components/ui/Skeleton';
import { selectClass, thClass, tdClass, trClass } from '@/lib/ui';
import { api } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

const CURRENT_YEAR = new Date().getFullYear();

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-card-hover">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-sm font-semibold tabular-nums" style={{ color: entry.color }}>
          {entry.name}: {formatMoney(entry.value)}
        </p>
      ))}
    </div>
  );
}

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">Financial overview for {year}</p>
        </div>
        <div className="relative">
          <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className={`${selectClass} appearance-none py-1.5 pl-9 pr-8`}
          >
            {[CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !summary ? (
        <div className="mt-6 space-y-6">
          <SkeletonCards count={3} />
          <Card className="h-80" />
          <Card>
            <SkeletonTable rows={4} cols={5} />
          </Card>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Income" value={formatMoney(summary.income)} tone="positive" icon={TrendingUp} />
            <StatCard label="Expenses" value={formatMoney(summary.expenses)} tone="negative" icon={TrendingDown} />
            <StatCard
              label="Net"
              value={formatMoney(summary.net)}
              tone={summary.net >= 0 ? 'positive' : 'negative'}
              icon={Scale}
            />
          </div>

          <Card className="mt-6 p-5">
            <h2 className="text-sm font-semibold text-slate-700">Income vs expenses by month</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.byMonth} barCategoryGap={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#c3c2b7' }}
                    stroke="#898781"
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    stroke="#898781"
                    tickFormatter={(v) => formatMoney(v)}
                    width={70}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(15,37,64,0.03)' }} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                  />
                  <Bar dataKey="income" name="Income" fill="#2a78d6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expenses" name="Expenses" fill="#eb6834" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="mt-6 overflow-hidden">
            <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
              Profit / loss per event
            </h2>
            {summary.events.length === 0 ? (
              <EmptyState title={`No events recorded for ${year} yet.`} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/70">
                    <tr>
                      <th className={thClass}>Event</th>
                      <th className={thClass}>Date</th>
                      <th className={`${thClass} text-right`}>Revenue</th>
                      <th className={`${thClass} text-right`}>Cost</th>
                      <th className={`${thClass} text-right`}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.events.map((event) => (
                      <tr key={event.id} className={trClass}>
                        <td className={`${tdClass} font-medium text-slate-900`}>{event.name}</td>
                        <td className={`${tdClass} text-slate-500`}>{formatDate(event.date)}</td>
                        <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(event.revenue)}</td>
                        <td className={`${tdClass} text-right tabular-nums`}>{formatMoney(event.cost)}</td>
                        <td className={`${tdClass} text-right`}>
                          <Badge tone={event.result >= 0 ? 'success' : 'danger'}>
                            {formatMoney(event.result)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </AppShell>
  );
}
