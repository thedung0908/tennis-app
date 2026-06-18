import { Suspense } from 'react';
import { parsePeriodFromParams, getPeriodDateRange, getPeriodLabel } from '@/lib/periods';
import { computeRanking, computeChartsData, computeSinglesRanking, computeSinglesChartsData } from '@/lib/calculations';
import { getCachedMatchesByPeriod, getCachedSinglesByPeriod, getCachedMembers } from '@/lib/queries';
import { RankingPodium } from '@/components/ranking-podium';
import { RankingTable } from '@/components/ranking-table';
import { RankingCharts } from '@/components/ranking-charts';
import { PeriodSelector } from '@/components/period-selector';
import { MatchTypeTabs } from '@/components/match-type-tabs';

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function RankingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = params.type === 'singles' ? 'singles' : 'doubles';
  const period = parsePeriodFromParams(params);
  const { start, end } = getPeriodDateRange(period);

  const [matches, singlesMatches, members] = await Promise.all([
    getCachedMatchesByPeriod(start, end),
    getCachedSinglesByPeriod(start, end),
    getCachedMembers(),
  ]);

  const ranking = type === 'singles'
    ? computeSinglesRanking(singlesMatches, members)
    : computeRanking(matches, members);

  const chartsData = type === 'singles'
    ? computeSinglesChartsData(singlesMatches, members, period)
    : computeChartsData(matches, members, period);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Xếp hạng</h1>
      </div>
      <Suspense>
        <MatchTypeTabs />
      </Suspense>
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
