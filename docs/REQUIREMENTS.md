# Requirements — Yêu cầu chức năng

## 1. Tổng quan

Web app quản lý đội tennis nội bộ (~10 thành viên), hỗ trợ cả **đánh đôi** và **đánh đơn**. Có 2 cấp quyền: **Public** (xem) và **Admin** (xem + ghi). Ưu tiên mobile-first.

---

## 2. Phân quyền

| Quyền | Public (chưa đăng nhập) | Admin (đã đăng nhập) |
|---|---|---|
| Xem bảng xếp hạng + vinh danh | ✅ | ✅ |
| Xem biểu đồ toàn đội | ✅ | ✅ |
| Xem biểu đồ cá nhân (modal) | ✅ | ✅ |
| Xem danh sách trận đấu | ✅ | ✅ |
| Xem tài chính | ✅ | ✅ |
| Xem danh sách thành viên | ✅ | ✅ |
| Nhập trận mới (đôi và đơn) | ❌ | ✅ |
| Sửa / Xóa trận (đôi và đơn) | ❌ | ✅ |
| Thêm / Sửa tên / Xóa thành viên | ❌ | ✅ |
| Đăng xuất | — | ✅ |

**Cơ chế**: Admin đăng nhập bằng mật khẩu chung (`ADMIN_PASSWORD` trong env var). Session lưu trong cookie httpOnly. Không cần tài khoản riêng từng người.

---

## 3. User Stories

### 3.1 Auth

| ID | User Story | Điều kiện chấp nhận |
|---|---|---|
| A1 | Là admin, tôi muốn đăng nhập bằng mật khẩu | Nhập đúng mật khẩu → session cookie được set → redirect về trang trước hoặc `/ranking` |
| A2 | Khi nhập sai mật khẩu, tôi thấy thông báo lỗi | Hiện "Mật khẩu không đúng", form không reset |
| A3 | Là admin, tôi muốn đăng xuất | Nhấn nút Đăng xuất → cookie xóa → quay về chế độ public |
| A4 | Public user thấy nút/form ghi bị ẩn | Các nút [Thêm trận], [Sửa], [Xóa], [Thêm thành viên], [Xóa thành viên] không hiển thị với public |
| A5 | Public user cố truy cập trực tiếp URL write → bị chặn | Server Action trả lỗi 403; trang redirect về `/login` |

### 3.2 Nhập kết quả trận đôi (admin only)

| ID | User Story | Điều kiện chấp nhận |
|---|---|---|
| M1 | Là admin, tôi muốn nhập kết quả 1 trận đôi mới | Form gồm: ngày, 4 người (2 cặp), tỷ số. Submit thành công → trận xuất hiện ngay trong danh sách |
| M2 | Là admin, tôi muốn sửa thông tin 1 trận đôi đã nhập | Chỉnh được ngày, người chơi, tỷ số. Sau khi lưu, ranking và tiền tự cập nhật |
| M3 | Là admin, tôi muốn xóa 1 trận đôi đã nhập | Có dialog xác nhận trước khi xóa |
| M4 | Bất kỳ ai cũng muốn xem danh sách trận đôi | Hiển thị theo ngày giảm dần, có số thứ tự trận trong ngày, màu nền phân biệt thắng/thua/hòa |

### 3.3 Nhập kết quả trận đơn (admin only)

| ID | User Story | Điều kiện chấp nhận |
|---|---|---|
| S1 | Là admin, tôi muốn nhập kết quả 1 trận đơn mới | Form gồm: ngày, 2 người (người chơi 1 và người chơi 2), tỷ số. Submit thành công → trận xuất hiện ngay |
| S2 | Là admin, tôi muốn sửa thông tin 1 trận đơn đã nhập | Trang `/singles/[id]/edit`, chỉnh được ngày, người chơi, tỷ số |
| S3 | Là admin, tôi muốn xóa 1 trận đơn đã nhập | Có dialog xác nhận trước khi xóa |
| S4 | Bất kỳ ai cũng muốn xem danh sách trận đơn | Qua tab "Đánh đơn" trên trang Trận đấu, màu nền phân biệt thắng/thua/hòa |

### 3.4 Xếp hạng (public)

| ID | User Story | Điều kiện chấp nhận |
|---|---|---|
| R1 | Bất kỳ ai cũng muốn xem bảng xếp hạng theo tháng | Có thể chọn tháng + năm bất kỳ |
| R2 | Bất kỳ ai cũng muốn xem bảng xếp hạng theo quý | Có thể chọn Q1–Q4 + năm bất kỳ |
| R3 | Bảng xếp hạng hiển thị đầy đủ thông tin | Cột: Hạng, Tên, Số trận (TR), TB điểm, Tổng điểm, T/H/B (Thắng/Hòa/Bại) |
| R4 | Thứ tự xếp hạng đúng theo quy tắc | TB → Tổng điểm → Ít trận hơn (xem BUSINESS_LOGIC.md §4) |
| R5 | Vinh danh người xếp hạng 1 và 2 | Hiển thị thẻ nổi bật ở đầu trang: 🥇 hạng 1 (cúp vàng), 🥈 hạng 2 (cúp bạc). Chỉ hiện khi kỳ đó có ≥ 1 trận |
| R6 | Xem biểu đồ cột so sánh điểm toàn đội | Bar chart: TB điểm và tổng điểm từng người trong kỳ, sắp xếp theo hạng |
| R7 | Xem biểu đồ mạng nhện so sánh đa chỉ số | Radar chart: so sánh TB điểm, Tổng điểm, Số trận, Tỷ lệ thắng của tất cả thành viên |
| R8 | Xem biểu đồ đường tiến triển điểm TB | Line chart nhiều đường (mỗi người 1 màu), trục X là thời gian trong kỳ |
| R9 | Xem chi tiết biểu đồ từng thành viên | Click tên trong bảng → modal hiện stats + biểu đồ cá nhân |
| R10 | Xếp hạng đơn và đôi tách riêng | Tab "Đánh đôi" / "Đánh đơn" trên trang Xếp hạng, bảng xếp hạng độc lập nhau |
| R11 | Màu nền dòng phân biệt nhóm xếp hạng | Hạng 1: amber-50; top 1/3: green-50; bottom 1/3: rose-50; giữa: trắng |

