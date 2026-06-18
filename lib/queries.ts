import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { Match, SinglesMatch, Member } from '@/types';

// Tags dùng để invalidate cache theo nhóm dữ liệu
export const TAGS = {
  members: 'members',
  matches: 'matches',
  singles: 'singles-matches',
} as const;

export const getCachedMembers = unstable_cache(
  async (): Promise<Member[]> => {
    const { data } = await supabase.from('members').select('*').order('name');
    return (data ?? []) as Member[];
  },
  ['members'],
  { tags: [TAGS.members] }
);

export const getCachedAllMatches = unstable_cache(
  async (): Promise<Match[]> => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    return (data ?? []) as Match[];
  },
  ['all-matches'],
  { tags: [TAGS.matches] }
);

export const getCachedAllSingles = unstable_cache(
  async (): Promise<SinglesMatch[]> => {
    const { data } = await supabase
      .from('singles_matches')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    return (data ?? []) as SinglesMatch[];
  },
  ['all-singles'],
  { tags: [TAGS.singles] }
);

export const getCachedMatchesByPeriod = unstable_cache(
  async (start: string, end: string): Promise<Match[]> => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date');
    return (data ?? []) as Match[];
  },
  ['matches-by-period'],
  { tags: [TAGS.matches] }
);

export const getCachedSinglesByPeriod = unstable_cache(
  async (start: string, end: string): Promise<SinglesMatch[]> => {
    const { data } = await supabase
      .from('singles_matches')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date');
    return (data ?? []) as SinglesMatch[];
  },
  ['singles-by-period'],
  { tags: [TAGS.singles] }
);

// Dùng cho members page: chỉ lấy các cột cần để đếm số trận
export const getCachedMatchPlayerIds = unstable_cache(
  async (): Promise<{ team1_p1_id: string; team1_p2_id: string; team2_p1_id: string; team2_p2_id: string }[]> => {
    const { data } = await supabase
      .from('matches')
      .select('team1_p1_id,team1_p2_id,team2_p1_id,team2_p2_id');
    return (data ?? []) as { team1_p1_id: string; team1_p2_id: string; team2_p1_id: string; team2_p2_id: string }[];
  },
  ['match-player-ids'],
  { tags: [TAGS.matches] }
);

export const getCachedSinglesPlayerIds = unstable_cache(
  async (): Promise<{ player1_id: string; player2_id: string }[]> => {
    const { data } = await supabase.from('singles_matches').select('player1_id,player2_id');
    return (data ?? []) as { player1_id: string; player2_id: string }[];
  },
  ['singles-player-ids'],
  { tags: [TAGS.singles] }
);
