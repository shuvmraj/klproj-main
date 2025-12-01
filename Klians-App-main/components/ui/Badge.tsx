
import React from 'react';
import { Role } from '../../types';

interface BadgeProps {
  role: Role;
}

export const Badge: React.FC<BadgeProps> = ({ role }) => {
  const roleColors: Record<Role, string> = {
    [Role.STUDENT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    [Role.TEACHER]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [Role.ADMIN]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role]}`}>
      {role}
    </span>
  );
};
