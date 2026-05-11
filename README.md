# Hướng dẫn cài đặt và chạy ứng dụng UBND XÃ 

Chào bạn! Đây là hướng dẫn chi tiết để bạn có thể chạy ứng dụng này trên máy tính cá nhân hoặc máy chủ của xã sau khi đã tải mã nguồn về.

## 1. Yêu cầu hệ thống
Máy tính của bạn cần cài đặt sẵn:
*   **Node.js** (Phiên bản 18 trở lên). Bạn có thể tải tại: [nodejs.org](https://nodejs.org/)

## 2. Các bước cài đặt

### Bước 1: Giải nén mã nguồn
Giải nén tệp tin bạn đã tải về vào một thư mục trên máy tính.

### Bước 2: Cài đặt thư viện (Dependencies)
Mở Terminal (hoặc Command Prompt/PowerShell) tại thư mục vừa giải nén và chạy lệnh:
```bash
npm install
```
*Lưu ý: Quá trình này có thể mất vài phút tùy vào tốc độ mạng.*

### Bước 3: Chạy ứng dụng

#### Cách A: Chạy để kiểm tra/phát triển (Development)
Sử dụng lệnh này khi bạn muốn vừa chạy vừa có thể chỉnh sửa code:
```bash
npm run dev
```
Sau khi chạy, ứng dụng sẽ hiện thông báo: `Ứng dụng đang chạy tại: http://localhost:3000`

#### Cách B: Chạy thực tế (Production) - Khuyên dùng
Để ứng dụng chạy ổn định và nhanh nhất cho nhiều người dùng:
```bash
npm run build
npm start
```

## 3. Cách truy cập từ máy tính khác trong cùng mạng Wifi/LAN
Để các cán bộ khác có thể vào được, bạn không dùng `localhost` mà dùng địa chỉ IP của máy chủ:

1.  Mở Terminal trên máy chủ, gõ `ipconfig` (Windows) để tìm địa chỉ IPv4 (ví dụ: `192.168.1.15`).
2.  Trên máy cán bộ, gõ vào trình duyệt: `http://192.168.1.15:3000`

## 4. Lưu ý về dữ liệu
*   Dữ liệu của ứng dụng được lưu tại tệp `db.json` trong thư mục gốc.
*   Bạn có thể sao lưu tệp này thường xuyên để tránh mất dữ liệu.
*   Tài khoản mặc định: `admin` / mật khẩu: `123`

## 5. Khắc phục lỗi không kết nối được máy chủ
Nếu bạn gặp lỗi "không kết nối được", hãy kiểm tra:
1.  Bạn đã chạy lệnh `npm run dev` hoặc `npm start` chưa? (Cửa sổ Terminal phải đang mở).
2.  Tường lửa (Firewall) của máy tính có đang chặn cổng **3000** không? Hãy thử tắt tạm tường lửa hoặc thêm quy tắc cho phép cổng 3000.
3.  Đảm bảo bạn đang truy cập đúng cổng `:3000`.

Chúc bạn triển khai thành công!
