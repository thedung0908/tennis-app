import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SinglesMatchForm } from '@/components/singles-match-form';
import type { SinglesMatch, Member } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSinglesMatchPage({ params }: PageProps) {
  const { id } = await params;

  const [matchRes, membersRes] = await Promise.all([
    supabase.from('singles_matches').select('*').eq('id', id).single(),
    supabase.from('members').select('*').order('name'),
  ]);

  if (!matchRes.data) notFound();

  const match = matchRes.data as SinglesMatch;
  const members = (membersRes.data ?? []) as Member[];

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-6">Sửa trận đơn</h1>
      <SinglesMatchForm members={members} defaultValues={match} />
    </div>
  );
}
