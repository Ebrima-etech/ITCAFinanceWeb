'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatMoney } from '@/lib/format';
import type { EventSummary } from '@/lib/types';

export default function EventsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'FINANCE_OFFICER';

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/events', { name, date, description: description || undefined });
      setName('');
      setDescription('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create event');
    }
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">Events</h1>
        {canEdit && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
          >
            {showForm ? 'Close form' : '+ Add event'}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-4"
        >
          <input
            required
            placeholder="Event name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600 sm:col-span-4">{error}</p>}
          <button
            type="submit"
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 sm:col-span-4"
          >
            Create event
          </button>
        </form>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-slate-400">No events yet.</p>
        ) : (
          events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-ink/30"
            >
              <p className="font-semibold text-ink">{event.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{formatDate(event.date)}</p>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-500">Result</span>
                <span className={event.result >= 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>
                  {formatMoney(event.result)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}
