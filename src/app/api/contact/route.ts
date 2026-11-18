import { NextResponse } from 'next/server';
import { getSiteContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export function GET() {
  const content = getSiteContent();

  return NextResponse.json({
    name: content.owner.name,
    email: content.owner.email,
    location: content.owner.location,
    available_for_travel: content.owner.available_for_travel,
    social: content.social_links,
  });
}
