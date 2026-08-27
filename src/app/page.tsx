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
            <p className="text-sm font-medium text-ink">Community Hub</p>
          </div>
          {!loading && (
            <div className="flex items-center gap-2">
              {!user && (
                <>
                  <Link
                    href="/register"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-slate-50"
                  >
                    Create Account
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-ink/90"
                  >
                    Sign In
                  </Link>
                </>
              )}
              {isOfficer && (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-ink/90"
                >
                  Dashboard
                </Link>
              )}
              {!isOfficer && user && (
                <>
                  <span className="text-sm text-slate-500">Hi, {user.name}</span>
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

      {/* Coming Soon Section - Right After Header */}
      <section className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-2xl px-4">
          <div className="text-center">
            <Badge tone="gold">Coming Soon for Members</Badge>
            <h2 className="mt-3 text-lg font-semibold text-ink">Financial Transparency</h2>
            <p className="mt-2 text-sm text-slate-600">
              Full access to ITCA's income, expenses, and financial reports coming soon for registered members.
            </p>
          </div>
        </div>
      </section>

      {/* Community Feed - Main Content */}
      <section className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-ink">Community Feed</h1>
          <p className="mt-1 text-slate-600">Latest updates and announcements from ITCA</p>
        </div>

        {/* Feed Posts */}
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

                {/* Post Stats & Actions */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4 text-slate-600">
                      <button className="flex items-center gap-1.5 hover:text-red-600 transition-colors">
                        <Heart className="h-4 w-4" /> {post.likesCount}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <MessageCircle className="h-4 w-4" /> {post.commentsCount}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-amber-600 transition-colors">
                        <Bookmark className="h-4 w-4" /> {post.savesCount}
                      </button>
                    </div>
                    {user && isOfficer && (
                      <Link href="/feed" className="text-ink font-semibold text-sm hover:underline">
                        View all
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* CTA for Guests */}
        {!user && posts.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-600 mb-4">Want to engage with the community?</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/90"
              >
                Create Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-ink px-6 py-3 text-sm font-semibold text-ink hover:bg-ink/5"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* CTA for Logged In Users */}
        {user && !isOfficer && posts.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-600 mb-4">Explore the full community feed</p>
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/90"
            >
              View Feed <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 mt-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-slate-400">
          <p>University of The Gambia · ITCA Community Hub</p>
          <p className="mt-2">
            {isOfficer && (
              <Link href="/admin" className="text-ink hover:underline">
                Admin Panel
              </Link>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
