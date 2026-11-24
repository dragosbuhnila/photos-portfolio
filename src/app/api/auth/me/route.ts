import { NextResponse } from 'next/server';
import { checkServerAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authenticated = await checkServerAuth();
  return NextResponse.json({ authenticated });
}
