'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus } from 'lucide-react';
import type { SinglesMatch, Member } from '@/types';
import { formatDateWithDay } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { SinglesMatchDeleteButton } from '@/components/singles-match-delete-button';
import { SinglesMatchForm } from '@/components/singles-match-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SinglesMatchListProps {
  matches: SinglesMatch[];
  members: Member[];
  memberMap: Record<string, string>;
  isAdmin: boolean;
}

export function SinglesMatchList({ matches, members, memberMap, isAdmin }: SinglesMatchListProps) {
  const [addOpen, setAddOpen] = useState(false);

  const grouped = matches.reduce<Record<string, SinglesMatch[]>>((acc, m) => {
    (acc[m.date] ??= []).push(m);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <>
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm trận
          </Button>
        </div>
      )}

      {dates.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">Chưa có trận đấu nào</p>
      )}

      <div className="space-y-4">
        {dates.map((date) => (
          <div key={date}>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {formatDateWithDay(date)}
            </p>
            <div className="space-y-2">
              {grouped[date].map((match, i) => {
                const draw = match.score1 === match.score2;
                const p1win = match.score1 > match.score2;
                const p1Bg = draw ? 'bg-slate-50' : p1win ? 'bg-green-50' : 'bg-rose-50';
                const p2Bg = draw ? 'bg-slate-50' : p1win ? 'bg-rose-50' : 'bg-green-50';
                const p1Score = draw ? 'text-slate-500' : p1win ? 'text-green-700' : 'text-rose-600';
                const p2Score = draw ? 'text-slate-500' : p1win ? 'text-rose-600' : 'text-green-700';
                return (
                  <div key={match.id} className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-card border-b">
                      <span className="text-xs font-semibold text-muted-foreground">Trận {i + 1}</span>
                      {draw && (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">HÒA</span>
                      )}
                    </div>
                    <div className={`flex items-center justify-between px-3 py-2 ${p1Bg}`}>
                      <span className="font-medium text-sm">{memberMap[match.player1_id]}</span>
                      <span className={`font-bold text-base ml-3 tabular-nums ${p1Score}`}>{match.score1}</span>
                    </div>
                    <div className={`flex items-center justify-between px-3 py-2 border-t ${p2Bg}`}>
                      <span className="font-medium text-sm">{memberMap[match.player2_id]}</span>
                      <span className={`font-bold text-base ml-3 tabular-nums ${p2Score}`}>{match.score2}</span>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 px-2 py-1 justify-end border-t bg-card">
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <Link href={`/singles/${match.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <SinglesMatchDeleteButton matchId={match.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Thêm trận đơn</DialogTitle>
          </DialogHeader>
          <SinglesMatchForm members={members} onSuccess={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
