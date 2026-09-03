'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { isInternalRole, useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { Post } from '@/lib/types';

export default function RootPage() {
  const { user, loading, logout } = useAuth();
  const isOfficer = !!user && isInternalRole(user.role);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await api.get<Post[]>('/feed');
        setPosts(data);
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
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">UTG ITCA</p>
            <p className="text-sm font-medium text-ink">Account Management</p>
          </div>
          {!loading && isOfficer && (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-ink/90"
              >
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
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
                Explore the community feed below
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

      {/* Coming Soon Section */}
      <section className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-2xl px-4">
          <div className="text-center">
            <Badge tone="gold">Coming Soon for Members</Badge>
            <h2 className="mt-3 text-lg font-semibold text-ink">Full Financial Dashboard</h2>
            <p className="mt-2 text-sm text-slate-600">
              Detailed reports, budgeting tools, and complete financial transparency for ITCA members.
            </p>
          </div>
        </div>
      </section>

      {/* Community Feed - Public Section */}
      <section className="mx-auto max-w-2xl px-4 py-12 hidden">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-ink">Finance Ministry</h2>
          <p className="mt-2 text-slate-600">Latest news and announcements from ITCA</p>
        </div>

        {/* Feed Posts - PUBLIC */}
        <div className="space-y-4">
          {postsLoading ? (
            <div className="text-center py-12 text-slate-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
              <p className="mt-3">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-600">No posts yet. Check back soon!</p>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="p-6 hover:shadow-card-hover transition-shadow">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{post.author.name}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-slate-700 mb-3 whitespace-pre-wrap">{post.content}</p>

                {/* Post Image */}
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full rounded-lg mb-3 max-h-96 object-cover"
                  />
                )}

                {/* Post Stats */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4" /> {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4" /> {post.commentsCount}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bookmark className="h-4 w-4" /> {post.savesCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* CTA - Only for logged in users */}
        {user && !isOfficer && posts.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-600 mb-4">Interact with posts and more on the full feed</p>
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/90"
            >
              View Full Feed <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 mt-12">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-slate-400">
          <p>University of The Gambia · ITCA Account Management</p>
          {isOfficer && (
            <p className="mt-2">
              <Link href="/admin" className="text-ink hover:underline">
                Admin Panel
              </Link>
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
