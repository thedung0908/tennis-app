'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus } from 'lucide-react';
import type { Match, Member } from '@/types';
import { formatDateWithDay } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { MatchDeleteButton } from '@/components/match-delete-button';
import { MatchForm } from '@/components/match-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MatchListProps {
  matches: Match[];
  members: Member[];
  memberMap: Record<string, string>;
  isAdmin: boolean;
}

export function MatchList({ matches, members, memberMap, isAdmin }: MatchListProps) {
  const [addOpen, setAddOpen] = useState(false);

  const grouped = matches.reduce<Record<string, Match[]>>((acc, m) => {
    (acc[m.date] ??= []).push(m);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Trận đấu</h1>
        {isAdmin && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm trận
          </Button>
        )}
      </div>

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
                const t1win = match.score1 > match.score2;
                const team1Bg = draw ? 'bg-slate-50' : t1win ? 'bg-green-50' : 'bg-rose-50';
                const team2Bg = draw ? 'bg-slate-50' : t1win ? 'bg-rose-50' : 'bg-green-50';
                const team1Score = draw ? 'text-slate-500' : t1win ? 'text-green-700' : 'text-rose-600';
                const team2Score = draw ? 'text-slate-500' : t1win ? 'text-rose-600' : 'text-green-700';
                return (
                  <div key={match.id} className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-card border-b">
                      <span className="text-xs font-semibold text-muted-foreground">Trận {i + 1}</span>
                      {draw && (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          HÒA
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center justify-between px-3 py-2 ${team1Bg}`}>
                      <span className="font-medium text-sm">
                        {memberMap[match.team1_p1_id]} + {memberMap[match.team1_p2_id]}
                      </span>
                      <span className={`font-bold text-base ml-3 tabular-nums ${team1Score}`}>
                        {match.score1}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between px-3 py-2 border-t ${team2Bg}`}>
                      <span className="font-medium text-sm">
                        {memberMap[match.team2_p1_id]} + {memberMap[match.team2_p2_id]}
                      </span>
                      <span className={`font-bold text-base ml-3 tabular-nums ${team2Score}`}>
                        {match.score2}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 px-2 py-1 justify-end border-t bg-card">
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <Link href={`/matches/${match.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <MatchDeleteButton matchId={match.id} />
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
            <DialogTitle>Thêm trận mới</DialogTitle>
          </DialogHeader>
          <MatchForm members={members} onSuccess={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
