import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  AuthError,
  getProjectImageFiles,
  deleteProjectDir,
} from '@/lib/admin';
import { updateProject, deleteProject, getProjects } from '@/lib/db';
import { isNonEmpty, FieldError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth();
    const { slug } = params;
    const body = await request.json();

    const projects = getProjects();
    const project = projects.find((p) => p.slug === slug);
    if (!project) {
      return NextResponse.json({ error: `Project '${slug}' not found` }, { status: 404 });
    }

    const errors: FieldError[] = [];
    let updatedTitle: string | undefined;
    let updatedFeatured: string[] | undefined;

    if (body.title !== undefined) {
      const trimmedTitle = String(body.title).trim();
      if (!isNonEmpty(trimmedTitle)) {
        errors.push({ field: 'title', message: 'Title is required' });
      } else {
        updatedTitle = trimmedTitle;
      }
    }

    if (body.featured_images !== undefined) {
      if (!Array.isArray(body.featured_images)) {
        errors.push({ field: 'featured_images', message: 'Featured images must be an array' });
      } else {
        const diskImages = new Set(getProjectImageFiles(slug));
        const validImages = body.featured_images
          .map((img: unknown) => String(img))
          .filter((img: string) => diskImages.has(img));

        // Deduplicate
        updatedFeatured = Array.from(new Set(validImages));
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }

    updateProject(slug, {
      title: updatedTitle,
      featured_images: updatedFeatured,
    });

    const currentImages = getProjectImageFiles(slug);
    const refreshedProject = getProjects().find((p) => p.slug === slug);

    return NextResponse.json({
      success: true,
      project: {
        ...(refreshedProject || project),
        title: updatedTitle ?? project.title,
        featured_images: updatedFeatured ?? project.featured_images,
        images: currentImages,
      },
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Failed to update project';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth();
    const { slug } = params;

    const projects = getProjects();
    const exists = projects.some((p) => p.slug === slug);
    if (!exists) {
      return NextResponse.json({ error: `Project '${slug}' not found` }, { status: 404 });
    }

    // Delete folder on disk
    deleteProjectDir(slug);

    // Delete from SQLite
    deleteProject(slug);

    return NextResponse.json({ success: true, message: `Project ${slug} deleted` });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Failed to delete project';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
