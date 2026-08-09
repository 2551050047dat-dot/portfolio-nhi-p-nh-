# Wedding Photography Website

Website dịch vụ nhiếp ảnh đám cưới với giao diện hiện đại, tối ưu cho trải nghiệm người dùng trên mobile, tablet và desktop.

## Công nghệ sử dụng
- HTML5 / Semantic HTML
- Tailwind CSS v4
- JavaScript ES6+
- localStorage
- JSON nội bộ

## Cấu trúc dự án
```text
.
├─ index.html
├─ pages/
│  ├─ about.html
│  ├─ booking.html
│  ├─ contact.html
│  ├─ portfolio.html
│  ├─ pricing.html
│  └─ services.html
├─ css/
│  ├─ dist/
│  │  └─ output.css
│  ├─ responsive.css
│  └─ style.css
├─ src/
│  └─ input.css
├─ js/
│  ├─ booking.js
│  ├─ gallery.js
│  ├─ main.js
│  └─ pricing.js
├─ data/
│  └─ records.json
├─ images/
├─ package.json
├─ README.md
└─ .gitignore
```

## Cách chạy dự án
```bash
npm install
npm run dev
```

Sau đó mở trình duyệt tại localhost đang được http-server hoặc dùng Live Server trong VS Code.

## Tính năng chính
- Portfolio filter theo chủ đề
- Lightbox modal để xem ảnh lớn
- Booking form validation và lưu dữ liệu vào localStorage
- Price calculator tính tổng chi phí gói dịch vụ
- Responsive layout ở 3 breakpoint
- CTA và thông tin studio rõ ràng

## Phân công 3 thành viên
| Thành viên | Nhiệm vụ |
| --- | --- |
| Thành viên 1 | Home, About, Design System, HTML semantic |
| Thành viên 2 | Portfolio, Gallery Filter, Lightbox, responsive |
| Thành viên 3 | Booking form, Pricing, README, validation, localStorage |

## Nhật ký commit
- 2026-08-09: Khởi tạo cấu trúc dự án và chuẩn hóa layout
- 2026-08-09: Thêm Tailwind v4 design tokens và cấu hình build
- 2026-08-09: Hoàn thiện portfolio filter và lightbox
- 2026-08-09: Hoàn thiện booking form validation và pricing calculator
- 2026-08-09: Chuẩn bị README và review hiệu năng

## Lưu ý
Dự án này được xây dựng theo chuẩn thiết kế web hiện đại, hướng tới yêu cầu của bài tập lớn và tối ưu cho đánh giá của giảng viên.
