# CLB Tennis 123 App — Claude Harness

## Mục đích dự án

Web app quản lý đội tennis chuyên đánh đôi: nhập kết quả trận đấu, tính điểm xếp hạng, tính tiền quỹ theo tháng và quý.

## Tài liệu tham chiếu

Đọc các file này theo thứ tự trước khi bắt đầu bất kỳ task nào:

| File | Nội dung |
|---|---|
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | Yêu cầu chức năng, user stories, constraints |
| [docs/BUSINESS_LOGIC.md](docs/BUSINESS_LOGIC.md) | Luật tennis, công thức tính điểm và tiền |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Database schema, SQL, sample data |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tech stack, cấu trúc project, deployment |
| [docs/UI_FLOWS.md](docs/UI_FLOWS.md) | Các trang, luồng UX, wireframe |

## Quy tắc bất biến (không thay đổi khi implement)

1. **Không lưu điểm hoặc tiền vào database** — tính realtime từ bảng `matches` và `singles_matches`
2. **Hỗ trợ cả đôi lẫn đơn** — trận đôi có đúng 4 người (2 cặp, bảng `matches`); trận đơn có đúng 2 người (bảng `singles_matches`). Xếp hạng và tài chính tính riêng từng loại qua tab Đôi/Đơn (`?type=singles`)
3. **Tỷ số hợp lệ** — chỉ: 6-0, 6-1, 6-2, 6-3, 6-4, 5-5 (không tie-break, không quá 6) — áp dụng cho cả đôi và đơn
4. **Auth đơn giản** — public xem được tất cả; thao tác ghi (thêm/sửa/xóa trận, thành viên) yêu cầu đăng nhập bằng mật khẩu admin chung (`ADMIN_PASSWORD` trong env var). Session lưu bằng cookie httpOnly, không dùng Supabase Auth.
5. **Mobile-first** — form nhập liệu phải dùng được tốt trên điện thoại

## Quy ước code

- Ngôn ngữ UI: **tiếng Việt** (nhãn, thông báo, tiêu đề)
- Tiền tệ: **VND**, hiển thị dạng `40.000đ` (dấu chấm phân cách nghìn)
- Ngày tháng: **DD/MM/YYYY**
- Điểm TB: làm tròn **2 chữ số thập phân**
- Component library: **shadcn/ui** — không tự viết UI primitives
- Không comment code trừ khi logic phức tạp thực sự cần giải thích

## Workflow phát triển

```
1. Đọc CLAUDE.md + file docs liên quan đến task
2. Kiểm tra DATA_MODEL trước khi viết query
3. Kiểm tra BUSINESS_LOGIC trước khi viết hàm tính toán
4. Chạy type-check sau mỗi file: npx tsc --noEmit
5. Test trên mobile viewport trước khi báo hoàn thành
```

## Trạng thái dự án

- **Giai đoạn**: Sẵn sàng implement — Tài liệu thiết kế hoàn chỉnh
- **Ưu tiên implement**: Nhập kết quả → Xếp hạng → Tài chính → Quản lý thành viên
- **Stack**: Next.js 15 + Supabase + shadcn/ui, deploy Vercel
- **Cập nhật lần cuối**: 2026-06-18
