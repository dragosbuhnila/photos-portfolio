import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PROJECTS_DIR = path.join(process.cwd(), 'public', 'my_projects');

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

interface RouteParams {
  params: {
    path?: string[];
  };
}

function resolveFilePath(params: RouteParams['params']): string | null {
  if (!params.path || params.path.length === 0) {
    return null;
  }

  const decodedSegments = params.path.map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });

  const resolved = path.resolve(PROJECTS_DIR, ...decodedSegments);

  // Security guardrail: prevent directory traversal
  const normalizedProjectsDir = path.normalize(PROJECTS_DIR) + path.sep;
  const normalizedResolved = path.normalize(resolved);

  if (normalizedResolved !== path.normalize(PROJECTS_DIR) && !normalizedResolved.startsWith(normalizedProjectsDir)) {
    return null;
  }

  return normalizedResolved;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const filePath = resolveFilePath(params);
    if (!filePath || !fs.existsSync(filePath)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function HEAD(request: NextRequest, { params }: RouteParams) {
  try {
    const filePath = resolveFilePath(params);
    if (!filePath || !fs.existsSync(filePath)) {
      return new NextResponse(null, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return new NextResponse(null, { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
