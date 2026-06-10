import crypto from 'crypto';

import bcrypt from 'bcryptjs';

const PASSWORD_CHARS =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

/** Generates a random password suitable for one-time display to admins. */
export function generateRandomPassword(length = 10): string {
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += PASSWORD_CHARS[bytes[i]! % PASSWORD_CHARS.length];
  }
  return password;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
