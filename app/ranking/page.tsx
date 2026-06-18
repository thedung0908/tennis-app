import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { parsePeriodFromParams, getPeriodDateRange, getPeriodLabel } from '@/lib/periods';
import { computeRanking, computeChartsData } from '@/lib/calculations';
import { RankingPodium } from '@/components/ranking-podium';
import { RankingTable } from '@/components/ranking-table';
import { RankingCharts } from '@/components/ranking-charts';
import { PeriodSelector } from '@/components/period-selector';
import type { Match, Member } from '@/types';

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function RankingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = parsePeriodFromParams(params);
  const { start, end } = getPeriodDateRange(period);

  const [matchesRes, membersRes] = await Promise.all([
    supabase.from('matches').select('*').gte('date', start).lte('date', end).order('date'),
    supabase.from('members').select('*').order('name'),
  ]);

  const matches = (matchesRes.data ?? []) as Match[];
  const members = (membersRes.data ?? []) as Member[];

  const ranking = computeRanking(matches, members);
  const chartsData = computeChartsData(matches, members, period);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Xếp hạng</h1>
      </div>
      <div className="mb-4">
        <Suspense>
          <PeriodSelector period={period} />
        </Suspense>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{getPeriodLabel(period)}</p>

      {ranking.length >= 2 && <RankingPodium top2={ranking.slice(0, 2)} />}

      <RankingTable ranking={ranking} chartsData={chartsData} />

      {ranking.length > 0 && <RankingCharts ranking={ranking} chartsData={chartsData} />}
    </div>
  );
}
