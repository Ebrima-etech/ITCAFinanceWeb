'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import { inputClass, selectClass } from '@/lib/ui';

interface PostFormProps {
  onPostCreated: () => void;
  onCancel: () => void;
}

export default function PostForm({ onPostCreated, onCancel }: PostFormProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post('/feed', {
        content,
        image: image || undefined,
      });
      setContent('');
      setImage('');
      onPostCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        required
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={`${inputClass} min-h-24 resize-none`}
      />

      <input
        type="url"
        placeholder="Image URL (optional)"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        className={inputClass}
      />

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? 'Posting...' : 'Post'}
        </Button>
        <Button type="button" onClick={onCancel} className="bg-slate-200 text-slate-700 hover:bg-slate-300">
          Cancel
        </Button>
      </div>
    </form>
  );
}
