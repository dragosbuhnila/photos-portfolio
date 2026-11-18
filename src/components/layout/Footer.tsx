import type { OwnerInfo, SocialLink } from '@/types/portfolio';

interface FooterProps {
  owner?: OwnerInfo;
  socialLinks?: SocialLink[];
}

export default function Footer({ owner, socialLinks }: FooterProps) {
  const email = owner?.email ?? 'alex@moreau.photo';
  const name = owner?.name ?? '---';
  const year = owner?.copyright_year ?? '2026';
  const links = socialLinks ?? [
    { label: 'Instagram', url: 'https://instagram.com' },
  ];

  return (
    <footer className="w-full px-8 py-6 flex items-center justify-between border-t border-neutral-800">
      <a
        href={`mailto:${email}`}
        className="text-xs tracking-[0.1em] text-text-muted hover:text-text-bright transition-colors duration-200"
      >
        {email}
      </a>

      <div className="flex items-center gap-6">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-[0.1em] text-text-muted hover:text-text-bright transition-colors duration-200 uppercase"
          >
            {link.label}
          </a>
        ))}
        <span className="text-xs text-neutral-700">
          © {year} {name}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
