'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const COMING_SOON = [
  {
    title: 'Financial Transparency',
    body: "See ITCA's income and expenses at a glance — dues collected, gifts received, and where the money goes.",
  },
  {
    title: 'Project & Event Spending',
    body: 'A breakdown of what every event and project actually cost, and what it raised, in plain numbers.',
  },
  {
    title: 'Pay for Services Online',
    body: 'Pay dues, event tickets, and other ITCA services directly — no more chasing an officer with cash.',
  },
];

export default function RootPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">UTG ITCA</p>
            <p className="text-sm font-medium text-ink">Account Management</p>
          </div>
          {!loading && (
            <Link
              href={user ? '/dashboard' : '/login'}
              className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
            >
              {user ? 'Go to Dashboard' : 'Officer Sign In'}
            </Link>
          )}
        </div>
      </header>

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-20">
          <h1 className="text-3xl font-bold sm:text-4xl">ITCA's money, in the open</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            A single place where ITCA's dues, event revenue, gifts, and spending are tracked —
            built so any member can see where the money comes from and where it goes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={user ? '/dashboard' : '/login'}
              className="rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold/90"
            >
              {user ? 'Go to Dashboard' : 'Officer Sign In'}
            </Link>
            <a
              href="#coming-soon"
              className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              What's coming
            </a>
          </div>
        </div>
      </section>

      <section id="coming-soon" className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-gold">
          Coming soon for every member
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
          Right now this system is how ITCA officers keep the books straight. The next step opens
          part of it up to everyone.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {COMING_SOON.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="inline-block rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold">
                Coming soon
              </span>
              <h3 className="mt-3 font-semibold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-slate-400">
          University of The Gambia &middot; ITCA Account Management
        </div>
      </footer>
    </div>
  );
}
