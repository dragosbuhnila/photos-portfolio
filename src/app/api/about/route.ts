import { NextResponse } from 'next/server';
import { getResumeEntries } from '@/lib/db';



export function GET() {
  const entries = getResumeEntries();
  return NextResponse.json(entries);
}
