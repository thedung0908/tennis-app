'use client';

import type { RankingRow, MemberTimeSeries } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatShortDate } from '@/lib/formatters';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface MemberDetailModalProps {
  row: RankingRow;
  series: MemberTimeSeries[];
  open: boolean;
  onClose: () => void;
}

export function MemberDetailModal({ row, series, open, onClose }: MemberDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'TB điểm', value: row.avg_points },
            { label: 'Tổng', value: row.total_points },
            { label: 'Trận', value: row.matches_played },
            { label: 'T/H/B', value: `${row.wins}/${row.draws}/${row.losses}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted rounded-lg p-2">
              <div className="text-lg font-bold">{value}</div>
              <div className="text-[10px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {series.length > 1 && (
          <>
            <div>
              <p className="text-sm font-medium mb-2">Tiến triển điểm TB</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} width={30} />
                  <Tooltip formatter={(v: number) => [v, 'TB điểm']} labelFormatter={formatShortDate} />
                  <Line type="monotone" dataKey="cumAvg" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Điểm theo ngày</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={30} />
                  <Tooltip formatter={(v: number) => [v, 'Điểm']} labelFormatter={formatShortDate} />
                  <Bar dataKey="dayPoints" fill="#2563eb" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {series.length === 0 && (
          <p className="text-center text-muted-foreground py-4 text-sm">Chưa có dữ liệu</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
