import { isAdmin } from '@/lib/auth';
import { getCachedMembers, getCachedMatchPlayerIds, getCachedSinglesPlayerIds } from '@/lib/queries';
import { MemberList } from '@/components/member-list';
import { MemberForm } from '@/components/member-form';

export default async function MembersPage() {
  const admin = await isAdmin();

  const [members, doublesIds, singlesIds] = await Promise.all([
    getCachedMembers(),
    getCachedMatchPlayerIds(),
    getCachedSinglesPlayerIds(),
  ]);

  // Đếm số trận mỗi thành viên tham gia (cả đôi lẫn đơn) — tính client-side thay vì N query
  const matchCountMap: Record<string, number> = {};
  for (const m of doublesIds) {
    for (const id of [m.team1_p1_id, m.team1_p2_id, m.team2_p1_id, m.team2_p2_id]) {
      matchCountMap[id] = (matchCountMap[id] ?? 0) + 1;
    }
  }
  for (const m of singlesIds) {
    for (const id of [m.player1_id, m.player2_id]) {
      matchCountMap[id] = (matchCountMap[id] ?? 0) + 1;
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
