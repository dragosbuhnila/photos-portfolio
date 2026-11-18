import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getSiteContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const content = getSiteContent();
  return {
    title: `${content.owner.name} — Photography Portfolio`,
    description: `Photography portfolio of ${content.owner.name} — editorial, documentary, and fine art.`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = getSiteContent();

  return (
    <html lang="en">
      <body className="bg-canvas text-text-muted antialiased min-h-screen flex flex-col">
        <Header ownerName={content.owner.name} navLinks={content.nav_links} />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer owner={content.owner} socialLinks={content.social_links} />
      </body>
    </html>
  );
}
