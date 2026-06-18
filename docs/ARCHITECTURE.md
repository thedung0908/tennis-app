# Architecture — Kiến trúc hệ thống

## 1. Tech Stack

| Layer | Công nghệ | Ghi chú |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | React Server Components + Client Components |
| **Language** | TypeScript (strict mode) | |
| **UI** | shadcn/ui + Tailwind CSS | Không tự viết UI primitives |
| **Database** | Supabase (PostgreSQL) | Hosted, free tier đủ dùng |
| **DB Client** | `@supabase/supabase-js` | Gọi qua `lib/queries.ts` (có cache) từ Server Components |
| **Caching** | `unstable_cache` (Next.js Data Cache) | Cache DB queries, invalidate bằng `revalidateTag` |
| **Auth** | Cookie httpOnly tự quản lý | Không dùng Supabase Auth |
| **Charts** | Recharts (qua shadcn/ui chart) | Bar, Radar, Line chart |
| **Deployment** | Vercel | Auto-deploy từ GitHub |

---

## 2. Cơ chế Auth

### Luồng đăng nhập

```
POST /login (Server Action)
  → So sánh input với ADMIN_PASSWORD (env var)
  → Nếu đúng: set cookie httpOnly "admin_session=<token>"
              token = SHA-256(ADMIN_PASSWORD + SESSION_SECRET)
  → Redirect về trang trước hoặc /ranking
```

### Middleware bảo vệ route

```typescript
// middleware.ts — Edge Runtime (không dùng Node.js modules)
// Chỉ kiểm tra cookie tồn tại; token verification thực sự ở Server Action
export const config = {
  matcher: ['/matches/:id/edit', '/singles/:id/edit'],
};
```

---

## 3. Caching Strategy

Tất cả Supabase queries được bọc trong `unstable_cache` tại `lib/queries.ts`:

```typescript
export const TAGS = {
  members: 'members',
  matches: 'matches',
  singles: 'singles-matches',
} as const;

// Ví dụ:
export const getCachedMatchesByPeriod = unstable_cache(
  async (start: string, end: string): Promise<Match[]> => { /* query */ },
  ['matches-by-period'],
  { tags: [TAGS.matches] }
);
```

**Quy tắc invalidation** — trong mỗi Server Action sau khi ghi DB:

```typescript
// Xóa data cache (unstable_cache):
revalidateTag(TAGS.matches);      // khi thêm/sửa/xóa trận đôi
revalidateTag(TAGS.singles);      // khi thêm/sửa/xóa trận đơn
revalidateTag(TAGS.members);      // khi thêm/sửa/xóa thành viên

// Xóa Router cache (client-side):
revalidatePath('/matches');
revalidatePath('/ranking');
revalidatePath('/finance');
```

**Kết quả**: lần đầu vào trang hit Supabase, các lần sau (cùng params) trả từ Vercel Data Cache ≈ instant.

---

## 4. Cấu trúc thư mục

```
tennis-app/
├── middleware.ts                   # Bảo vệ /matches/*/edit và /singles/*/edit
├── app/
│   ├── layout.tsx                  # Root layout (nav + TennisBallIcon + font)
│   ├── page.tsx                    # Redirect → /ranking
│   ├── icon.svg                    # Favicon (Next.js App Router convention)
│   ├── login/
│   │   └── page.tsx
│   ├── ranking/
│   │   ├── page.tsx                # Đọc ?type=singles|doubles + period params
│   │   └── loading.tsx             # Skeleton UI
│   ├── matches/
│   │   ├── page.tsx                # Đọc ?type=singles|doubles
│   │   ├── loading.tsx             # Skeleton UI
│   │   └── [id]/edit/page.tsx      # Sửa trận đôi (admin only)
│   ├── singles/
│   │   └── [id]/edit/page.tsx      # Sửa trận đơn (admin only)
│   ├── finance/
│   │   ├── page.tsx                # Đọc ?type=singles|doubles + period params
│   │   └── loading.tsx             # Skeleton UI
│   └── members/
│       ├── page.tsx
│       └── loading.tsx             # Skeleton UI
│
├── actions/                        # Next.js Server Actions ('use server')
│   ├── auth.ts                     # login(), logout()
│   ├── matches.ts                  # createMatch(), updateMatch(), deleteMatch()
│   ├── singles-matches.ts          # createSinglesMatch(), updateSinglesMatch(), deleteSinglesMatch()
│   └── members.ts                  # createMember(), updateMemberName(), deleteMember()
│
├── components/
│   ├── ui/                         # shadcn/ui (auto-generated, không chỉnh)
│   ├── nav-bottom.tsx              # Bottom nav 4 tab
│   ├── tennis-ball-icon.tsx        # SVG icon bóng tennis (dùng trong header)
│   ├── match-type-tabs.tsx         # Tab "Đánh đôi" / "Đánh đơn" (Client, dùng useSearchParams)
│   ├── period-selector.tsx         # Bộ chọn tháng/quý + năm (dùng chung)
│   │
│   ├── match-list.tsx              # Danh sách trận đôi (màu nền, số thứ tự)
│   ├── match-form.tsx              # Form nhập/sửa trận đôi (4 người)
│   ├── match-delete-button.tsx     # Nút xóa trận đôi + dialog xác nhận
│   │
│   ├── singles-match-list.tsx      # Danh sách trận đơn (cùng style màu sắc)
│   ├── singles-match-form.tsx      # Form nhập/sửa trận đơn (2 người)
│   ├── singles-match-delete-button.tsx
│   │
│   ├── ranking-table.tsx           # Bảng xếp hạng (màu nền theo nhóm)
│   ├── ranking-podium.tsx          # Thẻ vinh danh 🥇🥈
│   ├── ranking-charts.tsx          # 3 biểu đồ toàn đội (Client)
│   ├── member-detail-modal.tsx     # Modal chi tiết + biểu đồ cá nhân (Client)
│   │
│   ├── finance-table.tsx           # Bảng tài chính expand/collapse (Client, có avatar)
│   │
│   ├── member-list.tsx             # Danh sách thành viên (avatar + số trận, inline edit)
│   ├── member-form.tsx             # Form thêm thành viên
│   └── login-form.tsx              # Form đăng nhập (Client)
│
├── lib/
│   ├── supabase.ts                 # Supabase client (server-side only)
│   ├── auth.ts                     # isAdmin(), requireAdmin()
│   ├── queries.ts                  # Cached DB queries (unstable_cache + TAGS)
│   ├── calculations.ts             # computeRanking, computeFinance, computeChartsData
│   │                               # computeSinglesRanking, computeSinglesFinance, computeSinglesChartsData
│   ├── formatters.ts               # formatMoney, formatDate, formatDateWithDay, formatShortDateWithDay
│   └── periods.ts                  # parsePeriodFromParams, getPeriodDateRange, getPeriodLabel
│
├── types/
│   └── index.ts                    # Shared TypeScript types
│
└── supabase/
    └── migrations/
        ├── 001_init.sql            # members, matches, sample data
        └── 002_singles.sql         # singles_matches
```

