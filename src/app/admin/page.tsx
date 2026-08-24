'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Plus, UserX, AlertCircle, Users, History } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { inputClass, selectClass, thClass, tdClass, trClass } from '@/lib/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime } from '@/lib/format';
import type { ActivityLogEntry, Role, User } from '@/lib/types';

const ROLE_TONE: Record<Role, 'gold' | 'blue' | 'neutral'> = {
  ADMIN: 'gold',
  FINANCE_OFFICER: 'blue',
  COMMITTEE_MEMBER: 'neutral',
  STUDENT: 'neutral',
};

const ACTION_TONE: Record<string, 'success' | 'blue' | 'danger' | 'neutral'> = {
  CREATE: 'success',
  UPDATE: 'blue',
  DELETE: 'danger',
  DEACTIVATE: 'danger',
};

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

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
      <h1 className="text-2xl font-bold text-ink">Admin</h1>
      <p className="mt-0.5 text-sm text-slate-500">Officer accounts and the accountability trail.</p>

      <div className="mt-6 flex gap-1 border-b border-slate-200">
        {([
          { key: 'accounts', label: 'Officer accounts', icon: Users },
          { key: 'activity', label: 'Activity log', icon: History },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'border-ink text-ink' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="h-4 w-4" strokeWidth={2} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'accounts' && (
        <div className="mt-5">
          <div className="flex justify-end">
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" /> {showForm ? 'Close form' : 'Add officer account'}
            </Button>
          </div>

          {showForm && (
            <Card className="mt-4 p-5">
              <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <input
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
                <input
                  required
                  type="password"
                  minLength={8}
                  placeholder="Temporary password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
                <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={selectClass}>
                  <option value="COMMITTEE_MEMBER">Committee member</option>
                  <option value="FINANCE_OFFICER">Finance officer</option>
                  <option value="ADMIN">Admin</option>
                </select>
                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text sm:col-span-4">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                    {error}
                  </div>
                )}
                <Button type="submit" className="sm:col-span-4">
                  Create account
                </Button>
              </form>
            </Card>
          )}

          <Card className="mt-4 overflow-hidden">
            {loading ? (
              <SkeletonTable rows={4} cols={5} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/70">
                    <tr>
                      <th className={thClass}>Name</th>
                      <th className={thClass}>Email</th>
                      <th className={thClass}>Role</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass} />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className={trClass}>
                        <td className={tdClass}>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/5 text-[11px] font-semibold text-ink">
                              {initials(u.name)}
                            </div>
                            <span className="font-medium text-slate-900">{u.name}</span>
                          </div>
                        </td>
                        <td className={`${tdClass} text-slate-500`}>{u.email}</td>
                        <td className={tdClass}>
                          <Badge tone={ROLE_TONE[u.role]}>{u.role.replace('_', ' ')}</Badge>
                        </td>
                        <td className={tdClass}>
                          <Badge tone={u.isActive ? 'success' : 'neutral'}>
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </Badge>
                        </td>
                        <td className={tdClass}>
                          {u.isActive && u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeactivate(u.id)}
                              title="Deactivate"
                              className="rounded-md p-1.5 text-slate-400 hover:bg-danger-bg hover:text-danger-text"
                            >
                              <UserX className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'activity' && (
        <Card className="mt-5 overflow-hidden">
          {loading ? (
            <SkeletonTable rows={6} cols={4} />
          ) : logs.length === 0 ? (
            <EmptyState icon={History} title="No activity recorded yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/70">
                  <tr>
                    <th className={thClass}>When</th>
                    <th className={thClass}>Who</th>
                    <th className={thClass}>Action</th>
                    <th className={thClass}>On</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className={trClass}>
                      <td className={`${tdClass} whitespace-nowrap text-slate-500`}>
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className={tdClass}>{log.actor?.name ?? 'System'}</td>
                      <td className={tdClass}>
                        <Badge tone={ACTION_TONE[log.action] ?? 'neutral'}>{log.action}</Badge>
                      </td>
                      <td className={`${tdClass} text-slate-500`}>{log.entityType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </AppShell>
  );
}
