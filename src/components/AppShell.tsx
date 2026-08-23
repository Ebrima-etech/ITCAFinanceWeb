'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/ledger', label: 'Ledger' },
  { href: '/events', label: 'Events' },
  { href: '/dues', label: 'Dues' },
  { href: '/budget', label: 'Budget' },
  { href: '/reports', label: 'Reports' },
  { href: '/admin', label: 'Admin', adminOnly: true },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Loading...</div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">UTG ITCA</p>
            <p className="text-sm font-medium">Account Management</p>
          </div>
          <nav className="hidden gap-1 md:flex">
            {NAV_ITEMS.filter((item) => !item.adminOnly || user.role === 'ADMIN').map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  pathname.startsWith(item.href)
                    ? 'bg-white/15 font-semibold'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-white/70 sm:inline">
              {user.name} &middot; {formatRole(user.role)}
            </span>
            <button onClick={logout} className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/20">
              Sign out
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden">
          {NAV_ITEMS.filter((item) => !item.adminOnly || user.role === 'ADMIN').map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${
                pathname.startsWith(item.href) ? 'bg-white/15 font-semibold' : 'text-white/80'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
