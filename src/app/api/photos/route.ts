import { NextResponse } from 'next/server';
import { getFeaturedPhotos, getAllPhotos } from '@/lib/db';



export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured');

  const photos = featured === '1' ? getFeaturedPhotos() : getAllPhotos();
  return NextResponse.json(photos);
}
