import { cookies } from 'next/headers';
import { createHash } from 'crypto';

function buildToken(): string {
  return createHash('sha256')
    .update(process.env.ADMIN_PASSWORD! + process.env.SESSION_SECRET!)
    .digest('hex');
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return false;
  return token === buildToken();
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error('Unauthorized');
}

export { buildToken };
