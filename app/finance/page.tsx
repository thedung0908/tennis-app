import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { parsePeriodFromParams, getPeriodDateRange, getPeriodLabel } from '@/lib/periods';
import { computeFinance } from '@/lib/calculations';
import { FinanceTable } from '@/components/finance-table';
import { PeriodSelector } from '@/components/period-selector';
import type { Match, Member } from '@/types';

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function FinancePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = parsePeriodFromParams(params);
  const { start, end } = getPeriodDateRange(period);

  const [matchesRes, membersRes] = await Promise.all([
    supabase.from('matches').select('*').gte('date', start).lte('date', end).order('date'),
    supabase.from('members').select('*').order('name'),
  ]);

  const matches = (matchesRes.data ?? []) as Match[];
  const members = (membersRes.data ?? []) as Member[];

  const financeRows = computeFinance(matches, members);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Tài chính</h1>
      </div>
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
