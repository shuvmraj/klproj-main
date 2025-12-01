import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_BROADCASTS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../contexts/SocketContext';
import { Role, Broadcast } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { BroadcastCard } from '../components/BroadcastCard';
import { announcementsAPI } from '../src/api/announcements';

// --- ICONS ---
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.023.57-2.308.002-3.332C12.093 8.32 10.343 7.5 8.5 7.5c-1.843 0-3.593.82-4.55 2.206-.568 1.024-.568 2.308 0 3.332a8.958 8.958 0 014.55 2.206zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-7.5 0a3 3 0 116 0 3 3 0 01-6 0z" />
    </svg>
);
const StudentsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.905 59.905 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-3.07-.812A59.905 59.905 0 0112 3.493a59.905 59.905 0 0110.399 5.84l-3.07.813m0 0a59.905 59.905 0 01-21.8 0z" />
    </svg>
);
const TeachersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

// --- HELPER COMPONENTS ---
const AudienceButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const baseClasses = "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 w-full";
  const activeClasses = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400 font-semibold shadow-inner";
  const inactiveClasses = "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400";
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6"})}
      <span className="text-sm">{label}</span>
    </button>
  );
};


const AudienceBadge: React.FC<{ target: Role | 'All' }> = ({ target }) => {
  const styles: Record<Role | 'All', string> = {
    'All': 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    [Role.STUDENT]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    [Role.TEACHER]: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    [Role.ADMIN]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  };
  const label = target === 'All' ? 'All Users' : target;
  
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[target]}`}>
      {label}
    </span>
  );
};


const BroadcastHistoryItem: React.FC<{ broadcast: Broadcast }> = ({ broadcast }) => {
    return (
        <div className="flex items-start gap-4 py-5 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
            <Avatar src={broadcast.author.avatar} alt={broadcast.author.name} size="md" />
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{broadcast.title}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-4">
                        {new Date(broadcast.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                </div>
                 <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-wrap">{broadcast.content}</p>
                <div className="mt-4 flex items-center justify-between">
                   <AudienceBadge target={broadcast.target} />
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export const BroadcastPage: React.FC = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>(MOCK_BROADCASTS.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [target, setTarget] = useState<Role | 'All'>('All');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/home', { replace: true });
        }
    };
    
    const clearForm = () => {
        setTitle('');
        setContent('');
        setTarget('All');
        setError('');
    }

    const mapRoleToTarget = (role: Role | 'All'): string => {
      if (role === 'All') return 'All';
      if (role === Role.STUDENT) return 'Student';
      if (role === Role.TEACHER) return 'Teacher';
      return 'All';
    };

    const handleSendBroadcast = async () => {
        if (!title.trim() || !content.trim() || !user) return;
        
        try {
            setIsSubmitting(true);
            setError('');
            
            // Map frontend role to backend target
            const backendTarget = mapRoleToTarget(target);
            
            // Save to database
            const newAnnouncement = await announcementsAPI.createAnnouncement({
                title,
                content,
                target: backendTarget
            });
            
            // Create broadcast object for local state
            const newBroadcast: Broadcast = {
                id: newAnnouncement._id,
                title: newAnnouncement.title,
                content: newAnnouncement.content,
                author: user,
                target: target,
                timestamp: newAnnouncement.createdAt,
            };
            
            // Update local state
            setBroadcasts([newBroadcast, ...broadcasts]);
            
            // Emit socket event
            if (socket) {
                socket.emit('new-announcement', newAnnouncement);
            }
            
            clearForm();
            setIsPreviewOpen(false);
        } catch (err) {
            setError('Failed to send broadcast. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const isFormIncomplete = !title.trim() || !content.trim();

    return (
        <div className="bg-slate-50 dark:bg-slate-900 -m-4 md:-m-8 p-4 md:p-8 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={handleBack} className="md:hidden p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">Broadcast System</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* --- CREATE BROADCAST --- */}
                <div className="lg:col-span-2">
                     <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Create Broadcast</h2>
                     <Card className="p-6">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="broadcast-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                <Input 
                                    id="broadcast-title"
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    placeholder="e.g., Campus Closure Notice"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label htmlFor="broadcast-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                                <textarea
                                    id="broadcast-message"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 resize-vertical transition text-base placeholder:text-slate-400 disabled:opacity-50"
                                    rows={5}
                                    placeholder="Write your announcement here..."
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Audience</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <AudienceButton label="All Users" icon={<UsersIcon />} isActive={target === 'All'} onClick={() => !isSubmitting && setTarget('All')} />
                                    <AudienceButton label="Students" icon={<StudentsIcon />} isActive={target === Role.STUDENT} onClick={() => !isSubmitting && setTarget(Role.STUDENT)} />
                                    <AudienceButton label="Teachers" icon={<TeachersIcon />} isActive={target === Role.TEACHER} onClick={() => !isSubmitting && setTarget(Role.TEACHER)} />
                                </div>
                            </div>
                            {error && (
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <Button variant="ghost" onClick={() => setIsPreviewOpen(true)} disabled={isFormIncomplete || isSubmitting}>Preview</Button>
                                <Button onClick={handleSendBroadcast} disabled={isFormIncomplete || isSubmitting}>
                                    {isSubmitting ? 'Sending...' : 'Send Broadcast'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* --- BROADCAST HISTORY --- */}
                <div className="lg:col-span-3">
                    <h2 className="text-2xl font-bold mb-4">Broadcast History</h2>
                    <Card>
                        <div className="max-h-[70vh] overflow-y-auto p-4">
                            {broadcasts.length > 0 ? (
                                broadcasts.map(b => <BroadcastHistoryItem key={b.id} broadcast={b} />)
                            ) : (
                                <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                                    <p>No past broadcasts.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- PREVIEW MODAL --- */}
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Broadcast Preview">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">This is how your broadcast will appear in the main feed.</p>
                {user && (
                    <BroadcastCard
                        broadcast={{
                            id: 'preview-id',
                            title: title,
                            content: content,
                            author: user,
                            target: target,
                            timestamp: new Date().toISOString(),
                        }}
                        isPinned={true}
                    />
                )}
                 <div className="flex justify-end mt-4">
                    <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
                </div>
            </Modal>
        </div>
    );
};
