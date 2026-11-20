'use client';

import React from 'react';
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
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 md:shrink-0 bg-neutral-950 border-b md:border-b-0 md:border-r border-neutral-800 p-6">
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

      <div className="hidden md:block mt-12 pt-6 border-t border-neutral-900">
        <p className="text-[11px] text-neutral-600 leading-relaxed font-mono">
          Changes committed here immediately update <code className="text-neutral-500">content.json</code> and rebuild SQLite collections.
        </p>
      </div>
    </aside>
  );
}
