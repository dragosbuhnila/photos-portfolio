import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin';
import { getSiteContent, updateSiteContent } from '@/lib/db';
import {
  validateOwner,
  validateSocialLink,
  validateResumeEntry,
  FieldError,
} from '@/lib/validation';
import type { ResumeEntry, SocialLink, OwnerInfo } from '@/types/portfolio';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    requireAuth();
    const content = getSiteContent();
    return NextResponse.json(content);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to read content';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    requireAuth();
    const body = await request.json();

    const errors: FieldError[] = [];

    // 1. Validate Owner if provided
    if (body.owner !== undefined) {
      const ownerErrors = validateOwner(body.owner);
      errors.push(...ownerErrors);

      if (body.owner.bio !== undefined && !Array.isArray(body.owner.bio)) {
        errors.push({ field: 'bio', message: 'Bio must be an array of paragraphs' });
      }
    }

    // 2. Validate Social Links if provided
    if (body.social_links !== undefined) {
      if (!Array.isArray(body.social_links)) {
        errors.push({ field: 'social_links', message: 'Social links must be an array' });
      } else {
        body.social_links.forEach((link: Record<string, unknown>, idx: number) => {
          const linkErrors = validateSocialLink(link);
          linkErrors.forEach((e) => {
            errors.push({ field: `social_links[${idx}].${e.field}`, message: e.message });
          });
        });
      }
    }

    // 3. Validate Resume if provided
    if (body.resume !== undefined) {
      if (!Array.isArray(body.resume)) {
        errors.push({ field: 'resume', message: 'Resume must be an array' });
      } else {
        body.resume.forEach((entry: Record<string, unknown>, idx: number) => {
          const entryErrors = validateResumeEntry(entry);
          entryErrors.forEach((e) => {
            errors.push({ field: `resume[${idx}].${e.field}`, message: e.message });
          });
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }

    // Sanitize updates
    let updatedOwner: Partial<OwnerInfo> | undefined;
    if (body.owner !== undefined) {
      updatedOwner = {
        name: String(body.owner.name).trim(),
        email: String(body.owner.email || '').trim(),
        location: String(body.owner.location || '').trim(),
        available_for_travel: String(body.owner.available_for_travel || '').trim(),
        copyright_year: String(body.owner.copyright_year || '').trim(),
        bio: Array.isArray(body.owner.bio)
          ? body.owner.bio.map((p: unknown) => String(p).trim()).filter(Boolean)
          : undefined,
      };
    }

    let updatedSocial: SocialLink[] | undefined;
    if (body.social_links !== undefined) {
      updatedSocial = body.social_links.map((link: SocialLink) => ({
        label: String(link.label).trim(),
        handle: link.handle ? String(link.handle).trim() : undefined,
        url: String(link.url || '').trim(),
      }));
    }

    let updatedResume: ResumeEntry[] | undefined;
    if (body.resume !== undefined) {
      const counters: Record<string, number> = {};
      updatedResume = body.resume.map((entry: ResumeEntry) => {
        const sec = String(entry.section).trim();
        counters[sec] = (counters[sec] || 0) + 1;
        return {
          section: sec,
          title: String(entry.title).trim(),
          organization: String(entry.organization).trim(),
          period: String(entry.period).trim(),
          display_order: counters[sec],
        };
      });
    }

    updateSiteContent({
      owner: updatedOwner,
      social_links: updatedSocial,
      resume: updatedResume,
    });

    const refreshedContent = getSiteContent();
    return NextResponse.json({ success: true, content: refreshedContent });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update content';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
