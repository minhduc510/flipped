# Chức năng 4: Nghe và chép chính tả

## Mục tiêu

Kết hợp đọc với nhận âm: nghe toàn đoạn, nghe từng câu và nhập lại nội dung nghe được.

## Quá trình triển khai

1. Sử dụng Web Speech API có sẵn trong trình duyệt, không cần dịch vụ âm thanh bên ngoài.
2. Chia mỗi đoạn thành các câu để tạo nút phát riêng.
3. Cho phép điều chỉnh tốc độ từ `0.5×` đến `1.3×`.
4. Thêm chế độ chép chính tả toàn đoạn.
5. Thêm thao tác đánh dấu đoạn đã nghe và lưu vào `listeningProgress`.
6. Hủy giọng đọc khi đổi đoạn, đổi chương hoặc rời trang.

## Lưu ý

- Chất lượng và danh sách giọng phụ thuộc hệ điều hành/trình duyệt.
- Nếu trình duyệt không hỗ trợ `speechSynthesis`, phần chép chính tả vẫn hoạt động.
- Dữ liệu chỉ ghi nhận hoàn thành khi người học nhấn **Đánh dấu đã nghe**.

## Cách kiểm thử

1. Mở `/listen`.
2. Phát toàn đoạn và từng câu ở nhiều tốc độ.
3. Đổi đoạn khi đang phát, xác nhận âm thanh cũ dừng lại.
4. Chép chính tả và so sánh.
5. Đánh dấu đã nghe, kiểm tra số đoạn trên dashboard.

## File chính

- `src/pages/ListeningPage.jsx`
- `src/data/learningDb.js`

