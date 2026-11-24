'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Profile',
    href: '/manage',
    description: 'Owner details & bio',
  },
  {
    label: 'Projects',
    href: '/manage/projects',
    description: 'Galleries, uploads & featured',
  },
  {
    label: 'Resume',
    href: '/manage/resume',
    description: 'Experience, education & exhibitions',
  },
  {
    label: 'Social Links',
    href: '/manage/social',
    description: 'Handles & outbound links',
  },
  {
    label: 'Security',
    href: '/manage/security',
    description: 'Password & access',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <>
      <aside className="w-full md:w-64 md:shrink-0 bg-neutral-950 border-b md:border-b-0 md:border-r border-neutral-800 p-6 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <p className="text-[11px] tracking-[0.25em] uppercase text-neutral-500 font-mono">
              Content Studio
            </p>
            <p className="text-xs text-text-muted mt-1">
              Direct CMS & database sync
            </p>
          </div>

          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {NAV_ITEMS.map(({ label, href, description }) => {
              const isActive =
                href === '/manage' ? pathname === '/manage' : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex flex-col px-3 py-3 border-l-2 transition-all whitespace-nowrap md:whitespace-normal ${
                    isActive
                      ? 'border-text-bright bg-neutral-900/60 text-text-bright'
                      : 'border-transparent text-text-muted hover:text-text-bright hover:bg-neutral-900/30'
                  }`}
                >
                  <span className="text-xs tracking-[0.18em] uppercase font-medium">
                    {label}
                  </span>
                  <span className="hidden md:inline text-[11px] text-neutral-500 group-hover:text-neutral-400 mt-0.5">
                    {description}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-900">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full text-left px-3 py-2 text-xs uppercase tracking-[0.18em] text-neutral-400 hover:text-red-400 transition-colors flex items-center justify-between group"
          >
            <span>Log Out</span>
            <span className="text-neutral-600 group-hover:text-red-400 transition-colors font-mono">
              →
            </span>
          </button>

          <p className="hidden md:block text-[11px] text-neutral-600 leading-relaxed font-mono mt-6">
            Changes committed here immediately update SQLite single source of truth.
          </p>
        </div>
      </aside>

      {/* Confirmation Dialog */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-neutral-950 border border-neutral-800 max-w-sm w-full p-6 text-left">
            <p className="text-[11px] font-mono tracking-[0.25em] uppercase text-neutral-500">
              Studio Access
            </p>
            <h2 className="text-sm font-light tracking-[0.15em] uppercase text-text-bright mt-2 mb-2">
              Confirm Logout
            </h2>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Are you sure you want to log out?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="px-4 py-2 text-xs uppercase tracking-[0.15em] border border-neutral-800 text-neutral-400 hover:text-text-bright hover:border-neutral-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-4 py-2 text-xs uppercase tracking-[0.15em] bg-red-950/40 border border-red-800/60 text-red-300 hover:bg-red-900/60 hover:text-white transition-colors disabled:opacity-50"
              >
                {loggingOut ? 'Logging out…' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
