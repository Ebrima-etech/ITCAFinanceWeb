'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import { inputClass, selectClass } from '@/lib/ui';
import type { EventSummary, Transaction, TransactionType } from '@/lib/types';

const TYPES: { value: TransactionType; label: string }[] = [
  { value: 'DUE', label: 'Due' },
  { value: 'EVENT_REVENUE', label: 'Event revenue' },
  { value: 'EVENT_COST', label: 'Event cost' },
  { value: 'GIFT', label: 'Gift' },
  { value: 'OTHER_INCOME', label: 'Other income' },
  { value: 'OTHER_EXPENSE', label: 'Other expense' },
];

export default function TransactionForm({
  events,
  initial,
  onSaved,
  onCancel,
}: {
  events: EventSummary[];
  initial?: Transaction;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'OTHER_INCOME');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [occurredAt, setOccurredAt] = useState(
    initial ? initial.occurredAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [eventId, setEventId] = useState(initial?.eventId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      type,
      category,
      description: description || undefined,
      amount: parseFloat(amount),
      occurredAt,
      eventId: eventId || undefined,
    };
    try {
      if (initial) {
        await api.patch(`/transactions/${initial.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save transaction');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-6">
      <select
        value={type}
        onChange={(e) => setType(e.target.value as TransactionType)}
        className={`${selectClass} sm:col-span-1`}
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        required
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={`${inputClass} sm:col-span-1`}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={`${inputClass} sm:col-span-2`}
      />
      <input
        required
        type="number"
        step="0.01"
        min="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className={`${inputClass} sm:col-span-1`}
      />
      <input
        required
        type="date"
        value={occurredAt}
        onChange={(e) => setOccurredAt(e.target.value)}
        className={`${inputClass} sm:col-span-1`}
      />
      <select
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        className={`${selectClass} sm:col-span-2`}
      >
        <option value="">No linked event</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name}
          </option>
        ))}
      </select>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text sm:col-span-6">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          {error}
        </div>
      )}

      <div className="flex gap-2 sm:col-span-6">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : initial ? 'Save changes' : 'Add transaction'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
