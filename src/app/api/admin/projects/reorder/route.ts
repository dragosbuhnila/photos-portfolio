import { NextRequest, NextResponse } from 'next/server';
import { updateProjectOrder, getProjects } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.slugs)) {
      return NextResponse.json({ error: 'slugs must be an array of project slugs' }, { status: 400 });
    }

    const requestedSlugs: string[] = body.slugs.map((s: unknown) => String(s));

    updateProjectOrder(requestedSlugs);

    const refreshedProjects = getProjects();
    return NextResponse.json({ success: true, projects: refreshedProjects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reorder projects';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
