import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import {
  getProjectImageFiles,
  saveProjectImage,
  deleteProjectImage,
} from '@/lib/admin';
import {
  getProjects,
  addPhoto,
  deletePhoto,
  getProjectFeaturedImagesFromDb,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    const projects = getProjects();
    const project = projects.find((p) => p.slug === slug);
    if (!project) {
      return NextResponse.json({ error: `Project '${slug}' not found` }, { status: 404 });
    }

    const formData = await request.formData();
    const files: File[] = [];

    // Collect all uploaded files from form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && (key === 'files' || key === 'file' || key.startsWith('files['))) {
        files.push(value);
      }
    }

    // Also fallback: grab any File values if none matched key
    if (files.length === 0) {
      for (const value of formData.values()) {
        if (value instanceof File) {
          files.push(value);
        }
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedNames: string[] = [];

    for (const file of files) {
      const originalName = path.basename(file.name);
      const ext = path.extname(originalName).toLowerCase();

      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          {
            error: `File '${originalName}' has invalid extension. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`,
          },
          { status: 400 }
        );
      }

      const baseNameWithoutExt = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_\-\. ]/g, '_');
      const safeName = `${baseNameWithoutExt}${ext}`;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      saveProjectImage(slug, safeName, buffer);

      addPhoto({
        project_slug: slug,
        file_name: safeName,
        title: project.title,
        image_path: `/my_projects/${slug}/${safeName}`,
        is_featured: false,
      });

      uploadedNames.push(safeName);
    }

    const currentImages = getProjectImageFiles(slug);
    const featuredImages = getProjectFeaturedImagesFromDb(slug);

    return NextResponse.json({
      success: true,
      uploaded: uploadedNames,
      images: currentImages,
      featured_images: featuredImages,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to upload images';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const body = await request.json();
    const fileName = path.basename(String(body.fileName || ''));

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }

    const projects = getProjects();
    const project = projects.find((p) => p.slug === slug);
    if (!project) {
      return NextResponse.json({ error: `Project '${slug}' not found` }, { status: 404 });
    }

    // Delete image from disk
    const deleted = deleteProjectImage(slug, fileName);
    if (!deleted) {
      // Even if file wasn't on disk, also remove from database if it lingered
      deletePhoto(slug, fileName);
    } else {
      deletePhoto(slug, fileName);
    }

    const currentImages = getProjectImageFiles(slug);
    const featuredImages = getProjectFeaturedImagesFromDb(slug);

    return NextResponse.json({
      success: true,
      message: `Image '${fileName}' deleted`,
      images: currentImages,
      featured_images: featuredImages,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
