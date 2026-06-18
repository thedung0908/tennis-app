import type { Match, SinglesMatch, Member, RankingRow, FinanceRow, ChartsData, MemberTimeSeries, TimeSeriesPoint } from '@/types';
import type { Period } from '@/types';

function buildMemberMap(members: Member[]): Map<string, Member> {
  return new Map(members.map((m) => [m.id, m]));
}

function expandMatchToPlayerRows(match: Match, memberMap: Map<string, Member>) {
  const t1p1 = memberMap.get(match.team1_p1_id);
  const t1p2 = memberMap.get(match.team1_p2_id);
  const t2p1 = memberMap.get(match.team2_p1_id);
  const t2p2 = memberMap.get(match.team2_p2_id);
  return [
    { id: match.team1_p1_id, name: t1p1?.name ?? '', points: match.score1, win: match.score1 > match.score2 ? 1 : 0, draw: match.score1 === match.score2 ? 1 : 0 },
    { id: match.team1_p2_id, name: t1p2?.name ?? '', points: match.score1, win: match.score1 > match.score2 ? 1 : 0, draw: match.score1 === match.score2 ? 1 : 0 },
    { id: match.team2_p1_id, name: t2p1?.name ?? '', points: match.score2, win: match.score2 > match.score1 ? 1 : 0, draw: match.score1 === match.score2 ? 1 : 0 },
    { id: match.team2_p2_id, name: t2p2?.name ?? '', points: match.score2, win: match.score2 > match.score1 ? 1 : 0, draw: match.score1 === match.score2 ? 1 : 0 },
  ];
}

export function computeRanking(matches: Match[], members: Member[]): RankingRow[] {
  const memberMap = buildMemberMap(members);
  const stats = new Map<string, { id: string; name: string; points: number; matches: number; wins: number; draws: number }>();

  for (const match of matches) {
    for (const row of expandMatchToPlayerRows(match, memberMap)) {
      if (!row.name) continue;
      const prev = stats.get(row.id) ?? { id: row.id, name: row.name, points: 0, matches: 0, wins: 0, draws: 0 };
      stats.set(row.id, {
        ...prev,
        points: prev.points + row.points,
        matches: prev.matches + 1,
        wins: prev.wins + row.win,
        draws: prev.draws + row.draw,
      });
    }
  }

  return Array.from(stats.values())
    .map((s) => ({
      id: s.id,
      name: s.name,
      matches_played: s.matches,
      total_points: s.points,
      avg_points: Math.round((s.points / s.matches) * 100) / 100,
      wins: s.wins,
      draws: s.draws,
      losses: s.matches - s.wins - s.draws,
    }))
    .sort((a, b) => {
      if (b.avg_points !== a.avg_points) return b.avg_points - a.avg_points;
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      return a.matches_played - b.matches_played;
    });
}

function calcMatchMoney(score1: number, score2: number): { team1: number; team2: number } {
  if (score1 === 5 && score2 === 5) return { team1: 10000, team2: 10000 };
  if (score1 > score2) return { team1: 0, team2: (score1 - score2) * 10000 };
  return { team1: (score2 - score1) * 10000, team2: 0 };
}

export function computeFinance(matches: Match[], members: Member[]): FinanceRow[] {
  const memberMap = buildMemberMap(members);
  const rows = new Map<string, FinanceRow>();

  for (const match of matches) {
    const money = calcMatchMoney(match.score1, match.score2);
    const t1p1 = memberMap.get(match.team1_p1_id);
    const t1p2 = memberMap.get(match.team1_p2_id);
    const t2p1 = memberMap.get(match.team2_p1_id);
    const t2p2 = memberMap.get(match.team2_p2_id);

    const desc = `${t1p1?.name ?? '?'}+${t1p2?.name ?? '?'} ${match.score1}-${match.score2} ${t2p1?.name ?? '?'}+${t2p2?.name ?? '?'}`;

    const team1Players = [
      { id: match.team1_p1_id, member: t1p1 },
      { id: match.team1_p2_id, member: t1p2 },
    ];
    const team2Players = [
      { id: match.team2_p1_id, member: t2p1 },
      { id: match.team2_p2_id, member: t2p2 },
    ];

    for (const { id, member } of team1Players) {
      if (!member) continue;
      const prev = rows.get(id) ?? { id, name: member.name, total_money: 0, details: [] };
      prev.total_money += money.team1;
      prev.details.push({ matchId: match.id, date: match.date, description: desc, moneyOwed: money.team1 });
      rows.set(id, prev);
    }
    for (const { id, member } of team2Players) {
      if (!member) continue;
      const prev = rows.get(id) ?? { id, name: member.name, total_money: 0, details: [] };
      prev.total_money += money.team2;
      prev.details.push({ matchId: match.id, date: match.date, description: desc, moneyOwed: money.team2 });
      rows.set(id, prev);
    }
  }

  return Array.from(rows.values()).sort((a, b) => b.total_money - a.total_money);
}

