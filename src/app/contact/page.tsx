import { getSiteContent } from '@/lib/content';
import ContactContent from '@/components/contact/ContactContent';



export default function ContactPage() {
  const content = getSiteContent();

  return (
    <ContactContent
      owner={content.owner}
      socialLinks={content.social_links}
    />
  );
}
