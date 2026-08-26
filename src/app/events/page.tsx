'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, CalendarDays, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatMoney } from '@/lib/format';
import { inputClass } from '@/lib/ui';
import type { EventSummary } from '@/lib/types';

export default function EventsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'FINANCE_OFFICER';

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EventSummary | null>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const list = await api.get<EventSummary[]>('/events');
    setEvents(list);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await api.patch(`/events/${editing.id}`, { name, date, description: description || undefined });
      } else {
        await api.post('/events', { name, date, description: description || undefined });
      }
      setName('');
      setDescription('');
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not ${editing ? 'update' : 'create'} event`);
    }
  }

  function handleEdit(event: EventSummary) {
    setEditing(event);
    setName(event.name);
    setDate(event.date);
    setDescription(event.description || '');
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event? Associated transactions will remain.')) return;
    await api.delete(`/events/${id}`);
    load();
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Events</h1>
          <p className="mt-0.5 text-sm text-slate-500">Every project's revenue, cost, and result.</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" /> {showForm ? 'Close form' : 'Add event'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mt-4 p-5">
          {editing && <p className="mb-3 text-sm font-semibold text-slate-700">Editing event</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              required
              placeholder="Event name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} sm:col-span-2`}
            />
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text sm:col-span-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                {error}
              </div>
            )}
            <div className="flex gap-2 sm:col-span-4">
              <Button type="submit" className="flex-1">
                {editing ? 'Update event' : 'Create event'}
              </Button>
              {editing && (
                <Button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setShowForm(false);
                    setName('');
                    setDescription('');
                    setError(null);
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Card key={i} className="h-32 animate-pulse" />)
        ) : events.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <Card>
              <EmptyState
                icon={CalendarDays}
                title="No events yet"
                description="Create one to start tracking its revenue and costs."
              />
            </Card>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id}>
              <Link href={`/events/${event.id}`}>
                <Card className="p-5 transition-shadow hover:shadow-card-hover">
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5 text-ink">
                      <CalendarDays className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <Badge tone={event.result >= 0 ? 'success' : 'danger'}>{formatMoney(event.result)}</Badge>
                  </div>
                  <p className="mt-3 font-semibold text-ink">{event.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatDate(event.date)}</p>
                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>Revenue {formatMoney(event.revenue)}</span>
                    <span>Cost {formatMoney(event.cost)}</span>
                  </div>
                </Card>
              </Link>
              {canEdit && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="mr-1.5 inline h-3.5 w-3.5" strokeWidth={2} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-danger-text hover:bg-danger-bg"
                  >
                    <Trash2 className="mr-1.5 inline h-3.5 w-3.5" strokeWidth={2} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
