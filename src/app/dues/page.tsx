'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Plus, Wallet, AlertCircle, Users } from 'lucide-react';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { inputClass, selectClass, thClass, tdClass, trClass } from '@/lib/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatMoney } from '@/lib/format';
import type { DuesMethod, MembershipDue } from '@/lib/types';

export default function DuesPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'FINANCE_OFFICER';

  const [dues, setDues] = useState<MembershipDue[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<DuesMethod>('CASH');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const result = await api.get<{ dues: MembershipDue[]; total: number }>('/membership-dues');
    setDues(result.dues);
    setTotal(result.total);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/membership-dues', {
        memberName,
        memberEmail: memberEmail || undefined,
        amount: parseFloat(amount),
        method,
        paidAt,
      });
      setMemberName('');
      setMemberEmail('');
      setAmount('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record due');
    }
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Membership Dues</h1>
          <p className="mt-0.5 text-sm text-slate-500">Cash and online payments, in one record.</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" /> {showForm ? 'Close form' : 'Record payment'}
          </Button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total dues collected" value={formatMoney(total)} tone="positive" icon={Wallet} />
        <StatCard label="Members paid" value={String(dues.length)} icon={Users} />
      </div>

      {showForm && (
        <Card className="mt-4 p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <input
              required
              placeholder="Member name"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className={`${inputClass} sm:col-span-2`}
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className={`${inputClass} sm:col-span-2`}
            />
            <select value={method} onChange={(e) => setMethod(e.target.value as DuesMethod)} className={selectClass}>
              <option value="CASH">Cash</option>
              <option value="ONLINE">Online</option>
            </select>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
            <input
              required
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className={inputClass}
            />
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text sm:col-span-5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                {error}
              </div>
            )}
            <Button type="submit" className="sm:col-span-5">
              Record payment
            </Button>
          </form>
        </Card>
      )}

      <Card className="mt-6 overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : dues.length === 0 ? (
          <EmptyState icon={Wallet} title="No dues recorded yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className={thClass}>Member</th>
                  <th className={thClass}>Method</th>
                  <th className={thClass}>Paid</th>
                  <th className={`${thClass} text-right`}>Amount</th>
                  <th className={thClass}>Recorded by</th>
                </tr>
              </thead>
              <tbody>
                {dues.map((due) => (
                  <tr key={due.id} className={trClass}>
                    <td className={tdClass}>
                      <p className="font-medium text-slate-900">{due.memberName}</p>
                      {due.memberEmail && <p className="text-xs text-slate-400">{due.memberEmail}</p>}
                    </td>
                    <td className={tdClass}>
                      <Badge tone={due.method === 'CASH' ? 'neutral' : 'blue'}>
                        {due.method === 'CASH' ? 'Cash' : 'Online'}
                      </Badge>
                    </td>
                    <td className={`${tdClass} text-slate-500`}>{formatDate(due.paidAt)}</td>
                    <td className={`${tdClass} text-right font-medium tabular-nums`}>{formatMoney(due.amount)}</td>
                    <td className={`${tdClass} text-slate-500`}>{due.recordedBy.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
