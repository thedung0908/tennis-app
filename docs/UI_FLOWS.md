# UI Flows — Các trang và luồng UX

## 1. Navigation

Bottom navigation bar (mobile), 4 tab. Khi đăng nhập admin, hiện badge "Admin" + nút đăng xuất ở header.

```
┌─────────────────────────────────────┐
│  CLB Tennis 123       [🔑 Admin ▾]  │  ← chỉ hiện khi là admin
│              [Nội dung]             │
│                                     │
├──────┬──────────┬──────────┬────────┤
│ 🏆   │  🎾      │  💰      │  👥   │
│Xếp   │ Trận     │ Tài      │ Thành  │
│hạng  │ đấu      │ chính    │ viên   │
└──────┴──────────┴──────────┴────────┘
```

- Route mặc định `/` redirect sang `/ranking`
- Header badge "Admin" khi đăng nhập → dropdown với nút "Đăng xuất"
- Public user: header không có badge

---

## 2. Trang Đăng nhập (`/login`)

### Wireframe

```
┌─────────────────────────────────────┐
│                                     │
│       CLB Tennis 123 Admin          │
│                                     │
│  Mật khẩu admin                     │
│  ┌─────────────────────────────┐    │
│  │ ••••••••             [👁]   │    │
│  └─────────────────────────────┘    │
│  ⚠ Mật khẩu không đúng             │  ← chỉ hiện khi sai
│                                     │
│         [Đăng nhập]                 │
│                                     │
│    ← Quay lại xem không cần đăng nhập
└─────────────────────────────────────┘
```

### Chi tiết

- Truy cập: link "Đăng nhập" ở footer hoặc `/login` trực tiếp
- Nếu đã là admin → redirect về `/ranking`
- Submit: Server Action so sánh password → set cookie → redirect
- Link "Quay lại" → về trang trước (hoặc `/ranking`)

---

## 3. Trang Xếp hạng (`/ranking`)

### Wireframe — Toàn trang

```
┌─────────────────────────────────────┐
│  Xếp hạng                           │
│  ┌──────────────┐ ┌───────────────┐ │
│  │ ● Tháng  ○ Quý│ │  Tháng 6 2026│ │
│  └──────────────┘ └───────────────┘ │
│                                     │
│  ── Vinh danh ─────────────────── ← chỉ hiện khi có ≥ 1 trận
│  ┌───────────────┐ ┌─────────────┐  │
│  │  🥇           │ │  🥈         │  │
│  │  HÀ           │ │  CHƯƠNG     │  │
│  │  TB: 5.60     │ │  TB: 5.17   │  │
│  │  5 trận       │ │  6 trận     │  │
│  └───────────────┘ └─────────────┘  │
│                                     │
│  ── Bảng xếp hạng ────────────────  │
│  # │ Tên    │TR│  TB  │Tổng│T│H│X  │
│  ──┼────────┼──┼──────┼────┼─┼─┼── │
│  1 │ HÀ   🔗│5 │ 5.60 │ 28 │3│1│1  │ ← click tên → modal
│  2 │CHƯƠNG🔗│6 │ 5.17 │ 31 │3│0│3  │
│  3 │ KIÊN 🔗│4 │ 5.00 │ 20 │2│1│1  │
│  ...                               │
│                                     │
│  ── Biểu đồ toàn đội ─────────────  │
│                                     │
│  [Cột điểm] [Mạng nhện] [Đường TB]  │ ← tabs chuyển biểu đồ
│                                     │
│  ┌─────────────────────────────┐    │
│  │    [Bar Chart / Radar /     │    │
│  │       Line Chart]           │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Chi tiết — Bộ lọc kỳ

- Radio Tháng / Quý + dropdown năm + dropdown tháng (hoặc quý)
- Mặc định: tháng hiện tại
- Thay đổi kỳ → cập nhật bảng + vinh danh + tất cả biểu đồ

### Chi tiết — Bảng xếp hạng

- Cột: `#`, `Tên`, `TR` (số trận), `TB` (điểm TB), `Tổng`, `T/H/B`
- Chỉ hiện thành viên có ≥ 1 trận trong kỳ
- Tên có underline/highlight nhẹ để báo "có thể click"

### Chi tiết — Khu vực Vinh danh (Podium)

- Chỉ render khi kỳ có ≥ 1 trận
- 2 thẻ nằm ngang: 🥇 trái (hạng 1), 🥈 phải (hạng 2)
- Thẻ vàng (hạng 1) to hơn / nổi bật hơn thẻ bạc
- Mỗi thẻ: emoji cúp + tên + TB điểm + số trận

### Chi tiết — Biểu đồ toàn đội (3 tabs)

