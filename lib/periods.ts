import type { Period } from '@/types';

export function getPeriodDateRange(period: Period): { start: string; end: string } {
  if (period.type === 'month') {
    const start = `${period.year}-${String(period.month).padStart(2, '0')}-01`;
    const lastDay = new Date(period.year, period.month, 0).getDate();
    const end = `${period.year}-${String(period.month).padStart(2, '0')}-${lastDay}`;
    return { start, end };
  }
  const monthStart = (period.quarter - 1) * 3 + 1;
  const monthEnd = period.quarter * 3;
  const start = `${period.year}-${String(monthStart).padStart(2, '0')}-01`;
  const lastDay = new Date(period.year, monthEnd, 0).getDate();
  const end = `${period.year}-${String(monthEnd).padStart(2, '0')}-${lastDay}`;
  return { start, end };
}

export function parsePeriodFromParams(params: {
  type?: string;
  month?: string;
  quarter?: string;
  year?: string;
}): Period {
  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  if (params.type === 'quarter') {
    const quarter = params.quarter ? (parseInt(params.quarter) as 1 | 2 | 3 | 4) : (Math.ceil((now.getMonth() + 1) / 3) as 1 | 2 | 3 | 4);
    return { type: 'quarter', quarter, year };
  }

  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;
  return { type: 'month', month, year };
}

export function getPeriodLabel(period: Period): string {
  if (period.type === 'month') {
    return `Tháng ${period.month}/${period.year}`;
  }
  return `Quý ${period.quarter}/${period.year}`;
}

export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear, currentYear + 1];
}
