
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { ICONS } from '../constants';
import { Button } from './ui/Button';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navLinks = [
    { to: '/home', label: 'Home', icon: ICONS.home, roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN] },
    { to: '/messages', label: 'Messages', icon: ICONS.messages, roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN] },
    { to: '/groups', label: 'Groups', icon: ICONS.groups, roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN] },
    { to: '/announcements', label: 'Announcements', icon: ICONS.announcement, roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN] },
    { to: '/mailbox', label: 'Mailbox', icon: ICONS.mailbox, roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN] },
    { to: '/events', label: 'Events', icon: ICONS.events, roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN] },
    { to: '/profile', label: 'Profile', icon: ICONS.profile, roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN] },
    { to: '/settings', label: 'Settings', icon: ICONS.settings, roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN] },
    { to: '/analytics', label: 'Analytics', icon: ICONS.analytics, roles: [Role.TEACHER, Role.ADMIN] },
    { to: '/broadcast', label: 'Broadcast', icon: ICONS.broadcast, roles: [Role.TEACHER, Role.ADMIN] },
  ];

  const availableLinks = user ? navLinks.filter(link => link.roles.includes(user.role)) : [];

  const linkClasses = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";
  const activeLinkClasses = "bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white shadow-lg";

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 p-4 flex-col h-full border-r border-slate-200 dark:border-slate-700 hidden md:flex">
      <div className="text-2xl font-bold text-center py-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to">
        KLIAS
      </div>
      <nav className="flex-grow mt-8">
        <ul className="space-y-2">
          {availableLinks.map(link => (
            <li key={link.to}>
              <NavLink 
                to={link.to} 
                className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <Button variant="ghost" className="w-full flex items-center justify-center space-x-2" onClick={logout}>
          {ICONS.logout}
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};
