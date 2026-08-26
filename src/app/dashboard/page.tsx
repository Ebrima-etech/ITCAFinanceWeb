'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, TrendingDown, Scale, Calendar, ArrowRight, PieChart as PieChartIcon } from 'lucide-react';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { SkeletonCards, SkeletonTable } from '@/components/ui/Skeleton';
import { selectClass, thClass, tdClass, trClass } from '@/lib/ui';
import { api } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

const CURRENT_YEAR = new Date().getFullYear();

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-sm font-semibold tabular-nums text-slate-900" style={{ color: entry.color }}>
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
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Financial Dashboard</h1>
          <p className="text-sm text-slate-600">Complete overview of ITCA's financial performance</p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-slate-400" />
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className={`${selectClass} w-32 text-sm font-semibold`}
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
        <div className="space-y-6">
          <SkeletonCards count={4} />
          <Card className="h-80" />
          <Card className="h-80" />
        </div>
      ) : (
        <>
          {/* KPI Cards - Primary Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard
              label="Total Income"
              value={formatMoney(summary.income)}
              tone="positive"
              icon={TrendingUp}
            />
            <StatCard
              label="Total Expenses"
              value={formatMoney(summary.expenses)}
              tone="negative"
              icon={TrendingDown}
            />
            <StatCard
              label="Net Position"
              value={formatMoney(summary.net)}
              tone={summary.net >= 0 ? 'positive' : 'negative'}
              icon={Scale}
            />
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Margin</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {summary.income > 0 ? ((summary.net / summary.income) * 100).toFixed(1) : '0'}%
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <PieChartIcon className="h-5 w-5 text-indigo-600" strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
            {/* Income vs Expenses Chart */}
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-base font-semibold text-slate-900">Monthly Overview</h2>
                <p className="mt-1 text-sm text-slate-600">Income and expenses by month</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.byMonth} barCategoryGap={20}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="month"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      stroke="#64748b"
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      stroke="#64748b"
                      tickFormatter={(v) => `$${v > 999 ? (v / 1000).toFixed(0) + 'K' : v}`}
                      width={60}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                      formatter={(value) => <span className="text-xs font-medium text-slate-600">{value}</span>}
                    />
                    <Bar dataKey="income" name="Income" fill="url(#incomeGradient)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="url(#expenseGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Cumulative Net Chart */}
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-base font-semibold text-slate-900">Financial Trend</h2>
                <p className="mt-1 text-sm text-slate-600">Cumulative net position over the year</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.byMonth}>
                    <defs>
                      <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="month"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      stroke="#64748b"
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      stroke="#64748b"
                      tickFormatter={(v) => `$${v > 999 ? (v / 1000).toFixed(0) + 'K' : v}`}
                      width={60}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
                    <Area
                      type="monotone"
                      dataKey="net"
                      name="Net Position"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#netGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Events Performance Table */}
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Events Performance</h2>
                <p className="mt-1 text-sm text-slate-600">Profit/loss breakdown by event</p>
              </div>
              <Link href="/events">
                <Button className="flex items-center gap-2 text-sm">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {summary.events.length === 0 ? (
              <EmptyState
                icon={PieChartIcon}
                title={`No events recorded for ${year} yet`}
                description="Create events to track revenue and costs"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/50">
                    <tr>
                      <th className={`${thClass} text-left`}>Event Name</th>
                      <th className={`${thClass} text-left`}>Date</th>
                      <th className={`${thClass} text-right`}>Revenue</th>
                      <th className={`${thClass} text-right`}>Expenses</th>
                      <th className={`${thClass} text-right`}>Profit/Loss</th>
                      <th className={`${thClass} text-center`}>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.events.map((event) => {
                      const margin = event.revenue > 0 ? ((event.result / event.revenue) * 100).toFixed(1) : '0';
                      return (
                        <tr key={event.id} className={trClass}>
                          <td className={`${tdClass} font-medium text-slate-900`}>{event.name}</td>
                          <td className={`${tdClass} text-slate-600`}>{formatDate(event.date)}</td>
                          <td className={`${tdClass} text-right font-semibold text-slate-900 tabular-nums`}>
                            {formatMoney(event.revenue)}
                          </td>
                          <td className={`${tdClass} text-right text-slate-600 tabular-nums`}>
                            {formatMoney(event.cost)}
                          </td>
                          <td className={`${tdClass} text-right`}>
                            <Badge tone={event.result >= 0 ? 'success' : 'danger'}>
                              {formatMoney(event.result)}
                            </Badge>
                          </td>
                          <td className={`${tdClass} text-center text-slate-600 tabular-nums`}>
                            <span className={`font-semibold ${event.result >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {margin}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50">
                      <td className={`${tdClass} font-semibold text-slate-900`}>Total</td>
                      <td className={tdClass} />
                      <td className={`${tdClass} text-right font-bold text-slate-900 tabular-nums`}>
                        {formatMoney(summary.byMonth.reduce((sum, m) => sum + m.income, 0))}
                      </td>
                      <td className={`${tdClass} text-right font-bold text-slate-900 tabular-nums`}>
                        {formatMoney(summary.byMonth.reduce((sum, m) => sum + m.expenses, 0))}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <Badge tone={summary.net >= 0 ? 'success' : 'danger'}>
                          {formatMoney(summary.net)}
                        </Badge>
                      </td>
                      <td className={`${tdClass} text-center font-bold text-slate-900 tabular-nums`}>
                        <span className={summary.net >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {summary.income > 0 ? ((summary.net / summary.income) * 100).toFixed(1) : '0'}%
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </AppShell>
  );
}