### 3.5 Tài chính (public)

| ID | User Story | Điều kiện chấp nhận |
|---|---|---|
| F1 | Bất kỳ ai cũng muốn xem bảng tổng tiền phải nộp theo tháng | Chọn tháng + năm, thấy từng người nộp bao nhiêu |
| F2 | Bất kỳ ai cũng muốn xem bảng tổng tiền phải nộp theo quý | Chọn quý + năm |
| F3 | Có thể xem chi tiết tiền từng trận của 1 người | Click vào tên → expand danh sách các trận + số tiền từng trận |
| F4 | Tài chính đơn và đôi tách riêng | Tab "Đánh đôi" / "Đánh đơn" trên trang Tài chính, quỹ tính độc lập |
| F5 | Hiển thị công thức tính tiền | Info card ở đầu bảng giải thích: thắng 0đ, thua = hiệu số × 10.000đ, hòa 5-5 = 10.000đ |

### 3.6 Quản lý thành viên

| ID | User Story | Điều kiện chấp nhận |
|---|---|---|
| P1 | Bất kỳ ai cũng muốn xem danh sách thành viên | Danh sách hiển thị công khai, có số thứ tự, avatar chữ cái đầu, số trận đã chơi |
| P2 | Là admin, tôi muốn thêm thành viên mới | Nhập tên → lưu → xuất hiện ngay trong danh sách chọn người ở form nhập trận |
| P3 | Là admin, tôi muốn xóa thành viên | Chỉ xóa được nếu thành viên đó **chưa có trận nào** (kể cả đơn lẫn đôi); nếu đã có trận thì hiện thông báo lỗi |
| P4 | Tên thành viên không được trùng | Validate khi thêm hoặc sửa, báo lỗi nếu trùng |
| P5 | Là admin, tôi muốn sửa tên thành viên | Inline edit trực tiếp trong danh sách: click ✏️ → input → Enter hoặc ✓ để lưu, Esc hoặc ✗ để hủy |

---

## 4. Validation Rules

### Form đăng nhập

| Rule | Thông báo lỗi |
|---|---|
| Mật khẩu sai | "Mật khẩu không đúng" |
| Mật khẩu để trống | "Vui lòng nhập mật khẩu" |

### Form nhập/sửa trận đôi

| Rule | Thông báo lỗi |
|---|---|
| 4 người phải khác nhau | "Mỗi người chỉ được tham gia 1 lần trong trận" |
| Tỷ số phải hợp lệ | "Tỷ số không hợp lệ. Chỉ chấp nhận: 6-0 đến 6-4 (hoặc ngược lại), hoặc 5-5" |
| Phải chọn đủ 4 người | "Vui lòng chọn đủ 4 người chơi" |
| Ngày không được để trống | "Vui lòng chọn ngày thi đấu" |

### Form nhập/sửa trận đơn

| Rule | Thông báo lỗi |
|---|---|
| 2 người phải khác nhau | "Hai người chơi phải khác nhau" |
| Tỷ số phải hợp lệ | "Tỷ số không hợp lệ. Chỉ chấp nhận: 6-0 đến 6-4 (hoặc ngược lại), hoặc 5-5" |
| Phải chọn đủ 2 người | "Vui lòng chọn đủ 2 người chơi" |
| Ngày không được để trống | "Vui lòng chọn ngày thi đấu" |

### Form thêm/sửa thành viên

| Rule | Thông báo lỗi |
|---|---|
| Tên không được để trống | "Vui lòng nhập tên thành viên" |
| Tên không được trùng | "Tên này đã tồn tại" |

---

## 5. Non-functional Requirements

| Yêu cầu | Chi tiết |
|---|---|
| **Mobile-first** | Toàn bộ UI phải dùng được tốt trên màn hình 390px (iPhone 14) |
| **Auth đơn giản** | Mật khẩu chung lưu trong env var; session cookie httpOnly; không cần tài khoản riêng |
| **Tốc độ** | Dùng `unstable_cache` (Next.js Data Cache) — lần đầu hit DB, các lần sau trả từ cache gần như instant; cache invalidate qua `revalidateTag` khi data thay đổi |
| **Ngôn ngữ UI** | Tiếng Việt |
| **Tiền tệ** | VND, format `40.000đ` |
| **Ngày tháng** | DD/MM/YYYY, kèm thứ (Thứ 2 → Chủ nhật) khi hiển thị trong danh sách |

---

## 6. Out of Scope

- Đăng ký tài khoản trong app
- Phân quyền nhiều cấp (chỉ có public / admin)
- Tie-break, nhiều séc
- Thông báo push / email
- Export Excel / PDF (có thể làm sau)
- Lịch sử chỉnh sửa (audit log)
