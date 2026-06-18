# Chức năng 1: SRS Flashcards

## Mục tiêu

Biến danh sách từ vựng của từng chương thành thẻ ôn tập có lịch nhắc lại. Người học không phải ôn toàn bộ từ mỗi lần mà chỉ gặp những thẻ đã đến hạn.

## Quá trình triển khai

1. Cài `dexie` và `dexie-react-hooks` để lưu và theo dõi dữ liệu IndexedDB.
2. Tạo bảng `flashcards` và `reviewHistory` trong `src/data/learningDb.js`.
3. Tạo thao tác nhập toàn bộ từ của một chương vào lịch ôn.
4. Xây dựng bốn mức đánh giá:
   - Quên: gặp lại sau 10 phút, giảm độ dễ.
   - Khó: gặp lại sớm, tăng khoảng cách rất ít.
   - Nhớ: tăng khoảng cách theo số lần trả lời đúng và hệ số dễ.
   - Dễ: tăng khoảng cách mạnh, chuyển thẻ sang trạng thái `mastered`.
5. Tạo trang `/review` hiển thị số thẻ, số thẻ đến hạn và số từ đã vững.

## Dữ liệu được lưu

- Nội dung thẻ và chương nguồn.
- Trạng thái `new`, `learning`, `review`, `mastered`.
- Ngày ôn tiếp theo, khoảng cách ôn, hệ số dễ và số lần lặp.
- Toàn bộ lịch sử đánh giá từng thẻ.

## Cách kiểm thử

1. Mở trang **Ôn SRS**.
2. Chọn một chương và nhấn **Nạp từ chương này**.
3. Lật thẻ, chọn một mức ghi nhớ.
4. Tải lại trang và xác nhận thẻ/lịch sử vẫn còn.

## File chính

- `src/pages/ReviewPage.jsx`
- `src/data/learningDb.js`

