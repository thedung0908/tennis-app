import { Suspense } from 'react';
import { isAdmin } from '@/lib/auth';
import { getCachedAllMatches, getCachedAllSingles, getCachedMembers } from '@/lib/queries';
import { MatchList } from '@/components/match-list';
import { SinglesMatchList } from '@/components/singles-match-list';
import { MatchTypeTabs } from '@/components/match-type-tabs';

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function MatchesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = params.type === 'singles' ? 'singles' : 'doubles';
  const admin = await isAdmin();

  const [matches, singlesMatches, members] = await Promise.all([
    getCachedAllMatches(),
    getCachedAllSingles(),
    getCachedMembers(),
  ]);

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
