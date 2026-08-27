'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, PieChart, CreditCard, PlusCircle, Activity, FileCheck, Heart, MessageCircle } from 'lucide-react';
import { isInternalRole, useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { Post } from '@/lib/types';

const COMING_SOON = [
  {
    icon: Eye,
    title: 'Financial Transparency',
    body: "See ITCA's income and expenses at a glance — dues collected, gifts received, and where the money goes.",
  },
  {
    icon: PieChart,
    title: 'Project & Event Spending',
    body: 'A breakdown of what every event and project actually cost, and what it raised, in plain numbers.',
  },
  {
    icon: CreditCard,
    title: 'Pay for Services Online',
    body: 'Pay dues, event tickets, and other ITCA services directly — no more chasing an officer with cash.',
  },
];

const HOW_IT_WORKS = [
  {
    icon: PlusCircle,
    title: 'An officer records it',
    body: 'A due paid, a ticket sold, a gift received, a cost paid — every one becomes a single, labeled entry.',
  },
  {
    icon: Activity,
    title: 'The ledger adds it up',
    body: "Event profit and loss, dues totals, budget vs actual — all calculated live, never stored twice.",
  },
  {
    icon: FileCheck,
    title: 'It stays accountable',
    body: 'Every add, edit, and delete is logged with who did it and when, so nothing is ever lost quietly.',
  },
];

export default function RootPage() {
  const { user, loading, logout } = useAuth();
  const isOfficer = !!user && isInternalRole(user.role);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await api.get<Post[]>('/feed');
        setPosts(data.slice(0, 3)); // Show last 3 posts
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setPostsLoading(false);
      }
    }
    loadPosts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">UTG ITCA</p>
            <p className="text-sm font-medium text-ink">Account Management</p>
          </div>
          {!loading && (
            <div className="flex items-center gap-2">
              {!user && (
                <Link
                  href="/register"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-slate-50"
                >
                  Create Account
                </Link>
              )}
              {isOfficer && (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-ink/90"
                >
                  Go to Dashboard
                </Link>
              )}
              {!isOfficer && !user && (
                <Link
                  href="/login"
                  className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-ink/90"
                >
                  Officer Sign In
                </Link>
              )}
              {!isOfficer && user && (
                <>
                  <span className="text-sm text-slate-500">Signed in as {user.name}</span>
                  <button
                    onClick={logout}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden bg-ink text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 80% 10%, rgba(201,150,44,0.18), transparent 45%), radial-gradient(circle at 15% 85%, rgba(201,150,44,0.10), transparent 40%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
            One ledger. Every dalasi accounted for.
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            ITCA&apos;s money, in the open
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 sm:text-lg">
            A single place where ITCA&apos;s dues, event revenue, gifts, and spending are tracked —
            built so any member can see where the money comes from and where it goes.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {isOfficer ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-gold/90"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : user ? (
              <span className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white">
                You&apos;re signed in — public features are coming soon
              </span>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-gold/90"
                >
                  Create a Student Account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Officer Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">How it works</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Every transaction, one rule</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            A due paid, a ticket sold, a gift received, a cost paid — they&apos;re all just
            transactions with a label. Get that right and everything else follows.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.title} className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white">
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-xs font-semibold text-gold">STEP {i + 1}</p>
              <h3 className="mt-1 font-semibold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community Feed Section */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-ink">Community Updates</h2>
            <p className="mt-2 text-slate-500">Latest news and announcements from ITCA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {postsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="h-48 animate-pulse" />
              ))
            ) : posts.length === 0 ? (
              <div className="lg:col-span-3 text-center py-8 text-slate-500">
                <p>No posts yet. Check back soon!</p>
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="p-4 flex flex-col">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{post.author.name}</p>
                  <p className="text-sm text-slate-700 flex-1 mb-3 line-clamp-3">{post.content}</p>
                  {post.image && (
                    <img src={post.image} alt="Post" className="w-full rounded mb-3 max-h-32 object-cover" />
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {post.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {post.commentsCount}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>

          {posts.length > 0 && (
            <div className="text-center mt-8">
              {isOfficer ? (
                <Link href="/feed" className="inline-flex items-center gap-2 text-ink font-semibold hover:underline">
                  Go to Community Feed <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90">
                  Join to See More <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section id="coming-soon" className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge tone="gold">Coming soon for every member</Badge>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
              Right now this system is how ITCA officers keep the books straight. The next step
              opens part of it up to everyone.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {COMING_SOON.map((item) => (
              <Card key={item.title} className="p-6 transition-shadow hover:shadow-card-hover">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <item.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{item.body}</p>
              </Card>
            ))}
          </div>
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
