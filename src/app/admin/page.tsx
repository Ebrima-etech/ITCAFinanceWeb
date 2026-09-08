'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Plus, UserX, AlertCircle, Users, History, MessageSquare, Trash2, Calendar, Handshake, Check, X } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { inputClass, selectClass, thClass, tdClass, trClass } from '@/lib/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime, formatDate } from '@/lib/format';
import type { ActivityLogEntry, Role, User, Post, EventSummary } from '@/lib/types';

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

interface EventPartnerApp {
  id: string;
  event: { id: string; name: string };
  organizationName: string;
  contactPerson: string;
  email: string;
  sponsorshipLevel: string;
  status: string;
}

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState<'posts' | 'accounts' | 'activity' | 'events' | 'partners'>('posts');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [partners, setPartners] = useState<EventPartnerApp[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('COMMITTEE_MEMBER');
  const [error, setError] = useState<string | null>(null);

  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [postError, setPostError] = useState<string | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);

  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    eventId: '',
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    logoUrl: '',
    description: '',
    sponsorshipLevel: 'bronze',
  });
  const [partnerError, setPartnerError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [userList, logList, postList, eventList, partnerList] = await Promise.all([
        api.get<User[]>('/users'),
        api.get<ActivityLogEntry[]>('/activity-log?take=50'),
        api.get<Post[]>('/feed'),
        api.get<EventSummary[]>('/events'),
        api.get<EventPartnerApp[]>('/event-partners'),
      ]);
      setUsers(userList);
      setLogs(logList);
      setPosts(postList);
      setEvents(eventList);
      setPartners(partnerList);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
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

  async function handleCreatePost(e: FormEvent) {
    e.preventDefault();
    setPostError(null);
    try {
      await api.post('/feed', {
        content: postContent,
        image: postImage || undefined,
      });
      setPostContent('');
      setPostImage('');
      setShowPostForm(false);
      load();
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Could not create post');
    }
  }

  async function handleDeletePost(id: string) {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/feed/${id}`);
      load();
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  }

  async function handleCreatePartner(e: React.FormEvent) {
    e.preventDefault();
    setPartnerError(null);
    try {
      await api.post('/event-partners', partnerForm);
      setPartnerForm({
        eventId: '',
        organizationName: '',
        contactPerson: '',
        email: '',
        phone: '',
        website: '',
        logoUrl: '',
        description: '',
        sponsorshipLevel: 'bronze',
      });
      setShowPartnerForm(false);
      load();
    } catch (err) {
      setPartnerError(err instanceof Error ? err.message : 'Failed to create partner');
    }
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-ink">Admin</h1>
      <p className="mt-0.5 text-sm text-slate-500">Officer accounts and the accountability trail.</p>

      <div className="mt-6 flex gap-1 border-b border-slate-200">
        {([
          { key: 'posts', label: 'Posts', icon: MessageSquare },
          { key: 'events', label: 'Events', icon: Calendar },
          { key: 'partners', label: 'Event Partners', icon: Handshake },
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

      {tab === 'posts' && (
        <div className="mt-5">
          <div className="flex justify-end">
            <Button onClick={() => setShowPostForm((v) => !v)}>
              <Plus className="h-4 w-4" /> {showPostForm ? 'Close' : 'Create post'}
            </Button>
          </div>

          {showPostForm && (
            <Card className="mt-4 p-5">
              <form onSubmit={handleCreatePost} className="space-y-3">
                <textarea
                  required
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className={`${inputClass} min-h-24 resize-none`}
                />
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={postImage}
                  onChange={(e) => setPostImage(e.target.value)}
                  className={inputClass}
                />
                {postError && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                    {postError}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="submit" disabled={!postContent.trim()}>
                    Post
                  </Button>
                  <Button type="button" onClick={() => setShowPostForm(false)} className="bg-slate-200 text-slate-700 hover:bg-slate-300">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <Card className="mt-4 overflow-hidden">
            {loading ? (
              <SkeletonTable rows={4} cols={4} />
            ) : posts.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No posts yet" description="Create your first post to engage with members" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/70">
                    <tr>
                      <th className={thClass}>Content</th>
                      <th className={thClass}>Created</th>
                      <th className={thClass}>Interactions</th>
                      <th className={thClass} />
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className={trClass}>
                        <td className={`${tdClass} max-w-xs truncate`}>{post.content}</td>
                        <td className={`${tdClass} text-slate-500`}>{formatDate(post.createdAt)}</td>
                        <td className={tdClass}>
                          <span className="text-xs text-slate-600">
                            ❤️ {post.likesCount} · 💬 {post.commentsCount} · 📌 {post.savesCount}
                          </span>
                        </td>
                        <td className={tdClass}>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
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

      {tab === 'events' && (
        <Card className="mt-5 overflow-hidden">
          {loading ? (
            <SkeletonTable rows={4} cols={4} />
          ) : events.length === 0 ? (
            <EmptyState icon={Calendar} title="No events yet" description="Create events to start tracking revenue and costs" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/70">
                  <tr>
                    <th className={thClass}>Event Name</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Revenue</th>
                    <th className={thClass}>Cost</th>
                    <th className={thClass}>Result</th>
                    <th className={thClass}>Partners</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const eventPartners = partners.filter((p) => p.event.id === event.id).filter((p) => p.status === 'approved');
                    return (
                      <tr key={event.id} className={trClass}>
                        <td className={tdClass}>
                          <span className="font-medium text-slate-900">{event.name}</span>
                        </td>
                        <td className={`${tdClass} text-slate-500`}>{formatDate(event.date)}</td>
                        <td className={tdClass}>
                          <Badge tone={event.status === 'happening' ? 'gold' : event.status === 'upcoming' ? 'blue' : 'neutral'}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </Badge>
                        </td>
                        <td className={`${tdClass} text-green-600 font-medium`}>D{event.revenue.toLocaleString()}</td>
                        <td className={`${tdClass} text-red-600 font-medium`}>D{event.cost.toLocaleString()}</td>
                        <td className={`${tdClass} font-medium ${event.result >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          D{event.result.toLocaleString()}
                        </td>
                        <td className={tdClass}>
                          <Badge tone="neutral">{eventPartners.length}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'partners' && (
        <div className="mt-5">
          <div className="flex justify-end">
            <Button onClick={() => setShowPartnerForm((v) => !v)}>
              <Plus className="h-4 w-4" /> {showPartnerForm ? 'Close' : 'Add partner'}
            </Button>
          </div>

          {showPartnerForm && (
            <Card className="mt-4 p-5">
              <form onSubmit={handleCreatePartner} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    required
                    value={partnerForm.eventId}
                    onChange={(e) => setPartnerForm({ ...partnerForm, eventId: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">-- Select Event --</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    placeholder="Organization Name"
                    value={partnerForm.organizationName}
                    onChange={(e) => setPartnerForm({ ...partnerForm, organizationName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Contact Person"
                    value={partnerForm.contactPerson}
                    onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Phone"
                    value={partnerForm.phone}
                    onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    type="url"
                    placeholder="Website (optional)"
                    value={partnerForm.website}
                    onChange={(e) => setPartnerForm({ ...partnerForm, website: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="url"
                    placeholder="Logo URL (optional)"
                    value={partnerForm.logoUrl}
                    onChange={(e) => setPartnerForm({ ...partnerForm, logoUrl: e.target.value })}
                    className={inputClass}
                  />
                  <select value={partnerForm.sponsorshipLevel} onChange={(e) => setPartnerForm({ ...partnerForm, sponsorshipLevel: e.target.value })} className={selectClass}>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                  </select>
                </div>
                <textarea
                  required
                  placeholder="Description"
                  value={partnerForm.description}
                  onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })}
                  className={`${inputClass} min-h-20 resize-none`}
                />
                {partnerError && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                    {partnerError}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="submit" disabled={!partnerForm.eventId || !partnerForm.organizationName || !partnerForm.email || !partnerForm.phone}>
                    Create Partner
                  </Button>
                  <Button type="button" onClick={() => setShowPartnerForm(false)} className="bg-slate-200 text-slate-700 hover:bg-slate-300">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <Card className="mt-4 overflow-hidden">
            {loading ? (
              <SkeletonTable rows={4} cols={5} />
            ) : partners.length === 0 ? (
              <EmptyState icon={Handshake} title="No applications yet" description="Partner applications will appear here" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/70">
                  <tr>
                    <th className={thClass}>Organization</th>
                    <th className={thClass}>Contact</th>
                    <th className={thClass}>Event</th>
                    <th className={thClass}>Level</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass} />
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id} className={trClass}>
                      <td className={tdClass}>
                        <span className="font-medium text-slate-900">{partner.organizationName}</span>
                      </td>
                      <td className={`${tdClass} text-slate-500`}>
                        <div className="text-xs">
                          <div>{partner.contactPerson}</div>
                          <div>{partner.email}</div>
                        </div>
                      </td>
                      <td className={tdClass}>{partner.event.name}</td>
                      <td className={tdClass}>
                        <Badge tone={partner.sponsorshipLevel === 'gold' ? 'gold' : partner.sponsorshipLevel === 'silver' ? 'blue' : 'neutral'}>
                          {partner.sponsorshipLevel.charAt(0).toUpperCase() + partner.sponsorshipLevel.slice(1)}
                        </Badge>
                      </td>
                      <td className={tdClass}>
                        <Badge tone={partner.status === 'approved' ? 'success' : partner.status === 'rejected' ? 'danger' : 'blue'}>
                          {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                        </Badge>
                      </td>
                      <td className={tdClass}>
                        <div className="flex gap-1">
                          {partner.status === 'pending' && (
                            <>
                              <button
                                onClick={async () => {
                                  await api.patch(`/event-partners/${partner.id}`, { status: 'approved' });
                                  load();
                                }}
                                className="rounded-md p-1.5 text-green-600 hover:bg-green-50"
                                title="Approve"
                              >
                                <Check className="h-3.5 w-3.5" strokeWidth={2} />
                              </button>
                              <button
                                onClick={async () => {
                                  await api.patch(`/event-partners/${partner.id}`, { status: 'rejected' });
                                  load();
                                }}
                                className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                                title="Reject"
                              >
                                <X className="h-3.5 w-3.5" strokeWidth={2} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={async () => {
                              if (!confirm('Delete this partner?')) return;
                              await api.delete(`/event-partners/${partner.id}`);
                              load();
                            }}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                        </div>
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
