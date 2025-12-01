
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { SearchPage } from '../pages/SearchPage';

export const Layout: React.FC = () => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isChatPage = ['/messages', '/groups'].some(path => location.pathname.startsWith(path));
  const showHeader = location.pathname === '/home';
  const showBottomNav = ['/home', '/groups', '/events', '/profile'].includes(location.pathname);
  
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {showHeader && <Header />}

        {/* Main content area. This now handles scrolling for mobile to allow content to go *under* the header. */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
           {/* The inner div handles padding to avoid content being obscured by the fixed header/footer on mobile */}
          <div className={`${isChatPage ? 'h-full' : `p-4 md:p-8 ${showHeader ? 'pt-20 md:pt-8' : ''} ${showBottomNav ? 'pb-24 md:pb-8' : ''} `}`}>
            <Outlet />
          </div>
        </main>

        {showBottomNav && <BottomNav onSearchClick={() => setIsSearchOpen(true)} />}
        <SearchPage isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </div>
    </div>
  );
};