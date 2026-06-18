# Chức năng 3: Cloze Reading

## Mục tiêu

Buộc người học chủ động khôi phục từ vựng dựa trên ngữ cảnh câu thật trong tác phẩm.

## Quá trình triển khai

1. Tìm các từ vựng xuất hiện nguyên dạng trong đoạn tiếng Anh.
2. Chọn tối đa 8 đoạn khác nhau để tránh lặp cùng một ngữ cảnh.
3. Thay lần xuất hiện đầu tiên của từ bằng `_____`.
4. Cho phép mở gợi ý nghĩa tiếng Việt nhưng không tự điền đáp án.
5. Sau khi kiểm tra:
   - Tô trạng thái đúng/sai.
   - Hiện đáp án đúng.
   - Cho mở bản dịch đoạn văn.
6. Lưu điểm vào bảng `clozeAttempts`.

## Quy tắc chấm

- Không phân biệt chữ hoa/chữ thường.
- Chuẩn hóa dấu nháy cong và khoảng trắng.
- Yêu cầu đúng từ gốc đã bị ẩn.

## Cách kiểm thử

1. Mở `/cloze`.
2. Điền đủ các ô và kiểm tra đáp án.
3. Mở một gợi ý và xác nhận đáp án không bị lộ.
4. Tạo bộ câu mới và xác nhận ngữ cảnh thay đổi.
5. Xem điểm Cloze trên dashboard.

## File chính

- `src/pages/ClozePage.jsx`
- `src/utils/learning.js`

