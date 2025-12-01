import React, { useState } from 'react';
import { Avatar } from './ui/Avatar';
import { ICONS } from '../constants';
import { postsAPI } from '../src/api/posts';
import { useAuth } from '../hooks/useAuth';

interface CommentItemProps {
  comment: any;
  postId: string;
  onCommentUpdated: (comment: any) => void;
}

const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  const interval = seconds / 86400;
  if (interval > 7) return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  if (interval > 1) return `${Math.floor(interval)}d ago`;
  const hours = Math.floor(seconds / 3600);
  if (hours > 1) return `${hours}h ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes > 1) return `${minutes}m ago`;
  return 'Just now';
};

export const CommentItem: React.FC<CommentItemProps> = ({ comment, postId, onCommentUpdated }) => {
  const { user } = useAuth();
  const [isCommentLiked, setIsCommentLiked] = useState(comment.isLiked || false);
  const [commentLikeCount, setCommentLikeCount] = useState(comment.likes?.length || 0);
  const [isCommentLikeLoading, setIsCommentLikeLoading] = useState(false);
  const [showCommentLikesModal, setShowCommentLikesModal] = useState(false);
  const [commentLikes, setCommentLikes] = useState<any[]>(comment.likes || []);

  const handleCommentLike = async () => {
    if (isCommentLikeLoading) return;

    setIsCommentLikeLoading(true);
    try {
      if (isCommentLiked) {
        await postsAPI.unlikeComment(postId, comment._id);
        setCommentLikeCount(prev => prev - 1);
      } else {
        await postsAPI.likeComment(postId, comment._id);
        setCommentLikeCount(prev => prev + 1);
      }
      setIsCommentLiked(!isCommentLiked);
    } catch (error) {
      console.error('Error toggling comment like:', error);
      alert('Unable to process your like. Please try again.');
    } finally {
      setIsCommentLikeLoading(false);
    }
  };

  const handleShowCommentLikes = () => {
    if (commentLikes && commentLikes.length > 0) {
      setShowCommentLikesModal(true);
    }
  };

  return (
    <div className="flex gap-2">
      <Avatar src={comment.user?.profilePicture || comment.author?.avatar} alt={comment.user?.name || comment.author?.name} size="sm" />
      <div className="flex-1">
        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
          <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
            {comment.user?.name || comment.author?.name}
          </p>
          <p className="text-sm text-slate-800 dark:text-slate-200">{comment.text}</p>
        </div>
        <div className="flex gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
          <span>{timeAgo(comment.date || comment.createdAt || new Date().toISOString())}</span>
          <button
            onClick={handleCommentLike}
            disabled={isCommentLikeLoading}
            className={`hover:text-red-500 transition-colors ${isCommentLiked ? 'text-red-500' : ''}`}
          >
            {isCommentLiked ? 'Unlike' : 'Like'}
          </button>
          <button className="hover:text-red-500">Reply</button>
          {commentLikeCount > 0 && (
            <button
              onClick={handleShowCommentLikes}
              className="hover:text-red-500 transition-colors"
            >
              {commentLikeCount} {commentLikeCount === 1 ? 'like' : 'likes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
