import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MatchForm } from '@/components/match-form';
import type { Match, Member } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMatchPage({ params }: PageProps) {
  const { id } = await params;

  const [matchRes, membersRes] = await Promise.all([
    supabase.from('matches').select('*').eq('id', id).single(),
    supabase.from('members').select('*').order('name'),
  ]);

  if (!matchRes.data) notFound();

  const match = matchRes.data as Match;
  const members = (membersRes.data ?? []) as Member[];

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-6">Sửa trận đấu</h1>
      <MatchForm members={members} defaultValues={match} />
    </div>
  );
}