export function computeChartsData(matches: Match[], members: Member[], period: Period): ChartsData {
  const memberMap = buildMemberMap(members);

  const groupKey = (date: string) =>
    period.type === 'month' ? date : date.substring(0, 7) + '-01';

  type DayAgg = { points: number; matches: number; name: string };
  const byPlayerByGroup = new Map<string, Map<string, DayAgg>>();

  for (const match of matches) {
    const key = groupKey(match.date);
    for (const row of expandMatchToPlayerRows(match, memberMap)) {
      if (!row.name) continue;
      if (!byPlayerByGroup.has(row.id)) byPlayerByGroup.set(row.id, new Map());
      const playerGroups = byPlayerByGroup.get(row.id)!;
      const prev = playerGroups.get(key) ?? { points: 0, matches: 0, name: row.name };
      playerGroups.set(key, { points: prev.points + row.points, matches: prev.matches + 1, name: row.name });
    }
  }

  const allGroupKeys = Array.from(
    new Set(matches.map((m) => groupKey(m.date)))
  ).sort();

  const allMembersData: TimeSeriesPoint[] = [];
  const byMemberData: Record<string, MemberTimeSeries[]> = {};

  const runningTotals = new Map<string, { points: number; matches: number; name: string }>();

  for (const key of allGroupKeys) {
    for (const [playerId, playerGroups] of byPlayerByGroup) {
      const dayData = playerGroups.get(key);
      if (!dayData) continue;
      const prev = runningTotals.get(playerId) ?? { points: 0, matches: 0, name: dayData.name };
      runningTotals.set(playerId, {
        points: prev.points + dayData.points,
        matches: prev.matches + dayData.matches,
        name: dayData.name,
      });

      if (!byMemberData[playerId]) byMemberData[playerId] = [];
      const totals = runningTotals.get(playerId)!;
      byMemberData[playerId].push({
        date: key,
        cumAvg: Math.round((totals.points / totals.matches) * 100) / 100,
        dayPoints: dayData.points,
        dayMatches: dayData.matches,
      });
    }

    const point: TimeSeriesPoint = { date: key };
    for (const [, totals] of runningTotals) {
      point[totals.name] = Math.round((totals.points / totals.matches) * 100) / 100;
    }
    allMembersData.push(point);
  }

  return { allMembers: allMembersData, byMember: byMemberData };
}

// ── Singles ──────────────────────────────────────────────────────────────────

function expandSinglesMatchToPlayerRows(match: SinglesMatch, memberMap: Map<string, Member>) {
  const p1 = memberMap.get(match.player1_id);
  const p2 = memberMap.get(match.player2_id);
  return [
    { id: match.player1_id, name: p1?.name ?? '', points: match.score1, win: match.score1 > match.score2 ? 1 : 0, draw: match.score1 === match.score2 ? 1 : 0 },
    { id: match.player2_id, name: p2?.name ?? '', points: match.score2, win: match.score2 > match.score1 ? 1 : 0, draw: match.score1 === match.score2 ? 1 : 0 },
  ];
}

export function computeSinglesRanking(matches: SinglesMatch[], members: Member[]): RankingRow[] {
  const memberMap = buildMemberMap(members);
  const stats = new Map<string, { id: string; name: string; points: number; matches: number; wins: number; draws: number }>();

  for (const match of matches) {
    for (const row of expandSinglesMatchToPlayerRows(match, memberMap)) {
      if (!row.name) continue;
      const prev = stats.get(row.id) ?? { id: row.id, name: row.name, points: 0, matches: 0, wins: 0, draws: 0 };
      stats.set(row.id, { ...prev, points: prev.points + row.points, matches: prev.matches + 1, wins: prev.wins + row.win, draws: prev.draws + row.draw });
    }
  }

  return Array.from(stats.values())
    .map((s) => ({
      id: s.id,
      name: s.name,
      matches_played: s.matches,
      total_points: s.points,
      avg_points: Math.round((s.points / s.matches) * 100) / 100,
      wins: s.wins,
      draws: s.draws,
      losses: s.matches - s.wins - s.draws,
    }))
    .sort((a, b) => {
      if (b.avg_points !== a.avg_points) return b.avg_points - a.avg_points;
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      return a.matches_played - b.matches_played;
    });
}

