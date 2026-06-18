'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Period } from '@/types';
import { getAvailableYears } from '@/lib/periods';

interface PeriodSelectorProps {
  period: Period;
}

export function PeriodSelector({ period }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function push(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => params.set(k, v));
    router.push(`${pathname}?${params.toString()}`);
  }

  const isMonth = period.type === 'month';
  const years = getAvailableYears();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex rounded-md border overflow-hidden">
        <Button
          variant={isMonth ? 'default' : 'ghost'}
          size="sm"
          className="rounded-none h-8 px-3"
          onClick={() =>
            push({ type: 'month', month: String(new Date().getMonth() + 1), year: String(period.year) })
          }
        >
          Tháng
        </Button>
        <Button
          variant={!isMonth ? 'default' : 'ghost'}
          size="sm"
          className="rounded-none h-8 px-3"
          onClick={() =>
            push({ type: 'quarter', quarter: String(Math.ceil((new Date().getMonth() + 1) / 3)), year: String(period.year) })
          }
        >
          Quý
        </Button>
      </div>

      <Select
        value={String(period.year)}
        onValueChange={(v) => push({ year: v })}
      >
        <SelectTrigger className="h-8 w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isMonth ? (
        <Select
          value={String((period as Extract<Period, { type: 'month' }>).month)}
          onValueChange={(v) => push({ month: v })}
        >
          <SelectTrigger className="h-8 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <SelectItem key={m} value={String(m)}>
                Tháng {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Select
          value={String((period as Extract<Period, { type: 'quarter' }>).quarter)}
          onValueChange={(v) => push({ quarter: v })}
        >
          <SelectTrigger className="h-8 w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((q) => (
              <SelectItem key={q} value={String(q)}>
                Quý {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
