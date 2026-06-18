import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import { MatchList } from '@/components/match-list';
import type { Match, Member } from '@/types';

export default async function MatchesPage() {
  const admin = await isAdmin();

  const [matchesRes, membersRes] = await Promise.all([
    supabase.from('matches').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('members').select('*').order('name'),
  ]);

  const matches = (matchesRes.data ?? []) as Match[];
  const members = (membersRes.data ?? []) as Member[];
  const memberMap = Object.fromEntries(members.map((m) => [m.id, m.name]));

  return (
    <MatchList
      matches={matches}
      members={members}
      memberMap={memberMap}
      isAdmin={admin}
    />
  );
}
