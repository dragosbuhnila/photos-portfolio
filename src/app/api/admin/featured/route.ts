import { NextRequest, NextResponse } from 'next/server';
import { getFeaturedPhotos, updateFeaturedOrder } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const photos = getFeaturedPhotos();
    return NextResponse.json(photos);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load featured images';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.photoIds)) {
      return NextResponse.json(
        { error: 'photoIds must be an array of photo IDs' },
        { status: 400 }
      );
    }

    const photoIds: number[] = body.photoIds.map((id: unknown) => Number(id));
    if (photoIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      return NextResponse.json(
        { error: 'photoIds must contain valid positive integers' },
        { status: 400 }
      );
    }

    updateFeaturedOrder(photoIds);

    const refreshed = getFeaturedPhotos();
    return NextResponse.json({ success: true, photos: refreshed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reorder featured images';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
