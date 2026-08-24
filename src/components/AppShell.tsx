'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Wallet,
  PieChart,
  FileText,
  ShieldCheck,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { isInternalRole, useAuth } from '@/lib/auth-context';

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon; adminOnly?: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ledger', label: 'Ledger', icon: BookOpen },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/dues', label: 'Dues', icon: Wallet },
  { href: '/budget', label: 'Budget', icon: PieChart },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (!isInternalRole(user.role)) {
      // Student accounts have no internal financial access yet - nothing
      // in here applies to them, so send them back to the public page.
      router.replace('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">
        Loading...
      </div>
    );
  }
  if (!user || !isInternalRole(user.role)) return null;

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user.role === 'ADMIN');
  const activeItem = items.find((item) => pathname.startsWith(item.href));
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-ink text-white md:flex">
        <div className="px-5 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">UTG ITCA</p>
          <p className="mt-0.5 text-sm font-semibold text-white">Account Management</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? 'bg-white/10 font-semibold text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-semibold text-gold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-white/50">{formatRole(user.role)}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar + nav */}
        <header className="border-b border-slate-200 bg-ink text-white md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">UTG ITCA</p>
              <p className="text-sm font-medium">Account Management</p>
            </div>
            <button onClick={logout} className="rounded-md bg-white/10 p-2 hover:bg-white/20">
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${
                  pathname.startsWith(item.href) ? 'bg-white/15 font-semibold' : 'text-white/75'
                }`}
              >
                <item.icon className="h-3.5 w-3.5" strokeWidth={2} />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* Desktop top bar */}
        <header className="hidden h-14 shrink-0 items-center border-b border-slate-200 bg-white px-8 md:flex">
          <h1 className="text-sm font-semibold text-slate-700">{activeItem?.label ?? ''}</h1>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
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
