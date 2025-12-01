import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../contexts/SocketContext';
import { MOCK_POSTS, MOCK_BROADCASTS } from '../constants';
import { Post, Broadcast, Role } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { SuggestedUsers } from '../components/SuggestedUsers';
import { TrendingTopics } from '../components/TrendingTopics';
import { BroadcastCard } from '../components/BroadcastCard';
import { FeedPostCard } from '../components/FeedPostCard';
import { Card } from '../components/ui/Card';
import { CreatePostCard } from '../components/CreatePostCard';
import { CreatePostModal } from '../components/CreatePostModal';
import { postsAPI } from '../src/api/posts';

const PostSkeleton: React.FC = () => (
    <Card className="mb-4">
        <div className="flex items-center space-x-3 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
        <Skeleton className="h-4 w-5/6 mx-4 mb-2" />
        <Skeleton className="h-4 w-4/6 mx-4 mb-4" />
        <Skeleton className="w-full h-[400px] rounded-none" />
        <div className="p-2 flex justify-around">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
        </div>
    </Card>
);


type FeedItem = (Post & { type: 'post' }) | (Broadcast & { type: 'broadcast' });


export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);

  const { socket } = useSocket();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;
      
      // Clean up localStorage if it contains posts with images (too large)
      try {
        const savedPosts = localStorage.getItem('klians_posts');
        if (savedPosts) {
          const posts = JSON.parse(savedPosts);
          const hasLargePosts = posts.some((p: any) => p.image);
          if (hasLargePosts) {
            localStorage.removeItem('klians_posts');
          }
        }
      } catch (e) {
        // If there's an error parsing or accessing localStorage, clear it
        try {
          localStorage.removeItem('klians_posts');
        } catch (err) {
          console.warn('Could not clear localStorage:', err);
        }
      }
      
      setIsLoading(true);
      
      try {
        // Fetch posts from the database
        const response = await postsAPI.getPosts();
        const dbPosts = response.data;
        
        // Convert DB posts to FeedItems with normalized user data
        const postsForFeed: FeedItem[] = dbPosts.map(p => ({
          id: p._id || p.id,
          author: {
            id: p.user._id || p.user.id,
            name: p.user.name,
            username: p.user.email?.split('@')[0] || '',
            email: p.user.email,
            avatar: p.user.profilePicture || p.user.avatar || '', // Map profilePicture to avatar
            coverPhoto: p.user.coverPhoto || '',
            bio: p.user.bio || '',
            role: p.user.role,
            createdAt: p.user.createdAt || new Date().toISOString(),
          },
          content: p.content,
          image: p.image,
          timestamp: p.createdAt || p.timestamp,
          likes: p.likes?.length || 0,
          comments: p.comments?.length || 0,
          isLiked: p.likes?.some((like: any) => like._id?.toString() === user._id?.toString() || like === user._id),
          type: 'post'
        }));
        
        // Add mock broadcasts
        const broadcastsForFeed: FeedItem[] = MOCK_BROADCASTS.map(b => ({ ...b, type: 'broadcast' }));
        
        // Combine and sort
        const combinedFeed = [...postsForFeed, ...broadcastsForFeed];
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        combinedFeed.sort((a, b) => {
          const aIsRecentBroadcast = a.type === 'broadcast' && new Date(a.timestamp) > twentyFourHoursAgo;
          const bIsRecentBroadcast = b.type === 'broadcast' && new Date(b.timestamp) > twentyFourHoursAgo;
          if (aIsRecentBroadcast && !bIsRecentBroadcast) return -1;
          if (!aIsRecentBroadcast && bIsRecentBroadcast) return 1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        setFeedItems(combinedFeed);
      } catch (error) {
        console.error('Error fetching posts:', error);
        
        // Fallback to mock data and localStorage if API fails
        const savedPosts = localStorage.getItem('klians_posts');
        let userPosts: FeedItem[] = [];
        
        if (savedPosts) {
          try {
            userPosts = JSON.parse(savedPosts);
          } catch (e) {
            console.error('Error parsing saved posts:', e);
          }
        }

        const visiblePosts = [...MOCK_POSTS, ...userPosts.filter(p => p.type === 'post')];
        const postsForFeed: FeedItem[] = visiblePosts.map(p => ({ ...p, type: 'post' }));
        const broadcastsForFeed: FeedItem[] = MOCK_BROADCASTS.map(b => ({ ...b, type: 'broadcast' }));
        const combinedFeed = [...postsForFeed, ...broadcastsForFeed];
        
        setFeedItems(combinedFeed);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [user]);
  
  // Listen for real-time post updates
  useEffect(() => {
    if (!socket) return;
    
    // Handle new posts
    socket.on('new-post', (newPost) => {
      setFeedItems(prevItems => {
        const newPostItem = { ...newPost, type: 'post' };
        return [newPostItem, ...prevItems];
      });
    });
    
    return () => {
      socket.off('new-post');
    };
  }, [socket]);

  const handleCreatePost = async (content: string, image?: string) => {
    if (!content.trim() && !image || !user) return;
    
    try {
      // Create post data to send to the server
      const postData = {
        content: content,
        image: image || undefined,
        isBroadcast: false
      };
      
      // Save post to the database
      const response = await postsAPI.createPost(postData);
      const savedPost = response.data;
      
      // Normalize user data from backend
      const authorData = savedPost.user || user;
      const normalizedAuthor = {
        id: authorData._id || authorData.id,
        name: authorData.name,
        username: authorData.email?.split('@')[0] || '',
        email: authorData.email,
        avatar: authorData.profilePicture || authorData.avatar || '',
        coverPhoto: authorData.coverPhoto || '',
        bio: authorData.bio || '',
        role: authorData.role,
        createdAt: authorData.createdAt || new Date().toISOString(),
      };
      
      // Create a FeedItem from the saved post
      const newPost: FeedItem = {
        id: savedPost._id || savedPost.id,
        author: normalizedAuthor,
        content: savedPost.content,
        image: savedPost.image,
        timestamp: savedPost.createdAt || new Date().toISOString(),
        likes: savedPost.likes?.length || 0,
        comments: savedPost.comments?.length || 0,
        type: 'post',
      };
      
      // Only save to localStorage as backup if no image (to avoid quota exceeded)
      if (!image) {
        try {
          const savedPosts = localStorage.getItem('klians_posts');
          let userPosts: FeedItem[] = [];
          
          if (savedPosts) {
            try {
              userPosts = JSON.parse(savedPosts);
            } catch (e) {
              console.error('Error parsing saved posts:', e);
            }
          }
          
          userPosts.unshift(newPost);
          localStorage.setItem('klians_posts', JSON.stringify(userPosts));
        } catch (e) {
          // Silently fail - localStorage is optional backup
          console.warn('Could not save to localStorage:', e);
        }
      }
      
      // Update the UI
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      let lastPinnedIndex = -1;
      feedItems.forEach((item, index) => {
          if (item.type === 'broadcast' && new Date(item.timestamp) > twentyFourHoursAgo) {
              lastPinnedIndex = index;
          }
      });

      const newFeedItems = [...feedItems];
      newFeedItems.splice(lastPinnedIndex + 1, 0, newPost);
      
      setFeedItems(newFeedItems);
      setCreatePostModalOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  if (!user) return null;
  
  const isStudent = user.role === Role.STUDENT;
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return (
    <>
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
            {!isStudent && (
                <CreatePostCard user={user} onComposeClick={() => setCreatePostModalOpen(true)} />
            )}

            {isLoading ? (
                <>
                    <PostSkeleton />
                    <PostSkeleton />
                </>
            ) : (
                feedItems.map((item, index) => {
                    if (item.type === 'post') {
                        return (
                            <FeedPostCard 
                                key={`${item.id || index}-post`} 
                                post={item}
                                onDelete={(postId) => {
                                    setFeedItems(prev => prev.filter(i => i.id !== postId));
                                }}
                            />
                        );
                    } else {
                        const isPinned = new Date(item.timestamp) > twentyFourHoursAgo;
                        return <BroadcastCard key={`${item.id || index}-broadcast`} broadcast={item} isPinned={isPinned} />;
                    }
                })
            )}
      </div>
      <aside className="hidden lg:block lg:col-span-4">
        <div className="sticky top-8 space-y-6">
            <SuggestedUsers />
            <TrendingTopics />
        </div>
      </aside>
    </div>
    <CreatePostModal 
        isOpen={isCreatePostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        user={user}
        onPost={handleCreatePost}
    />
    </>
  );
};