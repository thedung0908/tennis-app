'use client';

import { useState } from 'react';
import type { RankingRow, ChartsData } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatShortDate } from '@/lib/formatters';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#2563eb','#dc2626','#16a34a','#d97706','#9333ea','#0891b2','#db2777','#65a30d','#ea580c','#7c3aed'];

interface RankingChartsProps {
  ranking: RankingRow[];
  chartsData: ChartsData;
}

export function RankingCharts({ ranking, chartsData }: RankingChartsProps) {
  const [, forceUpdate] = useState(0);
  void forceUpdate;

  if (ranking.length === 0) return null;

  const radarData = [
    { metric: 'TB điểm' },
    { metric: 'Tổng điểm' },
    { metric: 'Số trận' },
    { metric: 'Tỷ lệ thắng' },
  ].map(({ metric }) => {
    const point: Record<string, number | string> = { metric };
    const maxTotal = Math.max(...ranking.map((r) => r.total_points), 1);
    const maxMatches = Math.max(...ranking.map((r) => r.matches_played), 1);
    ranking.forEach((r) => {
      let val = 0;
      if (metric === 'TB điểm') val = Math.round((r.avg_points / 6) * 100);
      else if (metric === 'Tổng điểm') val = Math.round((r.total_points / maxTotal) * 100);
      else if (metric === 'Số trận') val = Math.round((r.matches_played / maxMatches) * 100);
      else val = r.matches_played > 0 ? Math.round((r.wins / r.matches_played) * 100) : 0;
      point[r.name] = val;
    });
    return point;
  });

  return (
    <div className="mt-4">
      <p className="text-sm font-semibold mb-3">Biểu đồ toàn đội</p>
      <Tabs defaultValue="bar">
        <TabsList className="w-full">
          <TabsTrigger value="bar" className="flex-1">Cột điểm</TabsTrigger>
          <TabsTrigger value="radar" className="flex-1">Mạng nhện</TabsTrigger>
          <TabsTrigger value="line" className="flex-1">Đường TB</TabsTrigger>
        </TabsList>

        <TabsContent value="bar" className="mt-3">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ranking} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="avg_points" name="TB điểm" fill="#2563eb" radius={[3,3,0,0]} />
              <Bar dataKey="total_points" name="Tổng điểm" fill="#93c5fd" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="radar" className="mt-3">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              {ranking.map((r, i) => (
                <Radar
                  key={r.id}
                  name={r.name}
                  dataKey={r.name}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                />
              ))}
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v}%`]} />
            </RadarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="line" className="mt-3">
          {chartsData.allMembers.length < 2 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              Cần ít nhất 2 ngày thi đấu để hiển thị biểu đồ đường
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartsData.allMembers} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={formatShortDate} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                {ranking.map((r, i) => (
                  <Line
                    key={r.id}
                    type="monotone"
                    dataKey={r.name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
