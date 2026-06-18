'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildToken } from '@/lib/auth';

export async function login(_: unknown, formData: FormData) {
  const password = formData.get('password') as string;

  if (!password) return { error: 'Vui lòng nhập mật khẩu' };

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Mật khẩu không đúng' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_session', buildToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  });

  redirect('/ranking');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/ranking');
}
