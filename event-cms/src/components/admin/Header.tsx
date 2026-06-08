'use client';

import { useState } from 'react';
import { LogOut, Menu, User, ChevronDown } from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  /** Page title displayed in the header. */
  title: string;
  /** Firebase user email. */
  userEmail: string | null;
  /** Called when the mobile hamburger button is tapped. */
  onMenuToggle: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header({ title, userEmail, onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push('/auth/login');
    } catch {
      setSigningOut(false);
    }
  }

  // Derive display name from email (part before @)
  const displayName = userEmail ? userEmail.split('@')[0] : 'Admin';

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 h-16 shrink-0 z-20"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Left: mobile menu + page title */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
          style={{ color: '#6b7280' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
            e.currentTarget.style.color = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <h1 className="text-lg font-semibold text-gray-800 tracking-tight">{title}</h1>
      </div>

      {/* Right: user info + logout */}
      <div className="relative flex items-center gap-2">
        {/* User dropdown trigger */}
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200"
          style={{ color: '#374151' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(212,175,55,0.06)';
          }}
          onMouseLeave={(e) => {
            if (!userMenuOpen) e.currentTarget.style.background = 'transparent';
          }}
        >
          {/* Avatar circle */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
              color: '#1a1a2e',
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          {/* Email — hidden on small screens */}
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[160px] truncate">
            {userEmail ?? 'Admin'}
          </span>

          <ChevronDown
            size={14}
            className="text-gray-400 transition-transform duration-200"
            style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {/* Dropdown menu */}
        {userMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setUserMenuOpen(false)}
            />

            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl z-20 overflow-hidden"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              }}
            >
              {/* User info */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: 'rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
                      color: '#1a1a2e',
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 truncate capitalize">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Profile option (placeholder) */}
              <div className="p-1">
                <button
                  className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors"
                  style={{ cursor: 'default' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(212,175,55,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <User size={15} className="text-gray-400" />
                  Profile
                </button>

                <div className="my-1" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-60"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <LogOut size={15} />
                  {signingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
