'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Swords, Wallet, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/ranking', label: 'Xếp hạng', icon: Trophy },
  { href: '/matches', label: 'Trận đấu', icon: Swords },
  { href: '/finance', label: 'Tài chính', icon: Wallet },
  { href: '/members', label: 'Thành viên', icon: Users },
];

export function NavBottom() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
      <div className="max-w-2xl mx-auto flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.5} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
