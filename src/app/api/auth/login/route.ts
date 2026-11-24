import { NextRequest, NextResponse } from 'next/server';
import {
  isAuthEnabled,
  verifyAdminCredentials,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Fail-closed check: if AUTH_SECRET is not set, refuse all logins
    if (!isAuthEnabled()) {
      return NextResponse.json(
        { error: 'Authentication is disabled or not configured on this instance' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === 'string' ? body.password : '';

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const isValid = verifyAdminCredentials(password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = await createSessionToken();
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication failed due to server configuration' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
