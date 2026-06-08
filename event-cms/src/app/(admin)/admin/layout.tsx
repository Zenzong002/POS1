'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from '@/lib/firebase/auth';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

// ─── Title map ────────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/events': 'Events',
  '/admin/assets': 'Assets Library',
  '/admin/themes': 'Themes',
  '/admin/settings': 'Settings',
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Match dynamic sub-routes, e.g. /admin/events/[id]
  for (const [key, label] of Object.entries(PAGE_TITLES)) {
    if (key !== '/admin' && pathname.startsWith(key)) return label;
  }
  return 'Admin';
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged((firebaseUser) => {
      if (firebaseUser === null) {
        router.replace('/auth/login');
      } else {
        setUser(firebaseUser);
      }
    });
    return unsub;
  }, [router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // ── Loading splash ─────────────────────────────────────────────────────────
  if (user === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)' }}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Animated gold ring */}
          <div
            className="w-12 h-12 rounded-full border-4 animate-spin"
            style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }}
          />
          <p className="text-sm" style={{ color: 'rgba(212,175,55,0.6)' }}>
            Loading EventCraft…
          </p>
        </div>
      </div>
    );
  }

  const title = getTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Mobile sidebar backdrop ─────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (desktop: always visible, mobile: slide-in) ─────────────── */}
      <div
        className={[
          // Mobile: fixed overlay
          'fixed inset-y-0 left-0 z-40 md:static md:z-auto',
          'transition-transform duration-300 ease-in-out',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      {/* ── Main column ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          title={title}
          userEmail={user?.email ?? null}
          onMenuToggle={() => setMobileSidebarOpen((v) => !v)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
