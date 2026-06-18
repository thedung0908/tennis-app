# Architecture — Kiến trúc hệ thống

## 1. Tech Stack

| Layer | Công nghệ | Ghi chú |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | React Server Components + Client Components |
| **Language** | TypeScript (strict mode) | |
| **UI** | shadcn/ui + Tailwind CSS | Không tự viết UI primitives |
| **Database** | Supabase (PostgreSQL) | Hosted, free tier đủ dùng |
| **DB Client** | `@supabase/supabase-js` | Gọi trực tiếp từ Server Components |
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

Mọi Server Action ghi dữ liệu:
  → Đọc cookie "admin_session"
  → Kiểm tra token hợp lệ
  → Nếu không hợp lệ: throw Error("Unauthorized") → client nhận 403
```

### Đọc trạng thái auth trong Server Components

```typescript
// lib/auth.ts
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

export function isAdmin(): boolean {
  const token = cookies().get('admin_session')?.value;
  const expected = createHash('sha256')
    .update(process.env.ADMIN_PASSWORD! + process.env.SESSION_SECRET!)
    .digest('hex');
  return token === expected;
}

export function requireAdmin() {
  if (!isAdmin()) throw new Error('Unauthorized');
}
```

### Middleware bảo vệ route

```typescript
// middleware.ts — chặn direct GET đến trang write khi chưa đăng nhập
// (Trang /login là route duy nhất public không cần check)
// Các trang view-only (ranking, matches, finance, members) không cần middleware
// vì chúng chỉ ẩn nút ghi — không block GET
```

---

## 3. Cấu trúc thư mục

```
tennis-app/
├── middleware.ts                 # (tùy chọn) redirect /matches/*/edit nếu chưa login
├── app/
│   ├── layout.tsx                # Root layout (nav + font)
│   ├── page.tsx                  # Redirect → /ranking
│   ├── login/
│   │   └── page.tsx              # Trang đăng nhập admin
│   ├── ranking/
│   │   └── page.tsx              # Trang xếp hạng
│   ├── matches/
│   │   ├── page.tsx              # Danh sách trận (+ nút Thêm nếu admin)
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx      # Sửa trận (admin only)
│   ├── finance/
│   │   └── page.tsx              # Trang tài chính
│   └── members/
│       └── page.tsx              # Trang thành viên
│
├── actions/                      # Next.js Server Actions
│   ├── auth.ts                   # login(), logout()
│   ├── matches.ts                # createMatch(), updateMatch(), deleteMatch()
│   └── members.ts                # createMember(), deleteMember()
│
├── components/
│   ├── ui/                       # shadcn/ui (auto-generated, không chỉnh)
│   ├── nav-bottom.tsx            # Bottom nav (hiện badge "Admin" nếu đăng nhập)
│   ├── period-selector.tsx       # Bộ chọn tháng/quý + năm (dùng chung)
│   ├── ranking-table.tsx         # Bảng xếp hạng
│   ├── finance-table.tsx         # Bảng tài chính (Client — expand/collapse)
│   ├── match-list.tsx            # Danh sách trận (nút Sửa/Xóa chỉ render nếu isAdmin)
│   ├── match-form.tsx            # Form nhập/sửa trận (Client Component)
│   ├── match-delete-button.tsx   # Nút xóa trận + dialog xác nhận
│   ├── member-list.tsx           # Danh sách thành viên
│   ├── member-form.tsx           # Form thêm thành viên (admin only)
│   ├── login-form.tsx            # Form đăng nhập (Client Component)
│   ├── ranking-podium.tsx        # Thẻ vinh danh 🥇🥈 (Server Component)
│   ├── ranking-charts.tsx        # 3 biểu đồ toàn đội: Bar + Radar + Line (Client)
│   └── member-detail-modal.tsx   # Modal chi tiết + biểu đồ cá nhân (Client)
│
├── lib/
│   ├── supabase.ts               # Supabase client (server-side only)
│   ├── auth.ts                   # isAdmin(), requireAdmin()
│   ├── calculations.ts           # Hàm tính điểm, tiền (pure functions)
│   ├── formatters.ts             # Format tiền VND, ngày DD/MM/YYYY
│   └── periods.ts                # Tính date range theo tháng/quý
│
├── types/
│   └── index.ts                  # Shared TypeScript types
│
└── docs/
```

---

## 4. Phân chia Server / Client Components

| Component | Loại | Lý do |
|---|---|---|
| `app/login/page.tsx` | **Server** | Đọc cookie để redirect nếu đã login |
| `login-form.tsx` | **Client** | Form có state, submit Server Action |
| `app/ranking/page.tsx` | **Server** | Fetch data + đọc `isAdmin()` để truyền xuống |
| `app/finance/page.tsx` | **Server** | Như trên |
| `app/matches/page.tsx` | **Server** | Fetch + kiểm tra admin để hiển thị nút thêm |
| `period-selector.tsx` | **Client** | Người dùng tương tác chọn kỳ |
| `match-form.tsx` | **Client** | Form có state, validation, submit |
| `match-delete-button.tsx` | **Client** | Dialog xác nhận |
| `member-form.tsx` | **Client** | Form có state |
| `finance-table.tsx` | **Client** | Expand/collapse từng hàng |
| `nav-bottom.tsx` | **Client** | Đọc cookie phía client để hiển thị badge Admin |
| `ranking-podium.tsx` | **Server** | Nhận props từ page, render thuần |
| `ranking-charts.tsx` | **Client** | Recharts cần browser APIs |
| `member-detail-modal.tsx` | **Client** | Dialog + fetch time-series khi mở |

---

## 5. Data Flow

```
Người dùng chọn kỳ (tháng/quý)
  → period-selector cập nhật URL search params
  → Server Component đọc params
  → Gọi Supabase với date range tương ứng
  → Render bảng kết quả
