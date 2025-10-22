# DocNhanh Backend API

Hệ thống quản lý nội dung AI cho Báo Công Thương - Backend API

## 🚀 Tính năng chính

- **Authentication & Authorization**: JWT-based authentication với role-based permissions
- **User Management**: Quản lý người dùng, phòng ban, phân quyền
- **Task Management**: Quản lý công việc với workflow approval
- **AI Content Management**: Tạo bài viết AI, quét nguồn tin, quản lý prompts
- **Analytics & Reporting**: Thống kê sử dụng, báo cáo chi tiết
- **AI Chat**: Trợ lý AI hỗ trợ nội bộ
- **Real-time Notifications**: WebSocket cho thông báo real-time
- **Audit Trail**: Nhật ký hoạt động hệ thống

## 🛠️ Công nghệ sử dụng

- **FastAPI**: Modern, fast web framework
- **PostgreSQL**: Primary database
- **Redis**: Caching và session storage
- **SQLAlchemy**: ORM
- **Alembic**: Database migrations
- **JWT**: Authentication
- **WebSocket**: Real-time communication
- **OpenAI API**: AI content generation

## 📋 Yêu cầu hệ thống

- Python 3.8+
- PostgreSQL 12+
- Redis 6+
- 4GB RAM minimum
- 10GB disk space

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd backend
```

### 2. Tạo virtual environment

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate  # Windows
```

### 3. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 4. Cấu hình database

```bash
# Tạo database PostgreSQL
createdb docnhanh

# Chạy migrations
alembic upgrade head
```

### 5. Cấu hình environment

```bash
cp env.example .env
# Chỉnh sửa .env với thông tin database và API keys
```

### 6. Chạy server

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Documentation

Sau khi chạy server, truy cập:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/v1/health

## 🔐 Authentication

API sử dụng JWT Bearer token:

```bash
curl -H "Authorization: Bearer <your-token>" http://localhost:8000/api/v1/users/me
```

## 📊 Database Schema

### Core Tables

- `users`: Thông tin người dùng
- `departments`: Phòng ban
- `tasks`: Công việc
- `articles`: Bài viết AI
- `scan_jobs`: Quét nguồn tin
- `prompts`: AI prompts
- `sources`: Nguồn tin
- `audit_logs`: Nhật ký hệ thống
- `chat_sessions`: Phiên chat AI
- `notifications`: Thông báo
- `usage_tracking`: Theo dõi sử dụng AI

## 🔧 Development

### Chạy tests

```bash
pytest
```

### Tạo migration mới

```bash
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

### Format code

```bash
black app/
isort app/
```

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t docnhanh-backend .

# Run container
docker run -p 8000:8000 docnhanh-backend
```

### Production Checklist

- [ ] Setup PostgreSQL với indexes phù hợp
- [ ] Setup Redis cho caching
- [ ] Configure CORS cho frontend domain
- [ ] Setup JWT secret key (256-bit minimum)
- [ ] Configure AI API keys
- [ ] Setup file storage (S3/GCS)
- [ ] Configure background task queue
- [ ] Setup monitoring và logging
- [ ] Configure rate limiting
- [ ] SSL/TLS certificates
- [ ] Backup strategy

## 📈 Monitoring

### Health Checks

- Database connectivity
- Redis connectivity
- AI API availability
- Disk space
- Memory usage

### Logging

- Request/Response logs
- Error tracking
- Performance metrics
- AI usage costs

## 🔒 Security

- JWT token authentication
- Role-based access control
- Rate limiting
- Input validation
- SQL injection prevention
- CORS configuration
- Audit logging

## 📞 Support

Nếu có vấn đề:

1. Kiểm tra logs: `tail -f logs/app.log`
2. Kiểm tra database connection
3. Kiểm tra Redis connection
4. Kiểm tra API keys
5. Liên hệ team development

## 📝 Changelog

### v1.0.0 (2025-01-20)

- Initial release
- Complete API implementation
- Authentication & Authorization
- User Management
- Task Management
- AI Content Management
- Analytics & Reporting
- AI Chat
- Real-time Notifications
- WebSocket support
- Audit Trail

---

**DocNhanh Backend API v1.0.0**  
*Hệ thống quản lý nội dung AI cho Báo Công Thương*
