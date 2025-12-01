import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MOCK_POSTS, USERS, ICONS } from '../constants';
import { Post, User } from '../types';
import { PostCard } from '../components/PostCard';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

type ProfileTab = 'posts' | 'media' | 'saved';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => {
    const activeClasses = 'border-red-500 text-slate-900 dark:text-slate-100';
    const inactiveClasses = 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200';
    return (
        <button
            onClick={onClick}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
        >
            {label}
        </button>
    );
};

const PostModal: React.FC<{ post: Post; onClose: () => void; author: User }> = ({ post, onClose, author }) => (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:opacity-80 transition-opacity">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="w-full max-w-5xl h-[90vh] bg-white dark:bg-slate-900 flex rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-full md:w-3/5 bg-black flex items-center justify-center rounded-l-lg">
                <img src={post.image} alt={post.imageDescription} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="hidden md:flex w-2/5 flex-col p-4">
                <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <Avatar src={author.avatar} alt={author.name} size="md" />
                    <div>
                        <p className="font-semibold text-sm">{author.name}</p>
                        <p className="text-xs text-slate-500">@{author.username}</p>
                    </div>
                </div>
                <div className="flex-1 py-4 space-y-4 text-sm overflow-y-auto">
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-8">Comments are not yet implemented.</p>
                </div>
            </div>
        </div>
    </div>
);


export const ProfilePage: React.FC = () => {
    const { userId } = useParams();
    const { user: loggedInUser } = useAuth();
    const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const navigate = useNavigate();
    
    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/home', { replace: true });
        }
    };

    const userToDisplay = userId ? USERS[userId] : loggedInUser;
    
    if (!userToDisplay || !loggedInUser) {
        return <div className="text-center p-8">User not found.</div>;
    }

    const isOwnProfile = userToDisplay.id === loggedInUser.id;
    const userPosts = MOCK_POSTS.filter(post => post.author.id === userToDisplay.id);
    const userMediaPosts = userPosts.filter(post => post.image);

    const renderContent = () => {
        switch (activeTab) {
            case 'posts':
                return userPosts.length > 0
                    ? <div className="space-y-6">{userPosts.map(post => <PostCard key={post.id} post={post} />)}</div>
                    : <Card><p className="text-center py-8 text-slate-500 dark:text-slate-400">No posts yet.</p></Card>;
            case 'media':
                return userMediaPosts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 sm:gap-4">
                        {userMediaPosts.map(post => (
                            <div key={post.id} onClick={() => setSelectedPost(post)} className="group relative cursor-pointer aspect-square">
                                <img src={post.image} alt={post.imageDescription} className="w-full h-full object-cover rounded-md"/>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center gap-x-6 text-white font-semibold rounded-md"></div>
                            </div>
                        ))}
                    </div>
                ) : <Card><p className="text-center py-8 text-slate-500 dark:text-slate-400">No media found.</p></Card>;
            case 'saved':
                return <Card><p className="text-center py-8 text-slate-500 dark:text-slate-400">Saved items will appear here.</p></Card>;
            default:
                return null;
        }
    };
    
    return (
        <div className="w-full">
            <Card className="!p-0 relative mb-8">
                <button onClick={handleBack} className="md:hidden absolute top-4 left-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors">
                    {ICONS.chevronLeft}
                </button>
                <div>
                    <img src={userToDisplay.coverPhoto} alt="Cover" className="w-full h-48 md:h-64 object-cover rounded-t-xl" />
                </div>
                
                <div className="absolute top-32 md:top-48 left-1/2 transform -translate-x-1/2">
                    <Avatar src={userToDisplay.avatar} alt={userToDisplay.name} size="xl" className="border-4 border-white dark:border-slate-800 h-24 w-24 md:h-32 md:w-32" />
                </div>
                
                <div className="pt-16 pb-6 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-3xl font-bold">{userToDisplay.name}</h1>
                        <Badge role={userToDisplay.role} />
                    </div>
                    <p className="text-md text-slate-500 dark:text-slate-400">@{userToDisplay.username}</p>
                    <p className="mt-4 max-w-2xl mx-auto text-sm">{userToDisplay.bio}</p>

                    <div className="mt-6 flex items-center justify-center gap-x-8 text-md flex-wrap">
                        <p><span className="font-semibold">{userPosts.length}</span> posts</p>
                        <p><span className="font-semibold">{userToDisplay.followers?.toLocaleString() || 0}</span> followers</p>
                        <p><span className="font-semibold">{userToDisplay.following?.toLocaleString() || 0}</span> following</p>
                    </div>

                    <div className="mt-6 flex justify-center items-center gap-3">
                        {isOwnProfile ? (
                            <>
                                <Link to="/settings">
                                    <Button>Edit Profile</Button>
                                </Link>
                                <Link to="/settings" title="Account Settings">
                                    <Button variant="ghost" className="!p-2.5">
                                        {ICONS.settings}
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <Button>Follow</Button>
                        )}
                    </div>
                </div>
            </Card>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg z-10 rounded-xl shadow-md mb-8">
                <nav className="flex justify-center items-center">
                    <TabButton label="Posts" isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                    <TabButton label="Media" isActive={activeTab === 'media'} onClick={() => setActiveTab('media')} />
                    <TabButton label="Saved" isActive={activeTab === 'saved'} onClick={() => setActiveTab('saved')} />
                </nav>
            </div>
            
            <div>
                {renderContent()}
            </div>
            
            {selectedPost && <PostModal post={selectedPost} author={userToDisplay} onClose={() => setSelectedPost(null)} />}
        </div>
    );
};