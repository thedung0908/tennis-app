export type Member = {
  id: string;
  name: string;
  created_at: string;
};

export type Match = {
  id: string;
  date: string;
  team1_p1_id: string;
  team1_p2_id: string;
  team2_p1_id: string;
  team2_p2_id: string;
  score1: number;
  score2: number;
  created_at: string;
};

export type SinglesMatch = {
  id: string;
  date: string;
  player1_id: string;
  player2_id: string;
  score1: number;
  score2: number;
  created_at: string;
};

export type MatchWithNames = Match & {
  team1_p1_name: string;
  team1_p2_name: string;
  team2_p1_name: string;
  team2_p2_name: string;
};

export type RankingRow = {
  id: string;
  name: string;
  matches_played: number;
  total_points: number;
  avg_points: number;
  wins: number;
  draws: number;
  losses: number;
};

export type FinanceDetailItem = {
  matchId: string;
  date: string;
  description: string;
  moneyOwed: number;
};

export type FinanceRow = {
  id: string;
  name: string;
  total_money: number;
  details: FinanceDetailItem[];
};

export type Period =
  | { type: 'month'; month: number; year: number }
  | { type: 'quarter'; quarter: 1 | 2 | 3 | 4; year: number };

export type TimeSeriesPoint = {
  date: string;
  [memberName: string]: number | string;
};

export type MemberTimeSeries = {
  date: string;
  cumAvg: number;
  dayPoints: number;
  dayMatches: number;
};

export type ChartsData = {
  allMembers: TimeSeriesPoint[];
  byMember: Record<string, MemberTimeSeries[]>;
};
