import React from 'react';
import { Message, User } from '../types';
import { Avatar } from './ui/Avatar';
import { ICONS } from '../constants';

interface SharedPost {
  _id: string;
  user: {
    name: string;
    email: string;
    profilePicture: string;
  };
  content?: string;
  image?: string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: {
    type: 'text' | 'post';
    sender?: {
      name: string;
      profilePicture: string;
    };
    content?: string;
    text?: string;
    postId?: SharedPost;
    createdAt: string;
    timestamp?: string;
  };
  isOwnMessage: boolean;
  showSenderInfo?: boolean; // For group chats
  onDelete?: () => void;
}

const parseMarkdownToHTML = (text: string): string => {
  let escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  escapedText = escapedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escapedText = escapedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  escapedText = escapedText.replace(/__(.*?)__/g, '<u>$1</u>');

  return escapedText;
};


export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, showSenderInfo = false, onDelete }) => {
  const bubbleClasses = isOwnMessage
    ? 'bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white'
    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100';

  const containerClasses = isOwnMessage ? 'flex-row-reverse' : 'flex-row';

  // Check if this is a shared post message
  const isPostMessage = message.type === 'post' && message.postId;
  const post = isPostMessage ? message.postId : null;
  
  // Determine what to display in the post
  const hasContent = post?.content && post.content.trim();
  const hasImage = post?.image;
  const postAuthor = post?.user;

  return (
    <div className={`group flex items-end gap-2 ${containerClasses}`}>
      {isOwnMessage && onDelete && (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 mb-2 flex-shrink-0"
          aria-label="Delete message"
          title="Delete message"
        >
          {ICONS.trash}
        </button>
      )}
       {!isOwnMessage && message.sender && (
            <Avatar src={message.sender.profilePicture} alt={message.sender.name} size="sm" className={!showSenderInfo ? 'opacity-0' : ''} />
        )}
      
      {/* Shared Post */}
      {isPostMessage && post ? (
        <div className={`max-w-md rounded-lg overflow-hidden border border-black bg-white`}>
          {/* Post header with author - Always show */}
          {postAuthor && (
            <div className={`p-3 border-b border-black flex items-center space-x-2 bg-white`}>
              {postAuthor.profilePicture && (
                <Avatar src={postAuthor.profilePicture} alt={postAuthor.name} size="sm" />
              )}
              <div>
                <p className={`font-semibold text-sm text-black`}>
                  {postAuthor.name || 'Unknown Author'}
                </p>
                <p className={`text-xs text-black opacity-70`}>
                  @{postAuthor.email?.split('@')[0] || 'unknown'}
                </p>
              </div>
            </div>
          )}

          {/* Post content - Only if there's content */}
          {hasContent && (
            <div className={`p-3 bg-white border-b border-black`}>
              <p className="text-sm text-black whitespace-pre-wrap">{post.content}</p>
            </div>
          )}
          
          {/* Post image - Only if there's an image */}
          {post.image && (
            <div className={`p-3 bg-white ${hasContent ? '' : 'border-b border-black'}`}>
              <img
                src={post.image}
                alt={`Post by ${post.user?.name || 'author'}`}
                className="w-full rounded-lg max-h-64 object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', post.image);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Optional message from sharer */}
          {message.content && (
            <div className={`p-3 border-t border-black bg-gray-50`}>
              <p className="text-sm text-black italic">"{message.content}"</p>
            </div>
          )}

          {/* Timestamp */}
          <div className={`px-3 py-2 text-xs border-t border-black bg-gray-50 text-black opacity-70`}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ) : (
        /* Regular text message */
        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${bubbleClasses} ${isOwnMessage ? 'rounded-br-none' : 'rounded-bl-none'}`}>
          {showSenderInfo && !isOwnMessage && message.sender && (
              <p className="font-semibold text-sm mb-1 text-red-500 dark:text-red-400">{message.sender.name}</p>
          )}
          <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(message.content || message.text) }} />
          <p className={`text-xs mt-1 opacity-70 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}
    </div>
  );
};