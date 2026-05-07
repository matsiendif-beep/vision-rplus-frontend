'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { SidebarContext } from './SidebarContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close sidebar when navigating on mobile
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <SidebarContext.Provider value={{ toggle: () => setOpen(v => !v) }}>
      <div className="flex min-h-screen bg-surface-secondary">

        {/* Mobile backdrop */}
        {open && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar — hidden off-screen on mobile, always visible on desktop */}
        <div className={[
          'fixed inset-y-0 left-0 z-40 flex-shrink-0',
          'transform transition-transform duration-200 ease-in-out',
          'lg:static lg:z-auto lg:transform-none',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}>
          <Sidebar />
        </div>

        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