| Tab | Loại | Nội dung |
|---|---|---|
| **Cột điểm** | Bar chart | 2 nhóm cột mỗi người: TB điểm (màu chính) + Tổng điểm (scale phụ) |
| **Mạng nhện** | Radar chart | 4 trục: TB điểm, Tổng điểm, Số trận, Tỷ lệ thắng (%). Mỗi người 1 đường |
| **Đường TB** | Line chart | Trục X = thời gian trong kỳ (ngày với tháng / tháng với quý). Mỗi người 1 đường màu riêng. Trục Y = điểm TB tích lũy |

- **Không có sự khác biệt** giữa public và admin (chỉ đọc)

---

### Wireframe — Modal chi tiết thành viên

Mở khi click vào tên trong bảng xếp hạng.

```
┌─────────────────────────────────────┐
│  HÀ — Tháng 6/2026          [✕]    │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ │
│  │ TB   │ │Tổng  │ │Trận  │ │T/H/B│ │
│  │ 5.60 │ │  28  │ │  5  │ │3/1/1│ │
│  └──────┘ └──────┘ └──────┘ └────┘ │
│                                     │
│  Tiến triển điểm TB trong kỳ        │
│  ┌─────────────────────────────┐    │
│  │   [Line chart — 1 đường]   │    │
│  │   trục X: ngày thi đấu     │    │
│  │   trục Y: điểm TB tích lũy │    │
│  └─────────────────────────────┘    │
│                                     │
│  Điểm từng ngày thi đấu             │
│  ┌─────────────────────────────┐    │
│  │   [Bar chart — theo ngày]  │    │
│  │   cột = tổng điểm ngày đó  │    │
│  └─────────────────────────────┘    │
│                                     │
│  Danh sách trận (5 trận)            │
│  08/06 HÀ+HƯNG 6-3 KIÊN+CHƯƠNG +6 │
│  12/06 HÀ+TÙNG 5-5 HẢI+DŨNG   +5 │
│  ...                               │
└─────────────────────────────────────┘
```

**Chi tiết modal:**
- Fetch data khi mở (lazy): ranking stats + time-series của riêng người đó trong kỳ đang xem
- Line chart: 1 đường duy nhất (người đó), thấy rõ xu hướng tăng/giảm
- Bar chart: điểm tổng theo từng ngày thi đấu
- Danh sách trận: ngày + đội + tỷ số + điểm nhận được hôm đó

---

## 4. Trang Trận đấu (`/matches`)

### Wireframe — Public (chưa đăng nhập)

```
┌─────────────────────────────────────┐
│  Trận đấu                           │  ← không có nút [+ Thêm trận]
│                                     │
│  ── 18/06/2026 ───────────────────  │
│  ┌─────────────────────────────┐    │
│  │ CHƯƠNG + KIÊN  6 - 3  TIẾN + DŨNG│
│  └─────────────────────────────┘    │  ← không có nút Sửa/Xóa
│  ┌─────────────────────────────┐    │
│  │ HÀ + HƯNG  5 - 5  HẢI + TÙNG   │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Wireframe — Admin (đã đăng nhập)

```
┌─────────────────────────────────────┐
│  Trận đấu          [+ Thêm trận]    │  ← nút thêm xuất hiện
│                                     │
│  ── 18/06/2026 ───────────────────  │
│  ┌─────────────────────────────┐    │
│  │ CHƯƠNG + KIÊN  6 - 3  TIẾN + DŨNG│
│  │                      [Sửa][Xóa]  │  ← nút xuất hiện
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

- Nhóm theo ngày, sắp xếp ngày giảm dần
- Nút [Sửa] → trang `/matches/[id]/edit` (redirect `/login` nếu public)
- Nút [Xóa] → dialog xác nhận

### Wireframe — Form thêm/sửa trận (admin only)

```
┌─────────────────────────────────────┐
│  Thêm trận mới                      │
│                                     │
│  Ngày thi đấu                       │
│  ┌─────────────────────────────┐    │
│  │  18/06/2026          [📅]   │    │
│  └─────────────────────────────┘    │
│                                     │
│  Đội 1                              │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ CHƯƠNG    ▼  │ │ KIÊN      ▼  │  │
│  └──────────────┘ └──────────────┘  │
│                                     │
│  Tỷ số Đội 1                        │
│  ┌──────────────────────────────┐   │
│  │  6                        ▼  │   │
│  └──────────────────────────────┘   │
│                                     │
│  Đội 2                              │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ TIẾN      ▼  │ │ DŨNG      ▼  │  │
│  └──────────────┘ └──────────────┘  │
│                                     │
│  Tỷ số Đội 2                        │
│  ┌──────────────────────────────┐   │
│  │  3                        ▼  │   │
│  └──────────────────────────────┘   │
│                                     │
│  [Hủy]              [Lưu trận]      │
└─────────────────────────────────────┘
```

