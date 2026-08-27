'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Trash2, Send } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/format';
import { inputClass } from '@/lib/ui';
import type { Post, Comment } from '@/lib/types';

interface PostCardProps {
  post: Post;
  onPostDeleted: () => void;
  onCommentAdded: () => void;
}

export default function PostCard({ post, onPostDeleted, onCommentAdded }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.isLiked);
  const [saved, setSaved] = useState(post.isSaved);
  const [shared, setShared] = useState(post.isShared);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [savesCount, setSavesCount] = useState(post.savesCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const canDelete = user?.id === post.author.id || user?.role === 'ADMIN';

  async function handleLike() {
    try {
      await api.post(`/feed/${post.id}/like`, {});
      setLiked(!liked);
      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  }

  async function handleSave() {
    try {
      await api.post(`/feed/${post.id}/save`, {});
      setSaved(!saved);
      setSavesCount(saved ? savesCount - 1 : savesCount + 1);
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  }

  async function handleShare() {
    try {
      await api.post(`/feed/${post.id}/share`, {});
      setShared(!shared);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await api.post(`/feed/${post.id}/comments`, {
        content: commentText,
      });
      setCommentText('');
      onCommentAdded();
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/feed/${post.id}`);
      onPostDeleted();
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  }

  return (
    <Card className="p-5">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-slate-900">{post.author.name}</p>
          <p className="text-xs text-slate-500">{formatDate(post.createdAt)}</p>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Delete post"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Post Content */}
      <p className="text-slate-700 mb-3">{post.content}</p>

      {/* Post Image */}
      {post.image && (
        <img src={post.image} alt="Post" className="w-full rounded-lg mb-3 max-h-96 object-cover" />
      )}

      {/* Post Stats */}
      <div className="flex items-center gap-4 text-xs text-slate-500 border-b border-slate-100 py-2 mb-3">
        <span>{likesCount} likes</span>
        <span>{post.commentsCount} comments</span>
        <span>{post.sharesCount} shares</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            liked
              ? 'text-red-600 bg-red-50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} strokeWidth={2} />
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2} />
          Comment
        </button>
        <button
          onClick={handleShare}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            shared
              ? 'text-blue-600 bg-blue-50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Share2 className="h-4 w-4" strokeWidth={2} />
          Share
        </button>
        <button
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            saved
              ? 'text-amber-600 bg-amber-50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} strokeWidth={2} />
          Save
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-3 border-t border-slate-100 pt-3">
          {/* Existing Comments */}
          {post.comments.length > 0 && (
            <div className="space-y-2">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{comment.author.name}</p>
                    <p className="text-slate-700">{comment.content}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment Form */}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className={`${inputClass} flex-1 py-2 text-sm`}
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="rounded-lg bg-ink text-white px-3 py-2 hover:bg-ink/90 disabled:opacity-50 transition-opacity"
            >
              <Send className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      )}
    </Card>
  );
}
