/* Dữ liệu mẫu — thay bằng API thật khi tích hợp backend */
window.HCTD_DATA = {
  categories: {
    yte: 'Y tế',
    thientai: 'Thiên tai',
    giaoduc: 'Giáo dục',
    congdong: 'Cộng đồng'
  },

  programs: [
    {
      id: 'ao-am', cat: 'giaoduc', urgent: false,
      title: 'Áo ấm cho em — mùa đông vùng cao',
      org: 'Chữ thập đỏ tỉnh Hà Giang',
      img: 'Emages/minh-hoa/tham-hoi-mua-dong.jpg',
      raised: 742500000, goal: 1000000000, days: 12, donors: 3184
    },
    {
      id: 'lu-mien-trung', cat: 'thientai', urgent: true,
      title: 'Khắc phục hậu quả lũ quét miền Trung',
      org: 'Trung ương Hội Chữ thập đỏ',
      img: 'Emages/minh-hoa/cuu-tro-lu-lut.jpg',
      raised: 3260000000, goal: 5000000000, days: 5, donors: 12450
    },
    {
      id: 'giot-hong', cat: 'yte', urgent: false,
      title: 'Giọt hồng yêu thương — ngân hàng máu',
      org: 'Ban chỉ đạo Hiến máu tình nguyện',
      img: 'Emages/minh-hoa/giot-hong-se-chia.jpg',
      raised: 418000000, goal: 600000000, days: 30, donors: 1920
    },
    {
      id: 'trai-tim', cat: 'yte', urgent: true,
      title: 'Phẫu thuật tim cho trẻ em có hoàn cảnh khó khăn',
      org: 'Quỹ Nhịp tim Việt',
      img: 'Emages/minh-hoa/hien-mau-cuu-nguoi.jpg',
      raised: 1150000000, goal: 2400000000, days: 21, donors: 5402
    },
    {
      id: 'tu-sach', cat: 'giaoduc', urgent: false,
      title: 'Tủ sách & học bổng cho học sinh nghèo vượt khó',
      org: 'Chữ thập đỏ tỉnh Điện Biên',
      img: 'Emages/minh-hoa/trao-tang-truong-hoc.jpg',
      raised: 286000000, goal: 450000000, days: 45, donors: 1033
    },
    {
      id: 'bua-com', cat: 'congdong', urgent: false,
      title: 'Bữa cơm nhân ái tại các bệnh viện tuyến cuối',
      org: 'CLB Thiện nguyện Bàn Tay Ấm',
      img: 'Emages/minh-hoa/trao-qua-ho-dan.jpg',
      raised: 198000000, goal: 300000000, days: 60, donors: 2210
    },
    {
      id: 'nha-tinh-thuong', cat: 'congdong', urgent: false,
      title: 'Mái ấm Chữ thập đỏ — 100 ngôi nhà tình thương',
      org: 'Chữ thập đỏ tỉnh Quảng Bình',
      img: 'Emages/minh-hoa/nha-tinh-thuong.jpg',
      raised: 2040000000, goal: 6000000000, days: 90, donors: 4876
    }
  ],

  board: {
    personal: [
      { name: 'Nguyễn Minh Anh', sub: 'Hà Nội · 42 lần ủng hộ', amount: 486000000 },
      { name: 'Trần Quốc Bảo', sub: 'TP. Hồ Chí Minh · 31 lần', amount: 392500000 },
      { name: 'Lê Thu Hà', sub: 'Đà Nẵng · 58 lần', amount: 318000000 },
      { name: 'Phạm Gia Huy', sub: 'Hải Phòng · 19 lần', amount: 205000000 },
      { name: 'Đỗ Thảo Vy', sub: 'Cần Thơ · 27 lần', amount: 176400000 },
      { name: 'Hoàng Đức Long', sub: 'Nghệ An · 12 lần', amount: 150000000 },
      { name: 'Vũ Ngọc Mai', sub: 'Huế · 33 lần', amount: 128800000 },
      { name: 'Bùi Tuấn Kiệt', sub: 'Quảng Ninh · 9 lần', amount: 96000000 }
    ],
    org: [
      { name: 'Tập đoàn Mặt Trời Hồng', sub: 'Doanh nghiệp · 6 chương trình', amount: 5200000000 },
      { name: 'Ngân hàng Sông Xanh', sub: 'Tài chính · 4 chương trình', amount: 3850000000 },
      { name: 'Công ty CP Lúa Vàng', sub: 'Nông nghiệp · 5 chương trình', amount: 2760000000 },
      { name: 'Quỹ Hạt Giống Xanh', sub: 'Quỹ xã hội · 9 chương trình', amount: 1940000000 },
      { name: 'CLB Thiện nguyện Bàn Tay Ấm', sub: 'Câu lạc bộ · 12 chương trình', amount: 1210000000 },
      { name: 'Hiệp hội Doanh nhân Trẻ Miền Trung', sub: 'Hiệp hội · 3 chương trình', amount: 980000000 },
      { name: 'Công ty TNHH Dược Phúc An', sub: 'Y dược · 2 chương trình', amount: 745000000 },
      { name: 'Trường ĐH Bình Minh', sub: 'Giáo dục · 4 chương trình', amount: 512000000 }
    ]
  },

  // Bản đồ cứu trợ — x/y: vị trí theo % trên ảnh Emages/map01-2000.webp
  relief: {
    need: [
      { name: 'Hà Giang', x: 44, y: 8.5, count: 9, note: 'Rét đậm, thiếu áo ấm' },
      { name: 'Lào Cai – Yên Bái', x: 37, y: 13, count: 14, note: 'Sạt lở đất sau mưa lớn', urgent: true },
      { name: 'Thanh Hóa', x: 45, y: 23.5, count: 6, note: 'Ngập úng cục bộ' },
      { name: 'Nghệ An', x: 41.5, y: 29, count: 11, note: 'Lũ ống vùng núi phía Tây' },
      { name: 'Quảng Bình', x: 49, y: 38, count: 18, note: 'Ngập sâu, 4 xã bị cô lập', urgent: true },
      { name: 'Quảng Trị – Huế', x: 54.5, y: 43.5, count: 22, note: 'Lũ quét, thiếu nước sạch', urgent: true },
      { name: 'Quảng Nam – Quảng Ngãi', x: 61.5, y: 53, count: 23, note: 'Sạt lở, hư hỏng nhà cửa' },
      { name: 'Gia Lai', x: 61.5, y: 61.5, count: 6, note: 'Hạn hán, thiếu nước sinh hoạt' },
      { name: 'Khánh Hòa', x: 67.5, y: 67.5, count: 7, note: 'Triều cường, sạt lở bờ biển' },
      { name: 'Bến Tre', x: 52, y: 85, count: 7, note: 'Xâm nhập mặn' },
      { name: 'Cà Mau', x: 43.5, y: 92, count: 5, note: 'Sạt lở bờ biển' }
    ],
    standby: [
      { name: 'Hà Nội', x: 48, y: 17, people: 420, teams: 12 },
      { name: 'Nghệ An', x: 47, y: 30.5, people: 260, teams: 8 },
      { name: 'Đà Nẵng', x: 60, y: 48.75, people: 380, teams: 11 },
      { name: 'Bình Định', x: 67, y: 59, people: 190, teams: 6 },
      { name: 'Lâm Đồng', x: 62, y: 72, people: 140, teams: 4 },
      { name: 'TP. Hồ Chí Minh', x: 55.5, y: 78, people: 540, teams: 15 },
      { name: 'Cần Thơ', x: 46, y: 87, people: 230, teams: 7 }
    ]
  }
};