**Lưu ý UX form:**
- Dropdown tỷ số chỉ hiện các giá trị hợp lệ (0–6), validate tổ hợp khi submit
- Dropdown người chơi: loại trừ người đã được chọn ở ô khác
- Trên mobile: dùng native `<select>` hoặc shadcn `Select`

---

## 5. Trang Tài chính (`/finance`)

### Wireframe

```
┌─────────────────────────────────────┐
│  Tài chính                          │
│  ┌──────────────┐ ┌───────────────┐ │
│  │ ● Tháng  ○ Quý│ │  Tháng 6 2026│ │
│  └──────────────┘ └───────────────┘ │
│                                     │
│  Tên        │  Tiền nộp            │
│  ──────────────────────────────── │
│  CHƯƠNG     │  70.000đ         [▼] │
│    18/06 CHƯƠNG+HƯNG vs HÀ+DŨNG 2-6 → 40.000đ
│    18/06 HÀ+HƯNG vs KIÊN+CHƯƠNG 6-3 → 30.000đ
│  TIẾN       │  30.000đ         [▼] │
│  DŨNG       │  30.000đ         [▼] │
│  HƯNG       │  40.000đ         [▼] │
│  ...                               │
│                                     │
│  Tổng quỹ: 200.000đ               │
└─────────────────────────────────────┘
```

- Bộ lọc kỳ giống trang Xếp hạng
- Mỗi hàng có thể expand → xem chi tiết từng trận
- Dòng cuối: tổng tiền quỹ của cả đội trong kỳ
- **Không có sự khác biệt** giữa public và admin (chỉ đọc)

---

## 6. Trang Thành viên (`/members`)

### Wireframe — Public

```
┌─────────────────────────────────────┐
│  Thành viên                         │
│                                     │
│  ── Danh sách (8) ────────────────  │
│  CHƯƠNG                             │  ← không có nút xóa
│  DŨNG                               │
│  HÀ                                 │
│  ...                               │
└─────────────────────────────────────┘
```

### Wireframe — Admin

```
┌─────────────────────────────────────┐
│  Thành viên                         │
│                                     │
│  ┌─────────────────────────────┐    │  ← form thêm chỉ hiện với admin
│  │ Tên thành viên mới          │    │
│  └─────────────────────────────┘    │
│  [+ Thêm]                           │
│                                     │
│  ── Danh sách (8) ────────────────  │
│  CHƯƠNG                       [🗑]  │
│  DŨNG                         [🗑]  │
│  HÀ                           [🗑]  │
│  ...                               │
└─────────────────────────────────────┘
```

- Form thêm + nút xóa chỉ render khi `isAdmin() === true` (kiểm tra phía server)
- Nút xóa (🗑): disabled nếu thành viên đã có trận, kèm tooltip "Đã có trận đấu, không thể xóa"
- Tên hiển thị theo thứ tự alphabet

---

## 7. Luồng Auth — Đăng nhập Admin

```
Public user nhấn link "Đăng nhập" (footer hoặc URL /login)
  → Trang /login
  → Nhập mật khẩu → Submit
    ├── Sai → hiện lỗi "Mật khẩu không đúng", giữ nguyên form
    └── Đúng → set cookie httpOnly → redirect /ranking
              → Header hiện badge "Admin"
```

## 8. Luồng Auth — Đăng xuất

```
Admin nhấn badge "Admin" ở header → dropdown
  → Nhấn "Đăng xuất"
  → Server Action xóa cookie
  → Redirect /ranking (chế độ public)
  → Header không còn badge
```

## 9. Luồng chính — Nhập trận đấu (admin)

```
Trang /matches (đã đăng nhập admin)
  → Nhấn [+ Thêm trận]
  → Form mở (dialog)
  → Chọn ngày (default: hôm nay)
  → Chọn 4 người (2 cặp)
  → Chọn tỷ số
  → Nhấn [Lưu trận]
    ├── Validation thất bại → lỗi inline, giữ form
    └── Thành công → insert DB → đóng dialog → danh sách cập nhật
```

## 10. Luồng chính — Xem xếp hạng theo kỳ

```
Trang /ranking (mặc định: tháng hiện tại)
  → Nhấn radio [Quý]
  → Dropdown đổi sang chọn quý (Q1/Q2/Q3/Q4)
  → Nhấn dropdown → chọn Q2
  → Bảng reload với dữ liệu Q2 năm hiện tại
  → (Tuỳ chọn) đổi năm trong dropdown năm
```