```

```
Admin nhập trận mới
  → match-form (Client) validate input
  → Gọi Server Action createMatch()
  → Server Action: requireAdmin() → insert vào Supabase
  → revalidatePath('/matches') + revalidatePath('/ranking') + revalidatePath('/finance')
  → UI tự cập nhật
```

```
Public user cố submit form ghi
  → Server Action requireAdmin() throw Error
  → Client nhận lỗi, hiện toast "Không có quyền thực hiện"
```

---

## 6. Types chính

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
  avg_points: number;     // đã làm tròn 2 chữ số
  wins: number;
  draws: number;
  losses: number;
};

export type FinanceRow = {
  id: string;
  name: string;
  total_money: number;    // VND
};

export type Period =
  | { type: 'month'; month: number; year: number }
  | { type: 'quarter'; quarter: 1 | 2 | 3 | 4; year: number };

export type TimeSeriesPoint = {
  date: string;                        // "2024-08-10" hoặc "2024-08-01"
  [memberName: string]: number | string;  // TB tích lũy mỗi người tại điểm này
};

export type MemberDetailStats = RankingRow & {
  timeSeries: TimeSeriesPoint[];       // dùng cho line chart cá nhân
};
```

---

## 7. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
ADMIN_PASSWORD=<mật-khẩu-admin>
SESSION_SECRET=<chuỗi-ngẫu-nhiên-dài>
```

- `ADMIN_PASSWORD`: mật khẩu admin dùng chung, không bao giờ public
- `SESSION_SECRET`: chuỗi random dùng để sign token, tạo 1 lần bằng `openssl rand -hex 32`
- Hai biến `NEXT_PUBLIC_*` an toàn để public vì Supabase RLS chỉ cho phép đọc

---

## 8. Deployment

1. Push code lên GitHub
2. Kết nối repo với Vercel
3. Thêm 4 env vars vào Vercel dashboard
4. Deploy tự động mỗi khi push lên `main`

URL production: `https://<project>.vercel.app`
