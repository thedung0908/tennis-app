import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import { MatchList } from '@/components/match-list';
import { SinglesMatchList } from '@/components/singles-match-list';
import { MatchTypeTabs } from '@/components/match-type-tabs';
import type { Match, SinglesMatch, Member } from '@/types';

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function MatchesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = params.type === 'singles' ? 'singles' : 'doubles';
  const admin = await isAdmin();

  const [doublesRes, singlesRes, membersRes] = await Promise.all([
    supabase.from('matches').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('singles_matches').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('members').select('*').order('name'),
  ]);

  const matches = (doublesRes.data ?? []) as Match[];
  const singlesMatches = (singlesRes.data ?? []) as SinglesMatch[];
  const members = (membersRes.data ?? []) as Member[];
  const memberMap = Object.fromEntries(members.map((m) => [m.id, m.name]));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Trận đấu</h1>
      </div>
      <Suspense>
        <MatchTypeTabs />
      </Suspense>
      {type === 'singles' ? (
        <SinglesMatchList matches={singlesMatches} members={members} memberMap={memberMap} isAdmin={admin} />
      ) : (
        <MatchList matches={matches} members={members} memberMap={memberMap} isAdmin={admin} />
      )}
    </div>
  );
}
