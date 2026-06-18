import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware chỉ kiểm tra cookie tồn tại — token verification thực sự
// xảy ra trong Server Action (requireAdmin) khi user thực sự thao tác ghi.
export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/matches/:id/edit'],
};
