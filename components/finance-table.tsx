'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { FinanceRow } from '@/types';
import { formatMoney, formatShortDateWithDay } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
];

interface FinanceTableProps {
  rows: FinanceRow[];
}

export function FinanceTable({ rows }: FinanceTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const total = rows.reduce((s, r) => s + r.total_money, 0);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (rows.length === 0) {
    return <p className="text-center text-muted-foreground py-12 text-sm">Chưa có dữ liệu trong kỳ này</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <p className="font-medium text-foreground">Công thức tính tiền nộp quỹ</p>
          <p>Đội <span className="font-medium text-green-700">thắng</span>: 0đ &nbsp;·&nbsp; Đội <span className="font-medium text-destructive">thua</span>: (hiệu số game) × 10.000đ / người</p>
          <p>Trận <span className="font-medium">hòa 5-5</span>: tất cả 4 người nộp 10.000đ / người</p>
        </div>
      </div>

      <div className="space-y-1">
        {rows.map((row, i) => {
          const isOpen = expanded.has(row.id);
          const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const initial = row.name.trim().charAt(0).toUpperCase();
          return (
            <div key={row.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggle(row.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3',
                  'hover:bg-muted/50 transition-colors'
                )}
              >
                <span className="text-xs text-muted-foreground w-4 shrink-0 text-right select-none">{i + 1}</span>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor}`}>
                  {initial}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-sm leading-tight">{row.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{row.details.length} trận</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('font-bold text-sm', row.total_money > 0 ? 'text-destructive' : 'text-muted-foreground')}>
                    {formatMoney(row.total_money)}
                  </span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {isOpen && (
                <div className="border-t bg-muted/30 divide-y">
                  {row.details.map((d) => (
                    <div key={d.matchId} className="flex items-center justify-between px-4 py-2 text-xs">
                      <span className="text-muted-foreground mr-2 shrink-0">{formatShortDateWithDay(d.date)}</span>
                      <span className="flex-1 text-left truncate">{d.description}</span>
                      <span className={cn('font-medium ml-2 shrink-0', d.moneyOwed > 0 ? 'text-destructive' : 'text-muted-foreground')}>
                        {formatMoney(d.moneyOwed)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="flex justify-between items-center px-4 py-3 font-bold text-sm border-t mt-2">
          <span>Tổng quỹ</span>
          <span>{formatMoney(total)}</span>
        </div>
      </div>
    </div>
  );
}
