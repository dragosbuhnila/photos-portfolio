export const SESSION_COOKIE_NAME = 'admin_session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Returns true if the required AUTH_SECRET environment variable is set and non-empty.
 * If false, the application operates in fail-closed mode: no logins or admin sessions are allowed.
 */
export function isAuthEnabled(): boolean {
  const secret = process.env.AUTH_SECRET;
  return typeof secret === 'string' && secret.trim().length > 0;
}

function getSecretBytes(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim().length === 0) {
    return null;
  }
  return new TextEncoder().encode(secret.trim());
}

function toBase64Url(uint8Array: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

/**
 * Generates an HMAC-SHA256 signed session token.
 * Returns null if AUTH_SECRET is not configured.
 */
export async function createSessionToken(sub = 'admin'): Promise<string | null> {
  const secretBytes = getSecretBytes();
  if (!secretBytes) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };

  const payloadStr = JSON.stringify(payload);
  const payloadEncoded = toBase64Url(new TextEncoder().encode(payloadStr));

  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadEncoded) as unknown as BufferSource
  );

  const sigEncoded = toBase64Url(new Uint8Array(sigBuffer));
  return `${payloadEncoded}.${sigEncoded}`;
}

/**
 * Verifies the validity and expiration of an HMAC-SHA256 session token.
 * Returns false if AUTH_SECRET is missing (fail closed), if the token is tampered, or expired.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  const secretBytes = getSecretBytes();
  if (!secretBytes) {
    // Fail-closed: missing or empty AUTH_SECRET means no session can be valid
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadEncoded, sigEncoded] = parts;
  if (!payloadEncoded || !sigEncoded) return false;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes as unknown as BufferSource,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = fromBase64Url(sigEncoded);
    const dataBytes = new TextEncoder().encode(payloadEncoded);

    const isValidSig = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      dataBytes as unknown as BufferSource
    );
    if (!isValidSig) return false;

    const payloadJson = new TextDecoder().decode(fromBase64Url(payloadEncoded));
    const payload = JSON.parse(payloadJson) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return false; // Expired
    }

    return true;
  } catch {
    return false;
  }
}
