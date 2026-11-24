import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getDb } from './db';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  isAuthEnabled,
  createSessionToken,
  verifySessionToken,
} from './auth-token';

export {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  isAuthEnabled,
  createSessionToken,
  verifySessionToken,
};

export class AuthError extends Error {
  statusCode: number;
  constructor(message = 'Unauthorized: Authentication required') {
    super(message);
    this.name = 'AuthError';
    this.statusCode = 401;
  }
}

export interface AdminAuthRecord {
  id: number;
  salt: string;
  password_hash: string;
  updated_at: string;
}

/**
 * Creates a cryptographically random salt and scrypt hash for a plaintext password.
 * The plaintext password is never persisted.
 */
export function hashPassword(password: string, customSalt?: string): { salt: string; hash: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

/**
 * Validates a plaintext password against a stored salt and hash using timing-safe comparison.
 */
export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  if (!password || !salt || !expectedHash) return false;
  try {
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const expectedBuf = Buffer.from(expectedHash, 'hex');
    const computedBuf = Buffer.from(computedHash, 'hex');
    if (expectedBuf.length !== computedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, computedBuf);
  } catch {
    return false;
  }
}

/**
 * Retrieves the current admin credentials record from the database.
 * If no record exists, seeds the initial hash with the default password ("password").
 */
export function getAdminAuthRecord(): AdminAuthRecord {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_auth (
      id            INTEGER PRIMARY KEY CHECK (id = 1),
      salt          TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const row = db.prepare('SELECT * FROM admin_auth WHERE id = 1').get() as AdminAuthRecord | undefined;
  if (!row) {
    const { salt, hash } = hashPassword('password');
    db.prepare(`
      INSERT INTO admin_auth (id, salt, password_hash)
      VALUES (1, ?, ?)
    `).run(salt, hash);

    return db.prepare('SELECT * FROM admin_auth WHERE id = 1').get() as AdminAuthRecord;
  }

  return row;
}

/**
 * Updates the admin credentials in the database with a freshly computed salt and hash.
 */
export function updateAdminPassword(newPassword: string): void {
  const { salt, hash } = hashPassword(newPassword);
  const db = getDb();
  db.prepare(`
    INSERT INTO admin_auth (id, salt, password_hash, updated_at)
    VALUES (1, @salt, @hash, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      salt = excluded.salt,
      password_hash = excluded.password_hash,
      updated_at = CURRENT_TIMESTAMP
  `).run({ salt, hash });
}

/**
 * Verifies submitted password against the stored credentials.
 * If ADMIN_PASSWORD is set in environment variables, it also accepts that override.
 */
export function verifyAdminCredentials(password: string): boolean {
  if (!password) return false;

  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword && envPassword.trim().length > 0) {
    if (password === envPassword) return true;
  }

  const record = getAdminAuthRecord();
  return verifyPassword(password, record.salt, record.password_hash);
}

/**
 * Checks if the incoming request has a valid administrative session cookie.
 */
export async function checkServerAuth(): Promise<boolean> {
  if (!isAuthEnabled()) return false;
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return token ? await verifySessionToken(token) : false;
  } catch {
    return false;
  }
}

/**
 * Throws AuthError if the request does not carry a valid authenticated session.
 */
export async function requireAuth(): Promise<void> {
  const isAuthed = await checkServerAuth();
  if (!isAuthed) {
    throw new AuthError('Unauthorized: Authentication required');
  }
}