---

## 5. Phân chia Server / Client Components

| Component | Loại | Lý do |
|---|---|---|
| `app/*/page.tsx` | **Server** | Fetch data, đọc `isAdmin()`, đọc searchParams |
| `app/*/loading.tsx` | **Server** | Skeleton UI, render khi page đang load |
| `match-type-tabs.tsx` | **Client** | Dùng `useSearchParams` + `usePathname` |
| `period-selector.tsx` | **Client** | Người dùng tương tác chọn kỳ |
| `match-form.tsx` | **Client** | Form có state, submit Server Action |
| `singles-match-form.tsx` | **Client** | Như trên |
| `match-delete-button.tsx` | **Client** | Dialog xác nhận |
| `singles-match-delete-button.tsx` | **Client** | Như trên |
| `finance-table.tsx` | **Client** | Expand/collapse từng hàng |
| `member-list.tsx` | **Client** | Inline edit tên thành viên |
| `ranking-charts.tsx` | **Client** | Recharts cần browser APIs |
| `member-detail-modal.tsx` | **Client** | Dialog + charts |
| `ranking-podium.tsx` | **Server** | Nhận props từ page, render thuần |

---

## 6. Data Flow

```
Người dùng chọn tab Đôi/Đơn + kỳ (tháng/quý)
  → URL: /ranking?type=singles&month=6&year=2026
  → Server Component đọc searchParams
  → Gọi getCachedXxx() từ lib/queries.ts
    → Cache hit? → Trả ngay (instant)
    → Cache miss? → Gọi Supabase → cache kết quả với tag
  → Tính toán với computeSinglesRanking() / computeRanking()
  → Render
```

```
Admin thêm trận mới
  → Server Action createMatch() / createSinglesMatch()
  → insert vào Supabase
  → revalidateTag(TAGS.matches) / revalidateTag(TAGS.singles)  ← xóa data cache
  → revalidatePath('/matches') + '/ranking' + '/finance'        ← xóa router cache
  → UI tự cập nhật với data mới
```

---

## 7. Types chính

```typescript
// types/index.ts

export type Member = {
  id: string;
  name: string;
  created_at: string;
};

export type Match = {
  id: string;
  date: string;           // ISO: "2024-08-27"
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

export type RankingRow = {
  id: string;
  name: string;
  matches_played: number;
  total_points: number;
  avg_points: number;     // đã làm tròn 2 chữ số
  wins: number;
  draws: number;
  losses: number;
};

export type FinanceDetailItem = {
  matchId: string;
  date: string;
  description: string;    // đôi: "P1+P2 6-3 P3+P4"; đơn: "P1 6-3 P2"
  moneyOwed: number;
};

export type FinanceRow = {
  id: string;
  name: string;
  total_money: number;    // VND
  details: FinanceDetailItem[];
};

export type Period =
  | { type: 'month'; month: number; year: number }
  | { type: 'quarter'; quarter: 1 | 2 | 3 | 4; year: number };

export type ChartsData = {
  allMembers: TimeSeriesPoint[];
  byMember: Record<string, MemberTimeSeries[]>;
};
```

---

## 8. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
ADMIN_PASSWORD=<mật-khẩu-admin>
SESSION_SECRET=<chuỗi-ngẫu-nhiên-dài>
```

- `SESSION_SECRET`: tạo bằng `openssl rand -hex 32`

---

## 9. Deployment

1. Push code lên GitHub
2. Kết nối repo với Vercel
3. Thêm 4 env vars vào Vercel dashboard
4. Chạy `supabase/migrations/001_init.sql` và `002_singles.sql` trong Supabase SQL Editor
5. Deploy tự động mỗi khi push lên `main`

**Lưu ý**: Vercel free tier có cold start ~1-2s sau thời gian idle. `loading.tsx` skeleton giúp cải thiện perceived performance. Data cache (`unstable_cache`) giúp các navigation lặp lại gần như instant.
