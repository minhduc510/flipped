# Flipped Song Ngữ - Đọc Truyện & Học Tiếng Anh

Website đọc truyện song ngữ Anh - Việt, được thiết kế thông minh giúp người học tiếng Anh dễ dàng trau dồi từ vựng và nâng cao kỹ năng đọc hiểu thông qua tiểu thuyết *Flipped*.

## Tính Năng Nổi Bật

- **Đọc Song Ngữ:** Hỗ trợ nhiều chế độ đọc (song song, chia tab) giúp bạn dễ dàng đối chiếu bản tiếng Anh và bản dịch tiếng Việt.
- **Tùy Chỉnh Giao Diện:** 
  - Đổi màu nền đa dạng với các chủ đề: Sáng (Light), Tối (Dark), Sepia, Rừng Rậm (Forest).
  - Tùy chỉnh kích thước chữ (Font Size) và khoảng cách dòng (Line Height) để có trải nghiệm đọc tốt nhất.
- **Học Từ Vựng (Sổ Tay Từ Vựng):** Khả năng chọn từ, lưu từ vựng và tra cứu nhanh chóng trong quá trình đọc.
- **Chuyển Chương Linh Hoạt:** Giao diện điều khiển (Control Panel) tiện dụng giúp chọn chương dễ dàng.

## Cài Đặt & Khởi Chạy Cục Bộ (Local Development)

Dự án được xây dựng với [React](https://react.dev/) và [Vite](https://vitejs.dev/).

### Yêu cầu hệ thống:
- Node.js (phiên bản 18+ khuyến nghị)

### Các bước cài đặt:

1. **Clone dự án về máy:**
   ```bash
   git clone https://github.com/minhduc510/flipped.git
   cd flipped
   ```

2. **Cài đặt các thư viện:**
   ```bash
   npm install
   ```

3. **Khởi chạy môi trường phát triển (Dev server):**
   ```bash
   npm run dev
   ```
   Sau đó mở trình duyệt tại địa chỉ: `http://localhost:5173`

4. **Build dự án (Production):**
   ```bash
   npm run build
   ```

## Công Nghệ Sử Dụng

- **Framework/Library:** React, Vite, React Router
- **Lưu trữ offline:** IndexedDB thông qua Dexie
- **Biểu đồ học tập:** Recharts
- **Icons:** `lucide-react`
- **Ngôn ngữ:** JavaScript (ES6+), HTML, CSS

## Bộ Chức Năng Học Tập

- **SRS Flashcards:** ôn từ đến hạn với bốn mức ghi nhớ.
- **Quiz theo chương:** câu hỏi trắc nghiệm lấy từ ngữ cảnh thật.
- **Cloze Reading:** điền từ bị ẩn trong đoạn văn.
- **Listening & Dictation:** nghe từng câu bằng Web Speech API và chép chính tả.
- **Dashboard:** theo dõi chương đã đọc, điểm luyện tập và lịch ôn.

Chi tiết quá trình triển khai được ghi trong thư mục [`docs`](./docs).

## Tác Giả / Bản Quyền

- Giao diện và code dự án được phát triển riêng cho việc học tiếng Anh.
- Tác phẩm gốc *Flipped* thuộc bản quyền của tác giả Wendelin Van Draanen.
