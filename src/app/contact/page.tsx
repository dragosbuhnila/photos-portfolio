import { getSiteContent } from '@/lib/content';
import ContactContent from '@/components/contact/ContactContent';

export const dynamic = process.env.STATIC_EXPORT === 'true' ? 'auto' : 'force-dynamic';

export default function ContactPage() {
  const content = getSiteContent();

  return (
    <ContactContent
      owner={content.owner}
      socialLinks={content.social_links}
    />
  );
}
