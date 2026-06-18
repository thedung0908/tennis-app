'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MatchTypeTabs() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentType = searchParams.get('type') ?? 'doubles';

  const buildHref = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'doubles') params.delete('type');
    else params.set('type', type);
    const str = params.toString();
    return str ? `${pathname}?${str}` : pathname;
  };

  return (
    <div className="flex border-b mb-4">
      {[
        { value: 'doubles', label: 'Đánh đôi' },
        { value: 'singles', label: 'Đánh đơn' },
      ].map(({ value, label }) => (
        <Link
          key={value}
          href={buildHref(value)}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            currentType === value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
