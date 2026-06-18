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
              {grouped[date].map((match) => (
                <div key={match.id} className="border rounded-lg p-3 bg-card">
                  <p className="text-sm">
                    <span className="font-medium">{memberMap[match.team1_p1_id]} + {memberMap[match.team1_p2_id]}</span>
                    <span className="mx-2 font-bold text-base">{match.score1} – {match.score2}</span>
                    <span className="font-medium">{memberMap[match.team2_p1_id]} + {memberMap[match.team2_p2_id]}</span>
                  </p>
                  {isAdmin && (
                    <div className="flex gap-1 mt-2 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href={`/matches/${match.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <MatchDeleteButton matchId={match.id} />
                    </div>
                  )}
                </div>
              ))}
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
