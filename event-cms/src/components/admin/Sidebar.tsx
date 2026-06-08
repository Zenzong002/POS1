'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  Images,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  BarChart2,
} from 'lucide-react';

// ─── Nav item type ────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  dividerBefore?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Events', href: '/admin/events', icon: CalendarDays },
  { label: 'Assets', href: '/admin/assets', icon: Images },
  { label: 'Themes', href: '/admin/themes', icon: Palette },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col h-full overflow-hidden shrink-0"
      style={{
        background: 'linear-gradient(180deg, #0f0c29 0%, #1a1a2e 40%, #16213e 100%)',
        borderRight: '1px solid rgba(212,175,55,0.15)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: 'rgba(212,175,55,0.12)' }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
            color: '#1a1a2e',
          }}
        >
          <Sparkles size={18} />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {!collapsed && (
            <motion.span
              key="logo-text"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg tracking-wide whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #F5D060 0%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              EventCraft
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group"
                  style={{
                    background: active
                      ? 'linear-gradient(90deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 100%)'
                      : 'transparent',
                    color: active ? '#F5D060' : 'rgba(255,255,255,0.55)',
                    borderLeft: active ? '2px solid #D4AF37' : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                    }
                  }}
                >
                  <Icon
                    size={18}
                    className="shrink-0 transition-colors"
                    style={{ color: active ? '#D4AF37' : undefined }}
                  />
                  <AnimatePresence mode="wait" initial={false}>
                    {!collapsed && (
                      <motion.span
                        key={`label-${href}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18 }}
                        className="whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div
        className="px-2 py-4 border-t"
        style={{ borderColor: 'rgba(212,175,55,0.12)' }}
      >
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full rounded-lg py-2 transition-all duration-200"
          style={{ color: 'rgba(212,175,55,0.6)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
            e.currentTarget.style.color = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(212,175,55,0.6)';
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}
