import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavBottom } from '@/components/nav-bottom';
import { TennisBallIcon } from '@/components/tennis-ball-icon';
import { Toaster } from '@/components/ui/sonner';
import { isAdmin } from '@/lib/auth';
import { logout } from '@/actions/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CLB Tennis 123',
  description: 'Quản lý CLB Tennis 123',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();

  return (
    <html lang="vi">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
          <header className="sticky top-0 z-40 bg-background border-b px-4 h-14 flex items-center justify-between shrink-0">
            <span className="font-bold text-lg flex items-center gap-1.5">
              <TennisBallIcon className="h-5 w-5" />
              CLB Tennis 123
            </span>
            {admin ? (
              <form action={logout}>
                <button
                  type="submit"
                  className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-medium"
                >
                  Admin · Đăng xuất
                </button>
              </form>
            ) : (
              <a href="/login" className="text-xs text-muted-foreground hover:text-foreground underline">
                Đăng nhập Admin
              </a>
            )}
          </header>
          <main className="flex-1 pb-20 px-4 pt-4">{children}</main>
          <NavBottom />
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
