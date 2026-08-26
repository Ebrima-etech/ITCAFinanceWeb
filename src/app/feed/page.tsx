'use client';

import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Trash2, Plus } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/format';
import PostForm from '@/components/feed/PostForm';
import PostCard from '@/components/feed/PostCard';
import type { Post } from '@/lib/types';

export default function FeedPage() {
  const { user } = useAuth();
  const canPost = user?.role === 'ADMIN';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await api.get<Post[]>('/feed');
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Community Feed</h1>
          <p className="mt-1 text-slate-600">Connect and share updates with ITCA members</p>
        </div>

        {/* Create Post Form - Admin Only */}
        {canPost && (
          <Card className="mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Create a post</h2>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> New post
                </Button>
              )}
            </div>
            {showForm && (
              <PostForm
                onPostCreated={() => {
                  setShowForm(false);
                  loadPosts();
                }}
                onCancel={() => setShowForm(false)}
              />
            )}
          </Card>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-600">No posts yet. {canPost && 'Be the first to post!'}</p>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onPostDeleted={loadPosts} onCommentAdded={loadPosts} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
