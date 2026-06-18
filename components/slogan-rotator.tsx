'use client';

import { useEffect, useState } from 'react';

const SLOGANS = [
  // Sáng sớm + hết mình
  'Cà phê có thể đợi, bóng thì không',
  'Hàng xóm chưa dậy, bóng đã căng',
  '5h sáng: nơi các vợt thủ tụ họp',
  'Thua hôm nay — mai 5h vẫn có mặt',
  'Rẻ hơn cà phê, khỏe hơn rượu, vui hơn họp',
  // Tự trào
  'Không ai thắng — chỉ có người thua ít hơn',
  'Chơi 2 tiếng để tranh luận 4 tiếng về cú đánh đó',
  'Sau 3 trận thua: "Thôi về". Sau 1 trận thắng: "Đánh thêm!"',
  'Đánh xong về ngủ tiếp, ai mà biết',
  // Hơi tục
  'Vợ hỏi đi đâu 5h sáng: "Ra sân em ơi" — không phải sân nào lạ nha',
  '5h sáng, quần đùi, vợt cầm tay — người tử tế cả đấy',
  'Bóng căng, người cũng căng — nhưng vẫn đến',
  '5h sáng: chứng minh cái gì đó về bản thân... chưa rõ là gì',
  // Trêu thành viên — thay tên cho đúng CLB
  'CHƯƠNG thua 3 trận liên tiếp — vẫn ra sân đúng giờ nhất đội',
  'Cú smash của TÀO: đẹp lắm, tiếc là ra ngoài',
  'TÚ cam kết "lần này chắc thắng" — vẫn thua đều',
  'KIÊN đánh hay nhất đội... khi không có ai xem',
  'HÀ đánh bóng như múa, tiếc là múa ở sân bên',
  'DŨNG đoa như bắn súng, mỗi tội là súng tịt ngòi',
];

export function SloganRotator() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => {
          let next = Math.floor(Math.random() * SLOGANS.length);
          if (SLOGANS.length > 1 && next === i) next = (i + 1) % SLOGANS.length;
          return next;
        });
        setVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="text-[10px] text-muted-foreground italic leading-tight transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {SLOGANS[index]}
    </span>
  );
}
