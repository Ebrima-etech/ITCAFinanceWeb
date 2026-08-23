'use client';

import { FormEvent, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime } from '@/lib/format';
import type { ActivityLogEntry, Role, User } from '@/lib/types';

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState<'accounts' | 'activity'>('accounts');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('COMMITTEE_MEMBER');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [userList, logList] = await Promise.all([
      api.get<User[]>('/users'),
      api.get<ActivityLogEntry[]>('/activity-log?take=50'),
    ]);
    setUsers(userList);
    setLogs(logList);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/users', { name, email, password, role });
      setName('');
      setEmail('');
      setPassword('');
      setRole('COMMITTEE_MEMBER');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Deactivate this account? They will no longer be able to log in.')) return;
    await api.delete(`/users/${id}`);
    load();
  }

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-ink">Admin</h1>

      <div className="mt-4 flex gap-2 border-b border-slate-200">
        {(['accounts', 'activity'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t ? 'border-ink text-ink' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'accounts' ? 'Officer accounts' : 'Activity log'}
          </button>
        ))}
      </div>

      {tab === 'accounts' && (
        <div className="mt-4">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
          >
            {showForm ? 'Close form' : '+ Add officer account'}
          </button>

          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-4"
            >
              <input
                required
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                required
                type="password"
                minLength={8}
                placeholder="Temporary password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="COMMITTEE_MEMBER">Committee member</option>
                <option value="FINANCE_OFFICER">Finance officer</option>
                <option value="ADMIN">Admin</option>
              </select>
              {error && <p className="text-sm text-red-600 sm:col-span-4">{error}</p>}
              <button
                type="submit"
                className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 sm:col-span-4"
              >
                Create account
              </button>
            </form>
          )}

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <p className="px-5 py-6 text-sm text-slate-400">Loading...</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-2">Name</th>
                    <th className="px-5 py-2">Email</th>
                    <th className="px-5 py-2">Role</th>
                    <th className="px-5 py-2">Status</th>
                    <th className="px-5 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="px-5 py-2 font-medium">{u.name}</td>
                      <td className="px-5 py-2 text-slate-500">{u.email}</td>
                      <td className="px-5 py-2">{u.role.replace('_', ' ')}</td>
                      <td className="px-5 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-5 py-2">
                        {u.isActive && u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="px-5 py-6 text-sm text-slate-400">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400">No activity recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-2">When</th>
                  <th className="px-5 py-2">Who</th>
                  <th className="px-5 py-2">Action</th>
                  <th className="px-5 py-2">On</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="px-5 py-2 whitespace-nowrap text-slate-500">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-5 py-2">{log.actor?.name ?? 'System'}</td>
                    <td className="px-5 py-2 font-medium">{log.action}</td>
                    <td className="px-5 py-2 text-slate-500">{log.entityType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AppShell>
  );
}
