import type { ReactNode } from 'react';

export const metadata = {
  title: 'EventCraft — Admin',
  description: 'Sign in to the EventCraft admin panel',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)' }}
    >
      {/* Decorative blurred circles */}
      <div
        className="absolute top-[-10rem] left-[-10rem] w-[40rem] h-[40rem] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-10rem] right-[-10rem] w-[40rem] h-[40rem] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
      />

      {/* Brand mark at top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D060)', color: '#1a1a2e' }}
        >
          E
        </div>
        <span className="text-white font-semibold tracking-wide text-lg">EventCraft</span>
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
