# TÀI LIỆU YÊU CẦU DỰ ÁN: WEBSITE HỌC TIẾNG ANH QUA TIỂU THUYẾT "FLIPPED"

Tài liệu này được biên soạn cho người học Tiếng Anh trình độ TOEIC ~550, mong muốn nâng cao vốn từ vựng, ngữ pháp tự nhiên thông qua việc đọc song ngữ cuốn tiểu thuyết nổi tiếng **"Flipped"** (Wendelin Van Draanen).

---

## 1. MỤC TIÊU DỰ ÁN
* **Đọc song ngữ thông minh**: Hỗ trợ chuyển đổi linh hoạt giữa bản gốc tiếng Anh và bản dịch tiếng Việt mượt mà, tự nhiên, bám sát bối cảnh.
* **Tích hợp học từ vựng & ngữ pháp**: Tổng hợp các từ vựng đắt giá, cấu trúc ngữ pháp thông dụng, thực tế và có thể ứng dụng trong đời sống (đặc biệt phù hợp cho người học TOEIC 550 muốn nâng trình tiếp xúc tiếng Anh thực tế).
* **Trải nghiệm đọc tối ưu**: Giao diện trực quan, dễ nhìn, font chữ Roboto hiện đại, hỗ trợ đổi màu giao diện (Theme) để không mỏi mắt khi đọc lâu.

---

## 2. PHÂN TÍCH NGUỒN TÀI LIỆU & XỬ LÝ DỮ LIỆU
* **Link PDF gốc**: [Flipped PDF](https://ramblesofabookwormblog.wordpress.com/wp-content/uploads/2018/12/Wendelin_Van_Draanen_-_Flipped.pdf)
* **Quy trình xử lý dữ liệu**:
  1. Tải và giải nén văn bản từ tệp PDF gốc.
  2. Phân chia nội dung theo 14 chương của tác phẩm (mỗi chương được chia nhỏ thành các đoạn văn - paragraphs).
  3. Dịch nghĩa tiếng Việt cho từng đoạn văn, đảm bảo ngôn từ tự nhiên, phù hợp với giọng văn tuổi teen đặc trưng của hai nhân vật chính (Bryce và Juli).
  4. Lọc và biên soạn danh sách từ vựng/ngữ pháp nổi bật cho từng chương.
  5. Tổ chức dữ liệu dưới dạng JSON (`data.json`) để tải nhanh và hoạt động không cần server (offline-first).

---

## 3. CÁC TÍNH NĂNG CHÍNH CỦA WEBSITE

### 3.1. Giao Diện Đọc Song Ngữ (Bilingual Reading Dashboard)
* **Chế độ Song Song (Side-by-Side Mode)**:
  * Chia đôi màn hình: Cột trái hiển thị Tiếng Anh, Cột phải hiển thị Tiếng Việt.
  * Tự động đồng bộ cuộn (Scroll Synchronization): Cuộn bên nào thì bên kia tự động cuộn theo tương ứng.
  * Highlight theo đoạn: Khi rê chuột hoặc click vào một đoạn văn tiếng Anh, đoạn dịch tiếng Việt tương ứng sẽ tự động nổi bật lên và ngược lại.
* **Chế độ Tab (Tabbed Mode)**:
  * 2 Tab riêng biệt: **"Bản Gốc (English)"** và **"Bản Dịch (Tiếng Việt)"**.
  * Chuyển đổi qua lại nhanh chóng bằng phím tắt hoặc nút bấm.
  * Tự động nhớ vị trí đang đọc khi chuyển đổi tab để người đọc không bị lạc.

### 3.2. Tra Từ Nhanh & Sổ Tay Từ Vựng (Dictionary & Notebook)
* **Tra từ trực tiếp (Instant Lookup)**:
  * Người dùng có thể bôi đen hoặc click đúp vào bất kỳ từ nào trong đoạn tiếng Anh để hiển thị bảng dịch nhanh (popup) gồm: Phiên âm (IPA), Nghĩa tiếng Việt, Loại từ và ví dụ câu.
* **Sổ tay từ vựng cá nhân (Word Bank)**:
  * Nút "Lưu từ" (Save to Notebook) trong popup tra từ.
  * Lưu trữ từ vựng vào `localStorage` của trình duyệt để học viên ôn tập lại bất cứ lúc nào.
* **Danh sách Từ vựng & Ngữ pháp chọn lọc (Curated Study List)**:
  * Mỗi chương sẽ có một bảng tổng hợp các từ vựng hay và cấu trúc ngữ pháp đáng nhớ (Phrasal Verbs, Idioms, Collocations) thực tế đời thường kèm ví dụ áp dụng.

### 3.3. Tùy Biến Giao Diện (Customization)
* **Font chữ**: Roboto (được nhúng từ Google Fonts) giúp chữ rõ nét, dễ đọc.
* **Tùy chỉnh màu sắc**: 
  * Cung cấp các bảng màu chế độ sẵn có (Presets): 
    * *Sáng (Light Mode)*: Nền trắng ấm, chữ xám đậm.
    * *Tối (Dark Mode)*: Nền tối sâu, chữ xám sáng (tránh mỏi mắt).
    * *Sepia (Cổ điển)*: Nền màu giấy cũ, chữ nâu trầm (rất dịu mắt khi đọc sách).
    * *Forest (Xanh lá dịu)*: Nền xanh rêu nhạt, chữ trắng ngà.
  * Thanh trượt điều chỉnh kích thước chữ (Font Size) và khoảng cách dòng (Line Height).

### 3.4. Theo Dõi Tiến Trình Học (Reading Progress)
* Tự động lưu chương đang đọc dở.
* Đánh dấu các chương đã hoàn thành (Read / Unread).

---

## 4. ĐỀ XUẤT CÔNG NGHỆ (TECH STACK)
Để đảm bảo website mượt mà, giao diện đẹp mắt và dễ bảo trì:
* **Frontend Framework**: **React + Vite** (Khởi tạo nhanh, quản lý state cho các chế độ đọc và danh sách từ vựng tốt nhất).
* **Styling**: **Vanilla CSS** (Thiết kế giao diện Premium, hiện đại, tùy biến tối đa các màu sắc và hiệu ứng chuyển động mượt mà - micro-animations).
* **Dữ liệu**: File JSON tĩnh (`chapters.json`) lưu trữ toàn bộ nội dung sách song ngữ và từ vựng của 14 chương.
* **Hosting**: Có thể chạy offline trực tiếp hoặc deploy lên Vercel/GitHub Pages dễ dàng.

---

## 5. KẾ HOẠCH TRIỂN KHAI (ROADMAP)

1. **Giai đoạn 1**: Thiết lập dự án React/Vite, tải tệp PDF và viết script trích xuất dữ liệu tiếng Anh.
2. **Giai đoạn 2**: Thực hiện dịch thuật nội dung sách sang Tiếng Việt (bám sát ngữ cảnh tự nhiên) và xây dựng file cơ sở dữ liệu JSON (`chapters.json`).
3. **Giai đoạn 3**: Thiết kế giao diện đọc (Layout Song song / Tab) và các chức năng chỉnh màu sắc giao diện, kích thước chữ.
4. **Giai đoạn 4**: Xây dựng tính năng tra từ nhanh, danh sách từ vựng ôn tập và lưu từ vựng (Word Bank).
5. **Giai đoạn 5**: Kiểm thử hiển thị trên các thiết bị di động/máy tính bảng, tối ưu hóa hiệu năng và đóng gói dự án.
