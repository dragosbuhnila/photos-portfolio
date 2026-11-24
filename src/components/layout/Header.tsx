'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavLink } from '@/types/portfolio';

interface HeaderProps {
  ownerName?: string;
  navLinks?: NavLink[];
  isAuthenticated?: boolean;
}

const DEFAULT_NAV: NavLink[] = [
  { label: 'Index', href: '/' },
  { label: 'Works', href: '/works' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Manage', href: '/manage' },
];

export default function Header({
  ownerName = '---',
  navLinks = DEFAULT_NAV,
  isAuthenticated = false,
}: HeaderProps) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean>(isAuthenticated);

  useEffect(() => {
    setAuthed(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    // Keep auth state synchronized on client route changes
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => {
        if (typeof data.authenticated === 'boolean') {
          setAuthed(data.authenticated);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const visibleLinks = useMemo(() => {
    if (!authed) {
      return navLinks.filter(
        (link) => link.href !== '/manage' && !link.href.startsWith('/manage')
      );
    }

    const hasManage = navLinks.some((link) => link.href === '/manage');
    if (!hasManage) {
      return [...navLinks, { label: 'Manage', href: '/manage' }];
    }
    return navLinks;
  }, [navLinks, authed]);

  return (
    <header className="sticky top-0 z-50 w-full px-8 py-5 flex items-center justify-between bg-canvas">
      <Link
        href="/"
        className="text-text-bright text-sm tracking-[0.2em] uppercase font-light hover:text-white transition-colors duration-200"
      >
        {ownerName}
      </Link>

      <nav className="flex items-center gap-8">
        {visibleLinks.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`text-xs tracking-[0.15em] uppercase transition-colors duration-200 ${
              pathname === href || (href === '/manage' && pathname.startsWith('/manage'))
                ? 'text-text-bright'
                : 'text-text-muted hover:text-text-bright'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
