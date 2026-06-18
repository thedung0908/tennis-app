import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { LoginForm } from '@/components/login-form';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/ranking');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🎾</div>
          <h1 className="text-xl font-bold">Đăng nhập Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Chỉ admin mới có thể nhập kết quả</p>
        </div>
        <LoginForm />
        <p className="text-center">
          <a href="/ranking" className="text-sm text-muted-foreground hover:text-foreground underline">
            ← Xem bảng xếp hạng
          </a>
        </p>
      </div>
    </div>
  );
}
