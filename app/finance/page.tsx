import { Suspense } from 'react';
import { parsePeriodFromParams, getPeriodDateRange, getPeriodLabel } from '@/lib/periods';
import { computeFinance, computeSinglesFinance } from '@/lib/calculations';
import { getCachedMatchesByPeriod, getCachedSinglesByPeriod, getCachedMembers } from '@/lib/queries';
import { FinanceTable } from '@/components/finance-table';
import { PeriodSelector } from '@/components/period-selector';
import { MatchTypeTabs } from '@/components/match-type-tabs';

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function FinancePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = params.type === 'singles' ? 'singles' : 'doubles';
  const period = parsePeriodFromParams(params);
  const { start, end } = getPeriodDateRange(period);

  const [matches, singlesMatches, members] = await Promise.all([
    getCachedMatchesByPeriod(start, end),
    getCachedSinglesByPeriod(start, end),
    getCachedMembers(),
  ]);

  const financeRows = type === 'singles'
    ? computeSinglesFinance(singlesMatches, members)
    : computeFinance(matches, members);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Tài chính</h1>
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
      <FinanceTable rows={financeRows} />
    </div>
  );
}
