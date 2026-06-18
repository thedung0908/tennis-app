const DAY_LONG = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const DAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function dayIndex(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  // Dùng local date để tránh lệch ngày do UTC
  return new Date(y, m - 1, d).getDay();
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('vi-VN').replace(/\./g, '.') + 'đ';
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

/** "Thứ 3, 18/06/2026" — dùng làm tiêu đề nhóm */
export function formatDateWithDay(isoDate: string): string {
  return `${DAY_LONG[dayIndex(isoDate)]}, ${formatDate(isoDate)}`;
}

/** "T3 · 18/06" — dùng trong bảng chi tiết compact */
export function formatShortDateWithDay(isoDate: string): string {
  return `${DAY_SHORT[dayIndex(isoDate)]} · ${formatShortDate(isoDate)}`;
}
