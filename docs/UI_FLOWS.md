# UI Flows — Các trang và luồng UX

## 1. Navigation

Bottom navigation bar (mobile), 4 tab. Header hiện tên CLB + icon bóng tennis + nút đăng nhập/xuất.

```
┌─────────────────────────────────────┐
│  🎾 CLB Tennis 123    [Admin · Đăng xuất]  │  ← chỉ hiện khi là admin
│              [Nội dung]             │
│                                     │
├──────┬──────────┬──────────┬────────┤
│ 🏆   │  🎾      │  💰      │  👥   │
│Xếp   │ Trận     │ Tài      │ Thành  │
│hạng  │ đấu      │ chính    │ viên   │
└──────┴──────────┴──────────┴────────┘
```

- Route mặc định `/` redirect sang `/ranking`
- Public user: header hiện link "Đăng nhập Admin" nhỏ

---

## 2. Tab Đôi / Đơn (dùng chung cho 3 trang)

3 trang Trận đấu, Xếp hạng, Tài chính đều có tab "Đánh đôi / Đánh đơn" ngay dưới tiêu đề:

```
Trận đấu

[Đánh đôi] [Đánh đơn]   ← tab, border-bottom active
─────────────────────────
... nội dung trang ...
```

- Tab dùng URL query param: `?type=singles` / không có param = doubles
- `MatchTypeTabs` là Client Component, dùng `useSearchParams` + `usePathname` để build URL, giữ nguyên các params khác (period) khi chuyển tab
- Bọc trong `<Suspense>` ở page vì `useSearchParams` cần boundary

---

## 3. Hệ thống màu sắc

Màu nhất quán toàn app — **không tự ý thêm màu mới**:

| Màu | Ý nghĩa |
|---|---|
| `bg-green-50` / `text-green-700` | Thắng; top 1/3 bảng xếp hạng |
| `bg-rose-50` / `text-rose-600` | Thua; bottom 1/3 bảng xếp hạng |
| `bg-amber-50` | **Chỉ** hạng 1 (vàng/champion) |
| `bg-slate-50` / `text-slate-500` | Hòa (trung lập) + badge "HÒA" |

---

## 4. Trang Đăng nhập (`/login`)

```
┌─────────────────────────────────────┐
│       CLB Tennis 123 Admin          │
│                                     │
│  Mật khẩu admin                     │
│  ┌─────────────────────────────┐    │
│  │ ••••••••             [👁]   │    │
│  └─────────────────────────────┘    │
│  ⚠ Mật khẩu không đúng             │
│         [Đăng nhập]                 │
│    ← Quay lại xem không cần đăng nhập
└─────────────────────────────────────┘
```

---

## 5. Trang Xếp hạng (`/ranking?type=doubles|singles`)

```
┌─────────────────────────────────────┐
│  Xếp hạng                           │
│  [Đánh đôi] [Đánh đơn]             │  ← tab
│  [● Tháng ○ Quý] [Tháng 6 2026]    │
│  Tháng 6/2026                       │
│                                     │
│  ┌────────────┐ ┌────────────┐      │  ← chỉ khi ≥ 1 trận
│  │ 🥇 HÀ     │ │ 🥈 CHƯƠNG  │      │
│  │ TB: 5.60  │ │ TB: 5.17   │      │
│  └────────────┘ └────────────┘      │
│                                     │
│  # │Tên  │TR│  TB  │Tổng│T/H/B     │
│  ──┼─────┼──┼──────┼────┼──────    │
│  1 │HÀ   │5 │ 5.60 │ 28 │3/1/1    │  ← bg-amber-50
│  2 │CHƯƠNG│6│ 5.17 │ 31 │3/0/3    │  ← bg-green-50
│  3 │KIÊN │4 │ 5.00 │ 20 │2/1/1    │  ← bg-green-50
│  4 │...  │  │      │    │         │  ← bg-white
│  6 │...  │  │      │    │         │  ← bg-rose-50
│                                     │
│  [Cột điểm] [Mạng nhện] [Đường TB] │
└─────────────────────────────────────┘
```

- Màu dòng: hạng 1 = amber-50; top 1/3 = green-50; bottom 1/3 = rose-50; giữa = trắng
- Cột T/H/B = Thắng/Hòa/Bại
- Click tên → modal chi tiết + biểu đồ cá nhân
- Tab Đơn dùng `computeSinglesRanking` — bảng xếp hạng riêng, không gộp với đôi

---

## 6. Trang Trận đấu (`/matches?type=doubles|singles`)

### Card trận (cả đôi lẫn đơn)

```
┌──────────────────────────────────────┐
│ Trận 1                    [HÒA]      │  ← header: số TT + badge nếu hòa
│ [bg-green] CHƯƠNG + KIÊN         6  │
│ [bg-rose]  TIẾN + DŨNG            3  │
│             [✏️ Sửa] [🗑 Xóa]        │  ← chỉ admin
└──────────────────────────────────────┘
```

