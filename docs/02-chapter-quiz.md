# Chức năng 2: Quiz theo chương

## Mục tiêu

Kiểm tra khả năng hiểu nghĩa từ trong ngữ cảnh thay vì chỉ nhận diện bản dịch rời rạc.

## Quá trình triển khai

1. Tạo hàm `createQuiz` lấy ngẫu nhiên 10 mục từ vựng từ chương đang chọn.
2. Câu hỏi sử dụng câu nguồn trong tác phẩm và yêu cầu chọn nghĩa đúng.
3. Ba phương án nhiễu được lấy từ các từ khác trong cùng chương.
4. Sau khi trả lời đủ, hệ thống:
   - Tô đáp án đúng/sai.
   - Hiện giải thích của từ.
   - Tính điểm và phần trăm.
5. Kết quả được lưu vào bảng `quizAttempts` để dashboard tổng hợp.

## Hành vi

- Đổi chương sẽ tạo đề mới.
- Nút **Đề mới** xáo lại câu hỏi và đáp án.
- Không thể chấm khi chưa trả lời đủ.
- Mỗi lần chấm chỉ ghi một kết quả.

## Cách kiểm thử

1. Mở `/quiz`.
2. Trả lời đủ 10 câu và chấm điểm.
3. Mở dashboard, xác nhận số bài và điểm trung bình thay đổi.
4. Nhấn **Đề mới**, xác nhận bộ câu hỏi được xáo lại.

## File chính

- `src/pages/QuizPage.jsx`
- `src/utils/learning.js`

