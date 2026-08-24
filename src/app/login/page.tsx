'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { useAuth, ApiError } from '@/lib/auth-context';
import AuthLayout from '@/components/AuthLayout';
import Button from '@/components/ui/Button';
import { inputClass, labelClass } from '@/lib/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold lg:hidden">UTG ITCA</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to record and review ITCA&apos;s finances.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              {error}
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          General member?{' '}
          <Link href="/register" className="font-semibold text-ink hover:underline">
            Create a student account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
