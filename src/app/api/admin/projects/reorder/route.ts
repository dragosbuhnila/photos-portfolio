import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/admin';
import { updateProjectOrder, getProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    if (!Array.isArray(body.slugs)) {
      return NextResponse.json({ error: 'slugs must be an array of project slugs' }, { status: 400 });
    }

    const requestedSlugs: string[] = body.slugs.map((s: unknown) => String(s));

    updateProjectOrder(requestedSlugs);

    const refreshedProjects = getProjects();
    return NextResponse.json({ success: true, projects: refreshedProjects });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Failed to reorder projects';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