export function computeSinglesFinance(matches: SinglesMatch[], members: Member[]): FinanceRow[] {
  const memberMap = buildMemberMap(members);
  const rows = new Map<string, FinanceRow>();

  for (const match of matches) {
    const money = calcMatchMoney(match.score1, match.score2);
    const p1 = memberMap.get(match.player1_id);
    const p2 = memberMap.get(match.player2_id);
    const desc = `${p1?.name ?? '?'} ${match.score1}-${match.score2} ${p2?.name ?? '?'}`;

    for (const { id, member, owed } of [
      { id: match.player1_id, member: p1, owed: money.team1 },
      { id: match.player2_id, member: p2, owed: money.team2 },
    ]) {
      if (!member) continue;
      const prev = rows.get(id) ?? { id, name: member.name, total_money: 0, details: [] };
      prev.total_money += owed;
      prev.details.push({ matchId: match.id, date: match.date, description: desc, moneyOwed: owed });
      rows.set(id, prev);
    }
  }

  return Array.from(rows.values()).sort((a, b) => b.total_money - a.total_money);
}

export function computeSinglesChartsData(matches: SinglesMatch[], members: Member[], period: Period): ChartsData {
  const memberMap = buildMemberMap(members);
  const groupKey = (date: string) => period.type === 'month' ? date : date.substring(0, 7) + '-01';

  type DayAgg = { points: number; matches: number; name: string };
  const byPlayerByGroup = new Map<string, Map<string, DayAgg>>();

  for (const match of matches) {
    const key = groupKey(match.date);
    for (const row of expandSinglesMatchToPlayerRows(match, memberMap)) {
      if (!row.name) continue;
      if (!byPlayerByGroup.has(row.id)) byPlayerByGroup.set(row.id, new Map());
      const playerGroups = byPlayerByGroup.get(row.id)!;
      const prev = playerGroups.get(key) ?? { points: 0, matches: 0, name: row.name };
      playerGroups.set(key, { points: prev.points + row.points, matches: prev.matches + 1, name: row.name });
    }
  }

  const allGroupKeys = Array.from(new Set(matches.map((m) => groupKey(m.date)))).sort();
  const allMembersData: TimeSeriesPoint[] = [];
  const byMemberData: Record<string, MemberTimeSeries[]> = {};
  const runningTotals = new Map<string, { points: number; matches: number; name: string }>();

  for (const key of allGroupKeys) {
    for (const [playerId, playerGroups] of byPlayerByGroup) {
      const dayData = playerGroups.get(key);
      if (!dayData) continue;
      const prev = runningTotals.get(playerId) ?? { points: 0, matches: 0, name: dayData.name };
      runningTotals.set(playerId, { points: prev.points + dayData.points, matches: prev.matches + dayData.matches, name: dayData.name });
      if (!byMemberData[playerId]) byMemberData[playerId] = [];
      const totals = runningTotals.get(playerId)!;
      byMemberData[playerId].push({ date: key, cumAvg: Math.round((totals.points / totals.matches) * 100) / 100, dayPoints: dayData.points, dayMatches: dayData.matches });
    }
    const point: TimeSeriesPoint = { date: key };
    for (const [, totals] of runningTotals) {
      point[totals.name] = Math.round((totals.points / totals.matches) * 100) / 100;
    }
    allMembersData.push(point);
  }

  return { allMembers: allMembersData, byMember: byMemberData };
}

export function isValidScore(score1: number, score2: number): boolean {
  return (
    (score1 === 6 && [0, 1, 2, 3, 4].includes(score2)) ||
    (score2 === 6 && [0, 1, 2, 3, 4].includes(score1)) ||
    (score1 === 5 && score2 === 5)
  );
}
