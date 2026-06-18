# Business Logic — Luật và Công thức

## 1. Định dạng trận đấu

- **Thể thức**: Đánh đôi (doubles) — luôn 2 vs 2
- **Séc**: 1 séc duy nhất mỗi trận
- **Kết thúc**: Thắng khi đạt 6 game với cách biệt ≥ 2; hoặc hòa khi 5-5
- **Không có**: tie-break, advantage, đánh đến 7

### Tỷ số hợp lệ (exhaustive list)

```
Đội 1 thắng: 6-0, 6-1, 6-2, 6-3, 6-4
Đội 2 thắng: 0-6, 1-6, 2-6, 3-6, 4-6
Hòa:         5-5
```

Constraint DB: `(score1=6 AND score2 IN(0,1,2,3,4)) OR (score2=6 AND score1 IN(0,1,2,3,4)) OR (score1=5 AND score2=5)`

---

## 2. Tính điểm (ranking points)

Mỗi người trong trận nhận số điểm bằng số game **đội mình** ghi được.

```
Trận: Team1 (p1, p2) vs Team2 (p3, p4), tỷ số score1 - score2

→ p1, p2 nhận: score1 điểm mỗi người
→ p3, p4 nhận: score2 điểm mỗi người
```

**Ví dụ:**
- CHƯƠNG, KIÊN thắng TIẾN, DŨNG 6-3 → CHƯƠNG +6, KIÊN +6, TIẾN +3, DŨNG +3
- HÀ, LINH hòa HẢI, TÙNG 5-5 → cả 4 người +5

---

## 3. Tính tiền quỹ

### Quy tắc

```
Nếu có đội thắng:
  Đội THUA mỗi người nộp = (score_thắng - score_thua) × 10.000đ
  Đội THẮNG không nộp tiền

Nếu hòa (5-5):
  Tất cả 4 người mỗi người nộp = 10.000đ (cố định)
```

### Bảng tham chiếu nhanh

| Tỷ số | Đội thắng | Đội thua (mỗi người) |
|---|---|---|
| 6-0 | 0đ | 60.000đ |
| 6-1 | 0đ | 50.000đ |
| 6-2 | 0đ | 40.000đ |
| 6-3 | 0đ | 30.000đ |
| 6-4 | 0đ | 20.000đ |
| 5-5 | 10.000đ | 10.000đ |

### Công thức code (TypeScript)

```typescript
function calcMoney(score1: number, score2: number): {
  team1_per_person: number;
  team2_per_person: number;
} {
  if (score1 === 5 && score2 === 5) {
    return { team1_per_person: 10000, team2_per_person: 10000 };
  }
  if (score1 > score2) {
    return { team1_per_person: 0, team2_per_person: (score1 - score2) * 10000 };
  }
  return { team1_per_person: (score2 - score1) * 10000, team2_per_person: 0 };
}
```

---

## 4. Tính xếp hạng

### Chỉ số theo kỳ (tháng hoặc quý)

```
Tổng điểm  = Σ điểm các trận trong kỳ
Số trận    = số trận đã đánh trong kỳ
TB         = Tổng điểm / Số trận  (làm tròn 2 chữ số thập phân)
Thắng      = số trận đội mình ghi 6 game
Hòa        = số trận tỷ số 5-5
Bại        = Số trận - Thắng - Hòa
```

### Thứ tự xếp hạng

1. TB cao hơn → xếp trên
2. Nếu TB bằng nhau → Tổng điểm cao hơn → xếp trên
3. Nếu vẫn bằng → Số trận ít hơn → xếp trên (ít trận mà TB cao là giỏi hơn)

### Điều kiện tối thiểu để xếp hạng

- Cần đánh **ít nhất 1 trận** trong kỳ mới xuất hiện trên bảng xếp hạng

---

## 5. Kỳ thống kê

### Tháng
- Tháng 1 đến tháng 12 theo lịch dương
- Lọc: `date >= first_day_of_month AND date <= last_day_of_month`

### Quý
- Q1: tháng 1-3
- Q2: tháng 4-6
- Q3: tháng 7-9
- Q4: tháng 10-12

---

## 6. Ví dụ tính tổng hợp (kiểm tra logic)

**Buổi chơi 27/08:**

| Trận | Tỷ số | Điểm | Tiền nộp |
|---|---|---|---|
| CHƯƠNG+KIÊN vs TIẾN+DŨNG | 6-3 | CHƯƠNG+6, KIÊN+6, TIẾN+3, DŨNG+3 | TIẾN, DŨNG mỗi người 30.000đ |
| CHƯƠNG+HƯNG vs HÀ+DŨNG | 2-6 | CHƯƠNG+2, HƯNG+2, HÀ+6, DŨNG+6 | CHƯƠNG, HƯNG mỗi người 40.000đ |
| HÀ+HƯNG vs KIÊN+CHƯƠNG | 6-3 | HÀ+6, HƯNG+6, KIÊN+3, CHƯƠNG+3 | KIÊN, CHƯƠNG mỗi người 30.000đ |

**Kết quả CHƯƠNG sau buổi này:** Điểm: 6+2+3=11, Tiền: 0+40.000+30.000=70.000đ
