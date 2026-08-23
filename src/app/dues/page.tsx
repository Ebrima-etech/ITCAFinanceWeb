'use client';

import { FormEvent, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
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
        <h1 className="text-xl font-bold text-ink">Membership Dues</h1>
        {canEdit && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
          >
            {showForm ? 'Close form' : '+ Record payment'}
          </button>
        )}
      </div>

      <div className="mt-4">
        <StatCard label="Total dues collected" value={formatMoney(total)} tone="positive" />
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-5"
        >
          <input
            required
            placeholder="Member name"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as DuesMethod)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
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
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            type="date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600 sm:col-span-5">{error}</p>}
          <button
            type="submit"
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 sm:col-span-5"
          >
            Record payment
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-5 py-6 text-sm text-slate-400">Loading...</p>
        ) : dues.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">No dues recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-2">Member</th>
                <th className="px-5 py-2">Method</th>
                <th className="px-5 py-2">Paid</th>
                <th className="px-5 py-2 text-right">Amount</th>
                <th className="px-5 py-2">Recorded by</th>
              </tr>
            </thead>
            <tbody>
              {dues.map((due) => (
                <tr key={due.id} className="border-t border-slate-100">
                  <td className="px-5 py-2">
                    <p className="font-medium">{due.memberName}</p>
                    {due.memberEmail && <p className="text-xs text-slate-400">{due.memberEmail}</p>}
                  </td>
                  <td className="px-5 py-2">{due.method === 'CASH' ? 'Cash' : 'Online'}</td>
                  <td className="px-5 py-2">{formatDate(due.paidAt)}</td>
                  <td className="px-5 py-2 text-right font-medium">{formatMoney(due.amount)}</td>
                  <td className="px-5 py-2 text-slate-500">{due.recordedBy.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
