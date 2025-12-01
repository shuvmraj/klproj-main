import React from 'react';
import { SUGGESTED_USERS } from '../constants';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const SuggestedUsers: React.FC = () => {
    return (
        <Card>
            <div className="p-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Who to follow</h3>
                <div className="space-y-4">
                    {SUGGESTED_USERS.map(user => (
                        <div key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Avatar src={user.avatar} alt={user.name} size="md" />
                                <div>
                                    <p className="font-semibold text-sm">{user.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
                                </div>
                            </div>
                            <Button variant="secondary" className="!px-4 !py-1.5 !text-sm !font-bold">Follow</Button>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};