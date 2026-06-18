'use client';

import { useState } from 'react';
import type { RankingRow, ChartsData, MemberTimeSeries } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MemberDetailModal } from '@/components/member-detail-modal';
import { cn } from '@/lib/utils';

function rowBg(i: number, total: number): string {
  if (total < 3) return '';
  const topEnd = Math.ceil(total / 3);
  const botStart = Math.floor((total * 2) / 3);
  if (i === 0) return 'bg-amber-50';
  if (i < topEnd) return 'bg-green-50';
  if (i >= botStart) return 'bg-rose-50';
  return '';
}

interface RankingTableProps {
  ranking: RankingRow[];
  chartsData: ChartsData;
}

export function RankingTable({ ranking, chartsData }: RankingTableProps) {
  const [selected, setSelected] = useState<{ row: RankingRow; series: MemberTimeSeries[] } | null>(null);

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="w-8">#</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead className="text-right w-8">TR</TableHead>
              <TableHead className="text-right w-16">TB</TableHead>
              <TableHead className="text-right w-12">Tổng</TableHead>
              <TableHead className="text-right w-16">T/H/B</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Chưa có trận đấu trong kỳ này
                </TableCell>
              </TableRow>
            )}
            {ranking.map((row, i) => (
              <TableRow
                key={row.id}
                className={cn('cursor-pointer hover:brightness-95', rowBg(i, ranking.length))}
                onClick={() =>
                  setSelected({ row, series: chartsData.byMember[row.id] ?? [] })
                }
              >
                <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-semibold underline underline-offset-2 decoration-dotted">
                  {row.name}
                </TableCell>
                <TableCell className="text-right text-sm">{row.matches_played}</TableCell>
                <TableCell className="text-right text-sm font-medium">{row.avg_points}</TableCell>
                <TableCell className="text-right text-sm">{row.total_points}</TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {row.wins}/{row.draws}/{row.losses}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <MemberDetailModal
          row={selected.row}
          series={selected.series}
          open
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
