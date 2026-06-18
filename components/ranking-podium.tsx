import type { RankingRow } from '@/types';

interface RankingPodiumProps {
  top2: RankingRow[];
}

export function RankingPodium({ top2 }: RankingPodiumProps) {
  if (top2.length === 0) return null;

  const [first, second] = top2;

  return (
    <div className="flex gap-3 mb-4">
      {first && (
        <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <div className="text-3xl">🥇</div>
          <div className="font-bold text-base mt-1">{first.name}</div>
          <div className="text-sm text-muted-foreground">TB: {first.avg_points}</div>
          <div className="text-xs text-muted-foreground">{first.matches_played} trận</div>
        </div>
      )}
      {second && (
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <div className="text-3xl">🥈</div>
          <div className="font-bold text-base mt-1">{second.name}</div>
          <div className="text-sm text-muted-foreground">TB: {second.avg_points}</div>
          <div className="text-xs text-muted-foreground">{second.matches_played} trận</div>
        </div>
      )}
    </div>
  );
}
