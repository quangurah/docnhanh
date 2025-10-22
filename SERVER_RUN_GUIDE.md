## Hướng dẫn chạy Server DocNhanh (Windows + Docker)

Hướng dẫn này sẽ giúp bạn chạy backend API trên máy local với Docker, test và publish lên internet với HTTPS miễn phí.

### 1) Yêu cầu hệ thống
- Docker Desktop đã cài đặt và đang chạy
- Windows PowerShell (khuyến nghị chạy với quyền Administrator)

### 2) Khởi động Backend (PostgreSQL, Redis, FastAPI)
Trong thư mục gốc dự án (Frontend Redesign for DocNhanh):

```powershell
# Chỉ khởi động backend stack (khuyến nghị)
docker-compose up -d postgres redis backend

# Kiểm tra trạng thái
docker-compose ps

# Xem logs backend (tùy chọn)
docker logs -f frontendredesignfordocnhanh-backend-1
```

Khi hoạt động bình thường, API sẽ có sẵn tại:
- Local: http://localhost:8000
- Health: http://localhost:8000/api/v1/health
- Docs (Swagger): http://localhost:8000/docs

### 2.1) Kết nối PostgreSQL trên Supabase (tùy chọn)
- Lấy `Project URL` và `anon key` trong Supabase Project Settings.
- Lấy mật khẩu database (Settings → Database → Connection string → password).
- Tạo `.env` trong `backend/` với `DATABASE_URL` dạng:

```
DATABASE_URL=postgresql://postgres:<YOUR_DB_PASSWORD>@db.zglzsqubcnwnfnxanwtl.supabase.co:5432/postgres?sslmode=require
```

- Ví dụ giá trị có sẵn: `SUPABASE_PROJECT_URL=https://zglzsqubcnwnfnxanwtl.supabase.co` và `SUPABASE_ANON_KEY=<anon key>` (không bắt buộc cho backend, nhưng hữu ích cho frontend nếu dùng Supabase SDK).
- Backend đã tự động thêm `sslmode=require` khi phát hiện domain `supabase.co`.

### 3) Test trên máy local
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -Method GET -UseBasicParsing
```

### 4) Truy cập từ thiết bị khác trong mạng LAN
Tìm IP local và sử dụng (cùng Wi‑Fi/LAN):
```powershell
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "Ethernet*" -or $_.InterfaceAlias -like "Wi-Fi*" }).IPAddress | Select-Object -First 1
Write-Host "Health: http://$ip:8000/api/v1/health"
Write-Host "Docs:   http://$ip:8000/docs"
```

Nếu không truy cập được từ thiết bị khác, kiểm tra Windows Firewall cho phép port 8000 inbound.

### 5) Publish lên Internet (Tùy chọn HTTPS miễn phí)
Chọn MỘT trong các phương án sau. Giữ terminal chạy trong khi sử dụng.

#### Phương án A — Cloudflare Quick Tunnel (không cần tài khoản, URL ổn định khi chạy)
```powershell
# Khởi động quick tunnel trong Docker
docker rm -f docnhanh-tunnel 2>$null | Out-Null
docker run --name docnhanh-tunnel --pull always cloudflare/cloudflared:latest `
  tunnel --no-autoupdate --url http://host.docker.internal:8000

# Hiển thị URL public từ logs
docker logs --since 60s docnhanh-tunnel
# Tìm: https://<random>.trycloudflare.com
```

#### Phương án B — ngrok (cần cài đặt và authtoken)
```powershell
winget install --id ngrok.ngrok -e --source winget
ngrok config add-authtoken <YOUR_AUTHTOKEN>
ngrok http 8000
# Copy URL https từ output
```

#### Phương án C — localtunnel (cần Node.js; có thể bị chặn bởi một số mạng)
```powershell
npx localtunnel --port 8000
# hoặc thử subdomain (không đảm bảo):
npx localtunnel --port 8000 --subdomain docnhanh
```

#### Phương án D — serveo (sử dụng SSH, không cần cài đặt nếu có OpenSSH)
```powershell
ssh -R 80:localhost:8000 serveo.net
# Copy URL public từ output
```

Sau khi có URL public, test:
```powershell
Invoke-WebRequest -Uri "https://<PUBLIC_URL>/api/v1/health" -Method GET -UseBasicParsing
```

### 6) Xử lý sự cố
- Port 80 đã được sử dụng khi chạy Traefik/Reverse Proxy
  - Sử dụng port host khác (ví dụ: 8080/8443) hoặc dừng app xung đột (IIS/Skype/etc.).
- Backend không healthy / DB authentication failed
  - Đảm bảo services đang chạy: `docker-compose ps`
  - Tạo lại stack: `docker-compose down` rồi `docker-compose up -d postgres redis backend`
  - Xác nhận `DATABASE_URL` trong backend trỏ đến service `postgres` với user/password đúng.
- Lỗi localtunnel như "connection refused"
  - Firewall công ty/ISP có thể chặn; thử Cloudflare hoặc ngrok thay thế.
- Không tìm thấy lệnh ngrok
  - Cài đặt qua `winget`, sau đó mở lại terminal.
- URL Cloudflare Quick Tunnel không mở ngay lập tức
  - Đợi 30–60s; kiểm tra lại logs với `docker logs docnhanh-tunnel` và thử lại trong tab ẩn danh.

### 7) Lệnh hữu ích
```powershell
# Dừng tất cả (backend stack)
docker-compose down

# Rebuild backend image (nếu có thay đổi code)
docker-compose build backend

# Xem logs
docker logs -f frontendredesignfordocnhanh-backend-1
```

### 8) Links (khi đang chạy)
- Local: http://localhost:8000
- Health: http://localhost:8000/api/v1/health
- Docs: http://localhost:8000/docs
- Public (ví dụ): https://<random>.trycloudflare.com
