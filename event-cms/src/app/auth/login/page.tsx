'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { signInWithEmail } from '@/lib/firebase/auth';

// ─── Animation variants ───────────────────────────────────────────────────────

const EASE_LUXURY = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_LUXURY },
  },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.25 + i * 0.1, duration: 0.45, ease: 'easeOut' as const },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFirebaseError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Sign-in failed. Please try again.';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email.trim(), password);
      router.push('/admin');
    } catch (err: unknown) {
      const code =
        err &&
        typeof err === 'object' &&
        'code' in err &&
        typeof (err as { code: unknown }).code === 'string'
          ? (err as { code: string }).code
          : '';
      setError(parseFirebaseError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl p-8 shadow-2xl"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(212,175,55,0.2)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #F5D060 0%, #D4AF37 60%, #a87d20 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome Back
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Sign in to your EventCraft admin panel
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-lg px-4 py-3 mb-6 text-sm"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
        >
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'rgba(212,175,55,0.8)' }}
          >
            Email Address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              size={16}
              style={{ color: 'rgba(212,175,55,0.5)' }}
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(212,175,55,0.2)',
                color: '#fff',
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid rgba(212,175,55,0.6)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(212,175,55,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'rgba(212,175,55,0.8)' }}
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              size={16}
              style={{ color: 'rgba(212,175,55,0.5)' }}
            />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg pl-10 pr-10 py-3 text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(212,175,55,0.2)',
                color: '#fff',
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid rgba(212,175,55,0.6)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(212,175,55,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'rgba(212,175,55,0.5)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#D4AF37')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(212,175,55,0.5)')}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
          <button
            type="submit"
            disabled={loading}
            className="relative w-full rounded-lg py-3 text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 overflow-hidden"
            style={{
              background: loading
                ? 'rgba(212,175,55,0.4)'
                : 'linear-gradient(135deg, #D4AF37 0%, #F5D060 50%, #D4AF37 100%)',
              color: '#1a1a2e',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </motion.div>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        EventCraft Admin &mdash; Authorized access only
      </p>
    </motion.div>
  );
}
