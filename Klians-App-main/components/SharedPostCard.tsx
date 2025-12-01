import React from 'react';
import { Avatar } from './ui/Avatar';

interface SharedPost {
  _id: string;
  content: string;
  user?: {
    name: string;
    email: string;
    profilePicture: string;
  };
  author?: {
    name: string;
    email: string;
    profilePicture: string;
  };
  image?: string;
  timestamp?: string;
  createdAt?: string;
  likes?: any[];
  comments?: any[];
}

interface SharedPostCardProps {
  post: SharedPost;
  message?: string;
}

const parseMarkdownToHTML = (text: string | undefined): string => {
  if (!text) return '';
  
  let escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  escapedText = escapedText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>');
    
  escapedText = escapedText.replace(/(#\w+)/g, '<a href="#" class="text-red-500 hover:underline">$1</a>');

  return escapedText;
};

export const SharedPostCard: React.FC<SharedPostCardProps> = ({ post, message }) => {
  // Use user field from Post model (fallback to author if available)
  const postAuthor = post.user || post.author;

  return (
    <div className="space-y-2 w-full">
      {/* Shared Post as Red Bubble Message */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-3xl p-4 max-w-sm">
        {/* Post Content */}
        <div className="space-y-2">
          {message && (
            <p className="text-sm line-clamp-2">
              {message}
            </p>
          )}
          
          {post.content && (
            <p 
              className="text-sm line-clamp-3"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(post.content) }}
            />
          )}

          {/* Post Image if exists */}
          {post.image && (
            <div className="rounded-2xl overflow-hidden mt-2">
              <img 
                src={post.image} 
                alt="Post content"
                className="w-full h-auto max-h-32 object-cover"
              />
            </div>
          )}

          {/* Post Author Info */}
          {postAuthor && (
            <div className="flex items-center gap-2 pt-2 border-t border-white/30">
              <Avatar 
                src={postAuthor.profilePicture} 
                alt={postAuthor.name} 
                size="sm"
              />
              <p className="text-xs font-semibold">
                {postAuthor.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
