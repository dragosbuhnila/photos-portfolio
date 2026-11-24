'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') || '/manage';

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Please enter the password');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Hard redirect to ensure server components and header refresh session state
      window.location.href = redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm border border-neutral-800 bg-neutral-950 p-8">
      <div className="mb-8">
        <p className="text-[11px] font-mono tracking-[0.25em] uppercase text-neutral-500">
          Studio Access
        </p>
        <h1 className="text-base tracking-[0.2em] uppercase font-light text-text-bright mt-2">
          Authentication
        </h1>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Enter credentials to manage works, projects, and site metadata.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="password"
            className="block text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-400 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder="••••••••"
            disabled={loading}
            autoFocus
            className="w-full bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-text-bright placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-950/30 border border-red-900/50 text-[11px] text-red-400 font-mono">
            {error}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-200 hover:bg-white text-neutral-950 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-40"
          >
            {loading ? 'Authenticating…' : 'Enter Studio'}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-neutral-900 text-center">
        <Link
          href="/"
          className="text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-500 hover:text-text-bright transition-colors"
        >
          ← Return to Portfolio
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6 bg-canvas">
      <Suspense
        fallback={
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-600 animate-pulse">
            Loading Studio…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
