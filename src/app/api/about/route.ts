import { NextResponse } from 'next/server';
import { getResumeEntries } from '@/lib/db';

export const dynamic = 'force-dynamic';

export function GET() {
  const entries = getResumeEntries();
  return NextResponse.json(entries);
}
