import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../contexts/MessagesContext';
import { Avatar } from '../components/ui/Avatar';
import { MessageBubble } from '../components/MessageBubble';
import { Input } from '../components/ui/Input';
import { ChatInput } from '../components/ChatInput';
import { Card } from '../components/ui/Card';
import { messagesAPI } from '../src/api/messages';

// Types are now handled by MessagesContext

export const MessagesPage: React.FC = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    conversations,
    messages,
    sendMessage,
    currentConversation,
    setCurrentConversation,
  } = useMessages();
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (conversationId && conversationId !== currentConversation) {
      setCurrentConversation(conversationId);
    }
  }, [conversationId, currentConversation, setCurrentConversation]);

  const handleSearchEmail = async (email: string) => {
    if (!email.includes('@')) return;
    
    setIsSearching(true);
    try {
      const response = await messagesAPI.searchByEmail(email);
      const users = response.data;
      
      if (users.length > 0) {
        const selectedUser = users[0];
        setCurrentConversation(selectedUser._id);
        navigate(`/messages/${selectedUser._id}`);
      }
      
      setSearchEmail('');
    } catch (error) {
      console.error('Error searching user:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversation || !content.trim()) return;
    await sendMessage(currentConversation, content);
  };

  return (
    <div className="h-full flex">
      <aside className={`w-full md:w-[320px] lg:w-[360px] flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${
        conversationId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <Input
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Search by email..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearchEmail(searchEmail)}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            const otherUser = conv.user;

            return (
              <button
                key={otherUser._id}
                onClick={() => navigate(`/messages/${otherUser._id}`)}
                className={`w-full flex items-center p-4 space-x-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  currentConversation === otherUser._id
                    ? 'bg-slate-50 dark:bg-slate-700/50'
                    : ''
                }`}
              >
                <Avatar src={otherUser.profilePicture} alt={otherUser.name} />
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{otherUser.name}</p>
                    {conv.lastMessage && (
                      <p className="text-xs text-slate-500">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-slate-500 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                    {conv.unread && (
                      <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className={`flex-1 flex flex-col ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
        {currentConversation ? (
          <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-3">
              <button onClick={() => navigate('/messages')} className="md:hidden text-slate-500">
                {ICONS.chevronLeft}
              </button>
              {(() => {
                const conversation = conversations.find(c => c.user._id === currentConversation);
                if (!conversation) return null;
                return (
                  <>
                    <Avatar src={conversation.user.profilePicture} alt={conversation.user.name} />
                    <div>
                      <h2 className="font-semibold">{conversation.user.name}</h2>
                      <p className="text-sm text-slate-500">{conversation.user.email}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
              {messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwnMessage={message.sender._id === (user?._id || user?.id)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <Card className="text-center p-8">
              <div className="text-slate-400 mb-4">
                {ICONS.messages}
              </div>
              <h3 className="text-lg font-semibold mb-2">Your Messages</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Search for someone by email to start a conversation
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
