import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import { MemberList } from '@/components/member-list';
import { MemberForm } from '@/components/member-form';
import type { Member } from '@/types';

export default async function MembersPage() {
  const admin = await isAdmin();

  const membersRes = await supabase.from('members').select('*').order('name');
  const members = (membersRes.data ?? []) as Member[];

  const memberIds = members.map((m) => m.id);
  const matchCountMap: Record<string, number> = {};

  if (memberIds.length > 0) {
    for (const id of memberIds) {
      const { count } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`team1_p1_id.eq.${id},team1_p2_id.eq.${id},team2_p1_id.eq.${id},team2_p2_id.eq.${id}`);
      matchCountMap[id] = count ?? 0;
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Thành viên ({members.length})</h1>
      {admin && (
        <div className="mb-4">
          <MemberForm />
        </div>
      )}
      <MemberList members={members} memberMatchCount={matchCountMap} isAdmin={admin} />
    </div>
  );
}
