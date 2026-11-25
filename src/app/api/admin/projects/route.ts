import { NextRequest, NextResponse } from 'next/server';
import { getProjectImageFiles, ensureProjectDir } from '@/lib/admin';
import { getAdminProjects, createProject, getProjects } from '@/lib/db';
import { validateProject, toSlug } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = getAdminProjects(getProjectImageFiles);
    return NextResponse.json(projects);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get projects';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rawSlug = body.slug ? String(body.slug).trim() : toSlug(String(body.title || ''));
    const rawTitle = String(body.title || '').trim();

    const existingProjects = getProjects();
    const existingSlugs = existingProjects.map((p) => p.slug);
    const errors = validateProject({ slug: rawSlug, title: rawTitle }, existingSlugs);

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }

    // Create folder on disk
    ensureProjectDir(rawSlug);

    const newProject = createProject(rawSlug, rawTitle);

    return NextResponse.json(
      {
        success: true,
        project: {
          ...newProject,
          images: [],
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
