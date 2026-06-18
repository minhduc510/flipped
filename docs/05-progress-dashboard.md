# Chức năng 5: Dashboard tiến độ

## Mục tiêu

Hiển thị tiến độ học thực tế từ nhiều hoạt động thay vì chỉ dựa trên chương đang mở.

## Quá trình triển khai

1. Đọc đồng thời dữ liệu từ các bảng Dexie bằng `useLiveQuery`.
2. Tạo bốn chỉ số chính:
   - Chương đã đánh dấu đọc xong.
   - Từ đã đạt trạng thái `mastered`.
   - Điểm quiz trung bình.
   - Số thẻ SRS đến hạn.
3. Dùng Recharts tạo biểu đồ điểm Quiz và Cloze theo 14 chương.
4. Hiển thị tổng lượt ôn, số bài đã làm, số đoạn đã nghe và ngày hoạt động gần nhất.
5. Dashboard tự cập nhật khi IndexedDB thay đổi, không cần tải lại trang.

## Nguồn dữ liệu

- `flashcards`
- `reviewHistory`
- `quizAttempts`
- `clozeAttempts`
- `listeningProgress`
- `chapterProgress`

## Cách kiểm thử

1. Thực hiện ít nhất một lượt ở mỗi chức năng.
2. Mở `/dashboard`.
3. Xác nhận chỉ số và biểu đồ phản ánh kết quả vừa tạo.
4. Tải lại trang để kiểm tra dữ liệu còn nguyên.

## File chính

- `src/pages/DashboardPage.jsx`
- `src/data/learningDb.js`

