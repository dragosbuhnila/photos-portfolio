'use client';

import { useState, useCallback } from 'react';
import type { OwnerInfo, SocialLink } from '@/types/portfolio';

interface ContactContentProps {
  owner: OwnerInfo;
  socialLinks: SocialLink[];
}

export default function ContactContent({
  owner,
  socialLinks,
}: ContactContentProps) {
  const [copied, setCopied] = useState(false);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(owner.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: clipboard access denied
    }
  }, [owner.email]);

  return (
    <div className="flex-1 flex flex-col items-start justify-center px-8 py-24 max-w-2xl">
      <h1 className="text-text-bright text-sm tracking-[0.3em] uppercase mb-16">Contact</h1>

      {/* Email */}
      <div className="mb-12">
        <p className="text-xs tracking-[0.15em] uppercase text-neutral-600 mb-3">Email</p>
        <button
          onClick={copyEmail}
          className="flex items-center gap-4 group focus:outline-none"
          aria-label="Copy email address"
        >
          <span className="text-text-bright text-lg tracking-wide font-light group-hover:text-white transition-colors">
            {owner.email}
          </span>
          <span
            className={`text-xs tracking-[0.15em] uppercase transition-colors duration-200 ${
              copied ? 'text-text-bright' : 'text-neutral-700 group-hover:text-text-muted'
            }`}
          >
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </div>

      {/* Location */}
      <div className="mb-12">
        <p className="text-xs tracking-[0.15em] uppercase text-neutral-600 mb-3">Location</p>
        <p className="text-text-muted text-sm">{owner.location}</p>
        {owner.available_for_travel && (
          <p className="text-neutral-600 text-xs mt-1">{owner.available_for_travel}</p>
        )}
      </div>

      {/* Socials */}
      {socialLinks.length > 0 && (
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-neutral-600 mb-3">Social</p>
          <div className="flex flex-col gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-muted hover:text-text-bright transition-colors duration-200"
              >
                {link.label}
                {link.handle ? ` — ${link.handle}` : ''}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
