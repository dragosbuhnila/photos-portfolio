import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  AuthError,
  verifyAdminCredentials,
  updateAdminPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json().catch(() => ({}));
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Verify that the current password matches
    const isValidCurrent = verifyAdminCredentials(currentPassword);
    if (!isValidCurrent) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update password in SQLite database (generates fresh salt and scrypt hash, never stores plaintext)
    updateAdminPassword(newPassword);

    // Refresh session cookie
    const token = await createSessionToken();
    const response = NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });

    if (token) {
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
    }

    return response;
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Failed to change password';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