- Số thứ tự (Trận 1, Trận 2...) tính lại theo từng ngày
- Màu nền mỗi dòng: thắng=green-50, thua=rose-50, hòa=slate-50
- Badge "HÒA" màu slate xuất hiện trong header khi tỷ số 5-5
- Nhóm theo ngày, header ngày hiện "Thứ 3, 17/06/2026" (có thứ trong tuần)

### Form trận đôi (4 người)

```
Ngày thi đấu: [18/06/2026]
Đội 1 — Người 1: [CHƯƠNG ▼]  Đội 1 — Người 2: [KIÊN ▼]
Tỷ số Đội 1 [6▼]  —  Tỷ số Đội 2 [3▼]
Đội 2 — Người 1: [TIẾN ▼]  Đội 2 — Người 2: [DŨNG ▼]
[Lưu trận]
```

### Form trận đơn (2 người, trang /singles/[id]/edit)

```
Ngày thi đấu: [18/06/2026]
Người chơi 1: [CHƯƠNG ▼]
Điểm người 1 [6▼]  —  Điểm người 2 [3▼]
Người chơi 2: [TIẾN ▼]
[Lưu trận]
```

- Nút [Sửa] → trang `/singles/[id]/edit` cho trận đơn (bảo vệ bởi middleware)
- Form đơn mở qua Dialog (thêm mới) hoặc trang riêng (sửa)

---

## 7. Trang Tài chính (`/finance?type=doubles|singles`)

```
┌─────────────────────────────────────┐
│  Tài chính                          │
│  [Đánh đôi] [Đánh đơn]             │  ← tab
│  [● Tháng ○ Quý] [Tháng 6 2026]    │
│  Tháng 6/2026                       │
│                                     │
│  ℹ Công thức tính tiền nộp quỹ     │
│  Đội thắng: 0đ · Đội thua: (hiệu   │
│  số game) × 10.000đ / người         │
│  Hòa 5-5: tất cả 4 người 10.000đ   │
│                                     │
│ [1] [A] CHƯƠNG       2 trận  70.000đ [▼]│
│   T3·18/06 CHƯƠNG+HƯNG vs HÀ+DŨNG 2-6 → 40.000đ
│   T3·18/06 HÀ+HƯNG vs KIÊN+CHƯƠNG 6-3 → 30.000đ
│ [2] [K] KIÊN         3 trận  30.000đ [▼]│
│ ...                                 │
│  Tổng quỹ: 200.000đ                │
└─────────────────────────────────────┘
```

- Số thứ tự + avatar chữ cái đầu tên với màu sắc xoay vòng (10 màu)
- Dưới tên: "X trận" (số trận trong kỳ này)
- Chi tiết ngày hiện dạng "T3·18/06" (thứ viết tắt + ngày/tháng)
- Tab Đơn dùng `computeSinglesFinance` — quỹ tính riêng

---

## 8. Trang Thành viên (`/members`)

```
┌─────────────────────────────────────┐
│  Thành viên (8)                     │
│  [Form thêm thành viên mới]         │  ← chỉ admin
│                                     │
│  1  [C]  CHƯƠNG              12 trận  [✏️][🗑]  │
│  2  [K]  KIÊN                 8 trận  [✏️][🗑]  │
│  3  [T]  TIẾN                 6 trận  [✏️][🗑]  │
│  ...                                │
└─────────────────────────────────────┘
```

- Số thứ tự bên trái
- Avatar hình tròn với chữ cái đầu, màu xoay vòng 10 màu
- Dưới tên: "X trận" = tổng trận đôi + đơn (tính từ 2 query song song, đếm client-side)
- [✏️] Inline edit: tên thành viên → input → Enter/✓ lưu, Esc/✗ hủy
- [🗑] Disabled + tooltip nếu đã có trận; enabled nếu chưa có

---

## 9. Loading States

Mỗi trang có `loading.tsx` tương ứng — skeleton UI animate-pulse:
- `/matches/loading.tsx` — skeleton card trận (2 dòng màu xanh/đỏ nhạt)
- `/ranking/loading.tsx` — skeleton table rows
- `/finance/loading.tsx` — skeleton accordion rows
- `/members/loading.tsx` — skeleton rows với vòng tròn avatar

Skeleton hiện ngay lập tức (<50ms) khi navigate, trong khi server fetch data.

---

## 10. Luồng chính — Nhập trận đơn (admin)

```
Trang /matches (admin, tab Đánh đơn)
  → Nhấn [+ Thêm trận]
  → Dialog mở (SinglesMatchForm)
  → Chọn ngày (default: hôm nay)
  → Chọn Người chơi 1
  → Chọn điểm
  → Chọn Người chơi 2
  → Nhấn [Lưu trận]
    ├── Validation thất bại → lỗi inline, giữ form
    └── Thành công → insert singles_matches → đóng dialog → danh sách cập nhật
```

```
Admin muốn sửa 1 trận đơn
  → Nhấn [✏️ Sửa] trên card trận đơn
  → Navigate tới /singles/[id]/edit  (middleware chặn nếu chưa login)
  → Form SinglesMatchForm với defaultValues
  → Sửa → Lưu → revalidateTag('singles-matches') → redirect về /matches?type=singles
```
