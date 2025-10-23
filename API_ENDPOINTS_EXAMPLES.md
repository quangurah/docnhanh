# 🔌 API ENDPOINTS EXAMPLES - DOCNHANH

**Backend**: FastAPI + Supabase PostgreSQL  
**Base URL**: `http://localhost:8000`  
**Authentication**: Bearer Token (JWT)  

---

## 📋 **AUTHENTICATION ENDPOINTS**

### **1. Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "dunghoi123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDA4MCIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJleHAiOjE3MzQ3MzQ0MDB9.abc123",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "00000000-0000-0000-0000-000000000080",
    "username": "admin",
    "email": "admin@baocongthuong.vn",
    "full_name": "System Admin",
    "role": "Admin"
  }
}
```

### **2. Get Current User**
```http
GET /api/v1/users/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "id": "00000000-0000-0000-0000-000000000080",
  "username": "admin",
  "email": "admin@baocongthuong.vn",
  "full_name": "System Admin",
  "role": "Admin",
  "disabled": false,
  "created_at": "2025-01-20T10:00:00Z",
  "last_login_at": "2025-01-20T10:00:00Z"
}
```

### **3. Logout**
```http
POST /api/v1/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

---

## 👥 **USER MANAGEMENT ENDPOINTS**

### **4. List All Users**
```http
GET /api/v1/users?page=1&per_page=20&role=Writer
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "users": [
    {
      "id": "00000000-0000-0000-0000-000000000002",
      "username": "vananhthai",
      "email": "vananhthai02@gmail.com",
      "full_name": "Thái Thị Vân Anh",
      "role": "Writer",
      "phone": "0976520256",
      "disabled": false,
      "created_at": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 80,
  "page": 1,
  "per_page": 20
}
```

### **5. Get User by ID**
```http
GET /api/v1/users/00000000-0000-0000-0000-000000000002
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "id": "00000000-0000-0000-0000-000000000002",
  "username": "vananhthai",
  "email": "vananhthai02@gmail.com",
  "full_name": "Thái Thị Vân Anh",
  "role": "Writer",
  "phone": "0976520256",
  "address": null,
  "bio": null,
  "disabled": false,
  "created_at": "2025-01-20T10:00:00Z",
  "last_login_at": null,
  "staff": {
    "id": "00000000-0000-0000-0000-000000000002",
    "position": "Phóng viên",
    "department_id": "phong-ban-doc",
    "role": "reporter",
    "active_tasks": 3,
    "completed_tasks": 45,
    "status": "active",
    "join_date": "2022-03-15"
  }
}
```

### **6. Create New User**
```http
POST /api/v1/users
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@baocongthuong.vn",
  "full_name": "Người dùng mới",
  "password": "password123",
  "role": "Writer",
  "phone": "0123456789"
}
```

**Response:**
```json
{
  "id": "00000000-0000-0000-0000-000000000081",
  "username": "newuser",
  "email": "newuser@baocongthuong.vn",
  "full_name": "Người dùng mới",
  "role": "Writer",
  "phone": "0123456789",
  "disabled": false,
  "created_at": "2025-01-20T10:00:00Z"
}
```

---

## 🏢 **DEPARTMENT ENDPOINTS**

### **7. List Departments**
```http
GET /api/v1/departments
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "departments": [
    {
      "id": "ban-bien-tap",
      "name": "Ban Biên tập",
      "name_en": "Editorial Board",
      "description": "Ban Biên tập Báo Công Thương",
      "member_count": 1,
      "active_tasks": 5,
      "completed_tasks": 247,
      "status": "active",
      "created_at": "2025-01-20T10:00:00Z"
    },
    {
      "id": "phong-ban-doc",
      "name": "Phòng Bạn đọc và Công tác xã hội",
      "name_en": "Reader Affairs & Social Work",
      "description": "Phụ trách công tác bạn đọc, truyền thông xã hội",
      "member_count": 6,
      "active_tasks": 15,
      "completed_tasks": 320,
      "status": "active",
      "created_at": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 13
}
```

### **8. Get Department Details**
```http
GET /api/v1/departments/phong-ban-doc
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "id": "phong-ban-doc",
  "name": "Phòng Bạn đọc và Công tác xã hội",
  "name_en": "Reader Affairs & Social Work",
  "description": "Phụ trách công tác bạn đọc, truyền thông xã hội",
  "member_count": 6,
  "active_tasks": 15,
  "completed_tasks": 320,
  "status": "active",
  "email": "bandoc@baocongthuong.vn",
  "phone": "024-1234567",
  "location": "Tầng 3, Tòa nhà A",
  "leader": {
    "id": "00000000-0000-0000-0000-000000000007",
    "full_name": "Bùi Quang",
    "position": "Trưởng phòng"
  },
  "members": [
    {
      "id": "00000000-0000-0000-0000-000000000002",
      "full_name": "Thái Thị Vân Anh",
      "position": "Phóng viên",
      "role": "reporter"
    }
  ],
  "created_at": "2025-01-20T10:00:00Z"
}
```

---

## 📝 **TASK MANAGEMENT ENDPOINTS**

### **9. List Tasks**
```http
GET /api/v1/tasks?status=in_progress&priority=high&department_id=phong-kinh-te&page=1&per_page=10
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "10000000-0000-0000-0000-000000000001",
      "title": "Phỏng vấn Bộ trưởng Bộ Công Thương về chính sách xuất khẩu",
      "description": "Chuẩn bị câu hỏi, lên lịch và thực hiện phỏng vấn. Deadline: 30/10/2025",
      "status": "in_progress",
      "priority": "high",
      "categories": ["trung_uong", "chuyen_trang"],
      "created_by": "00000000-0000-0000-0000-000000000001",
      "department_id": "phong-kinh-te",
      "start_date": "2025-10-20",
      "due_date": "2025-10-30",
      "progress": 40,
      "assignments": [
        {
          "user_id": "00000000-0000-0000-0000-000000000008",
          "role": "assignee",
          "status": "active"
        }
      ],
      "created_at": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "per_page": 10
}
```

### **10. Get Task Details**
```http
GET /api/v1/tasks/10000000-0000-0000-0000-000000000001
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "id": "10000000-0000-0000-0000-000000000001",
  "title": "Phỏng vấn Bộ trưởng Bộ Công Thương về chính sách xuất khẩu",
  "description": "Chuẩn bị câu hỏi, lên lịch và thực hiện phỏng vấn. Deadline: 30/10/2025",
  "status": "in_progress",
  "priority": "high",
  "categories": ["trung_uong", "chuyen_trang"],
  "created_by": {
    "id": "00000000-0000-0000-0000-000000000001",
    "full_name": "Nguyễn Văn Minh",
    "username": "nguyenvanminh"
  },
  "department": {
    "id": "phong-kinh-te",
    "name": "Phòng Kinh tế"
  },
  "start_date": "2025-10-20",
  "due_date": "2025-10-30",
  "progress": 40,
  "assignments": [
    {
      "id": "20000000-0000-0000-0000-000000000001",
      "user": {
        "id": "00000000-0000-0000-0000-000000000008",
        "full_name": "Hoàng Văn Long",
        "username": "hoangvanlong"
      },
      "role": "assignee",
      "status": "active",
      "assigned_at": "2025-01-20T10:00:00Z"
    }
  ],
  "comments": [
    {
      "id": "30000000-0000-0000-0000-000000000001",
      "content": "Đã liên hệ được văn phòng Bộ trưởng, hẹn ngày 28/10 lúc 14h",
      "user": {
        "id": "00000000-0000-0000-0000-000000000008",
        "full_name": "Hoàng Văn Long"
      },
      "created_at": "2025-01-20T10:00:00Z"
    }
  ],
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### **11. Create New Task**
```http
POST /api/v1/tasks
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Viết bài về hội nghị APEC 2025",
  "description": "Tham dự và viết bài về hội nghị APEC tại Việt Nam",
  "priority": "high",
  "categories": ["trung_uong", "bo_nganh_dia_phuong"],
  "department_id": "phong-kinh-te",
  "due_date": "2025-11-15",
  "estimated_hours": 8.0
}
```

**Response:**
```json
{
  "id": "10000000-0000-0000-0000-000000000011",
  "title": "Viết bài về hội nghị APEC 2025",
  "description": "Tham dự và viết bài về hội nghị APEC tại Việt Nam",
  "status": "pending",
  "priority": "high",
  "categories": ["trung_uong", "bo_nganh_dia_phuong"],
  "created_by": "00000000-0000-0000-0000-000000000080",
  "department_id": "phong-kinh-te",
  "due_date": "2025-11-15",
  "estimated_hours": 8.0,
  "progress": 0,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### **12. Update Task**
```http
PUT /api/v1/tasks/10000000-0000-0000-0000-000000000001
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "status": "completed",
  "progress": 100,
  "actual_hours": 6.5,
  "completed_at": "2025-01-20T10:00:00Z"
}
```

**Response:**
```json
{
  "id": "10000000-0000-0000-0000-000000000001",
  "title": "Phỏng vấn Bộ trưởng Bộ Công Thương về chính sách xuất khẩu",
  "status": "completed",
  "progress": 100,
  "actual_hours": 6.5,
  "completed_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### **13. Assign Task to User**
```http
POST /api/v1/tasks/10000000-0000-0000-0000-000000000001/assign
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "user_id": "00000000-0000-0000-0000-000000000008",
  "role": "assignee"
}
```

**Response:**
```json
{
  "id": "20000000-0000-0000-0000-000000000001",
  "task_id": "10000000-0000-0000-0000-000000000001",
  "user_id": "00000000-0000-0000-0000-000000000008",
  "role": "assignee",
  "status": "active",
  "assigned_at": "2025-01-20T10:00:00Z"
}
```

### **14. Add Task Comment**
```http
POST /api/v1/tasks/10000000-0000-0000-0000-000000000001/comments
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "content": "Đã hoàn thành phỏng vấn, đang biên tập nội dung",
  "is_internal": false
}
```

**Response:**
```json
{
  "id": "30000000-0000-0000-0000-000000000001",
  "task_id": "10000000-0000-0000-0000-000000000001",
  "user_id": "00000000-0000-0000-0000-000000000008",
  "content": "Đã hoàn thành phỏng vấn, đang biên tập nội dung",
  "is_internal": false,
  "created_at": "2025-01-20T10:00:00Z"
}
```

---

## 📰 **ARTICLE ENDPOINTS**

### **15. List Articles**
```http
GET /api/v1/articles?status=published&page=1&per_page=10
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "articles": [
    {
      "id": "40000000-0000-0000-0000-000000000001",
      "title": "Việt Nam xuất khẩu gạo đạt kỷ lục mới",
      "summary": "Năm 2025, xuất khẩu gạo Việt Nam dự kiến đạt 7.5 triệu tấn...",
      "status": "published",
      "author": {
        "id": "00000000-0000-0000-0000-000000000008",
        "full_name": "Hoàng Văn Long"
      },
      "category": "Kinh tế",
      "keywords": ["xuất khẩu", "gạo", "Việt Nam"],
      "seo_score": 85,
      "view_count": 1250,
      "published_at": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "per_page": 10
}
```

### **16. Create Article**
```http
POST /api/v1/articles
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Hội nghị APEC 2025: Cơ hội vàng cho doanh nghiệp Việt",
  "content": "<p>Hội nghị APEC 2025 sẽ được tổ chức tại Việt Nam...</p>",
  "summary": "Hội nghị APEC 2025 mang lại nhiều cơ hội cho doanh nghiệp Việt Nam...",
  "category": "Kinh tế",
  "keywords": ["APEC", "doanh nghiệp", "Việt Nam"],
  "meta_description": "Hội nghị APEC 2025 mang lại cơ hội lớn cho doanh nghiệp Việt Nam"
}
```

**Response:**
```json
{
  "id": "40000000-0000-0000-0000-000000000002",
  "title": "Hội nghị APEC 2025: Cơ hội vàng cho doanh nghiệp Việt",
  "content": "<p>Hội nghị APEC 2025 sẽ được tổ chức tại Việt Nam...</p>",
  "summary": "Hội nghị APEC 2025 mang lại nhiều cơ hội cho doanh nghiệp Việt Nam...",
  "status": "draft",
  "author_id": "00000000-0000-0000-0000-000000000080",
  "category": "Kinh tế",
  "keywords": ["APEC", "doanh nghiệp", "Việt Nam"],
  "meta_description": "Hội nghị APEC 2025 mang lại cơ hội lớn cho doanh nghiệp Việt Nam",
  "seo_score": null,
  "view_count": 0,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### **17. Publish Article**
```http
POST /api/v1/articles/40000000-0000-0000-0000-000000000002/publish
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "id": "40000000-0000-0000-0000-000000000002",
  "status": "published",
  "published_at": "2025-01-20T10:00:00Z",
  "seo_score": 78
}
```

---

## 🤖 **AI CHAT ENDPOINTS**

### **18. Chat with AI**
```http
POST /api/v1/ai/chat
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "message": "Viết tiêu đề hấp dẫn cho bài viết về xuất khẩu gạo Việt Nam",
  "model": "gpt-4o-mini",
  "session_id": "50000000-0000-0000-0000-000000000001"
}
```

**Response:**
```json
{
  "id": "60000000-0000-0000-0000-000000000001",
  "message": "Viết tiêu đề hấp dẫn cho bài viết về xuất khẩu gạo Việt Nam",
  "response": "Dưới đây là một số tiêu đề hấp dẫn cho bài viết về xuất khẩu gạo Việt Nam:\n\n1. 'Việt Nam vươn lên vị trí số 2 thế giới về xuất khẩu gạo: Cơ hội và thách thức'\n2. 'Gạo Việt Nam chinh phục thị trường thế giới: Từ truyền thống đến hiện đại'\n3. 'Xuất khẩu gạo Việt Nam đạt kỷ lục mới: Động lực tăng trưởng bền vững'\n4. 'Gạo Việt Nam trên bản đồ thế giới: Hành trình từ nông dân đến thị trường quốc tế'\n5. 'Xuất khẩu gạo Việt Nam: Cơ hội vàng trong bối cảnh biến đổi khí hậu'",
  "model": "gpt-4o-mini",
  "tokens_input": 25,
  "tokens_output": 150,
  "tokens_total": 175,
  "cost_usd": 0.00035,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### **19. Get AI Usage Stats**
```http
GET /api/v1/ai/usage?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "total_tokens": 15420,
  "total_cost_usd": 0.1234,
  "usage_by_action": {
    "chat": 8500,
    "generate_article": 4200,
    "scan_url": 1500,
    "summarize": 1220
  },
  "usage_by_model": {
    "gpt-4o-mini": 12000,
    "gpt-4": 3420
  },
  "daily_usage": [
    {
      "date": "2025-01-20",
      "tokens": 850,
      "cost_usd": 0.0068
    }
  ]
}
```

---

## 📊 **ANALYTICS ENDPOINTS**

### **20. Get Dashboard Analytics**
```http
GET /api/v1/analytics/dashboard
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "tasks": {
    "total": 150,
    "pending": 45,
    "in_progress": 60,
    "completed": 40,
    "overdue": 5
  },
  "articles": {
    "total": 250,
    "published": 180,
    "draft": 50,
    "review": 20
  },
  "users": {
    "total": 80,
    "active": 75,
    "new_this_month": 5
  },
  "departments": {
    "most_active": "phong-kinh-te",
    "task_distribution": {
      "phong-kinh-te": 25,
      "phong-ban-doc": 20,
      "phong-cong-nghiep": 18
    }
  },
  "ai_usage": {
    "total_tokens": 15420,
    "total_cost_usd": 0.1234,
    "top_actions": ["chat", "generate_article", "scan_url"]
  }
}
```

### **21. Get Activity Timeline**
```http
GET /api/v1/analytics/timeline?days=7
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "timeline": [
    {
      "date": "2025-01-20",
      "activities": [
        {
          "type": "task_created",
          "description": "Tạo task mới: Phỏng vấn Bộ trưởng",
          "user": "Nguyễn Văn Minh",
          "timestamp": "2025-01-20T10:00:00Z"
        },
        {
          "type": "article_published",
          "description": "Xuất bản bài: Việt Nam xuất khẩu gạo đạt kỷ lục",
          "user": "Hoàng Văn Long",
          "timestamp": "2025-01-20T14:30:00Z"
        }
      ]
    }
  ]
}
```

---

## ⚙️ **SYSTEM CONFIG ENDPOINTS**

### **22. Get System Config**
```http
GET /api/v1/config
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "configs": [
    {
      "key": "theme.primary_color",
      "value": "#0066CC",
      "category": "theme",
      "description": "Primary brand color (Báo Công Thương blue)",
      "is_public": true
    },
    {
      "key": "theme.secondary_color",
      "value": "#FF6B00",
      "category": "theme",
      "description": "Secondary brand color (orange)",
      "is_public": true
    },
    {
      "key": "ai.default_model",
      "value": "gpt-4o-mini",
      "category": "ai",
      "description": "Default AI model",
      "is_public": false
    }
  ]
}
```

### **23. Update System Config**
```http
PUT /api/v1/config/theme.primary_color
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "value": "#0066CC",
  "description": "Updated primary brand color"
}
```

**Response:**
```json
{
  "key": "theme.primary_color",
  "value": "#0066CC",
  "category": "theme",
  "description": "Updated primary brand color",
  "is_public": true,
  "updated_at": "2025-01-20T10:00:00Z"
}
```

---

## 🔍 **SCAN ENDPOINTS**

### **24. Trigger URL Scan**
```http
POST /api/v1/scans
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "url": "https://vnexpress.net/kinh-doanh/xuat-khau-gao-viet-nam-tang-manh-2025-1234567.html",
  "scan_type": "manual"
}
```

**Response:**
```json
{
  "id": "70000000-0000-0000-0000-000000000001",
  "url": "https://vnexpress.net/kinh-doanh/xuat-khau-gao-viet-nam-tang-manh-2025-1234567.html",
  "source": "vnexpress.net",
  "status": "pending",
  "scan_type": "manual",
  "triggered_by": "00000000-0000-0000-0000-000000000080",
  "created_at": "2025-01-20T10:00:00Z"
}
```

### **25. Get Scan Results**
```http
GET /api/v1/scans/70000000-0000-0000-0000-000000000001
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "id": "70000000-0000-0000-0000-000000000001",
  "url": "https://vnexpress.net/kinh-doanh/xuat-khau-gao-viet-nam-tang-manh-2025-1234567.html",
  "source": "vnexpress.net",
  "title": "Xuất khẩu gạo Việt Nam tăng mạnh năm 2025",
  "content": "Năm 2025, xuất khẩu gạo Việt Nam dự kiến đạt 7.5 triệu tấn...",
  "summary": "Xuất khẩu gạo Việt Nam năm 2025 dự kiến tăng 15% so với năm trước...",
  "status": "completed",
  "keywords": ["xuất khẩu", "gạo", "Việt Nam", "2025"],
  "sentiment": "positive",
  "relevance_score": 0.85,
  "scanned_at": "2025-01-20T10:05:00Z"
}
```

---

## 📈 **REPORT ENDPOINTS**

### **26. Export Tasks Report**
```http
GET /api/v1/analytics/reports/tasks?format=csv&start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** CSV file download

### **27. Export AI Usage Report**
```http
GET /api/v1/analytics/reports/ai-usage?format=excel&start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** Excel file download

---

## 🔐 **AUDIT LOGS ENDPOINTS**

### **28. Get Audit Logs**
```http
GET /api/v1/audit-logs?action=create&resource_type=task&page=1&per_page=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "logs": [
    {
      "id": "80000000-0000-0000-0000-000000000001",
      "user_id": "00000000-0000-0000-0000-000000000080",
      "username": "admin",
      "action": "create",
      "resource_type": "task",
      "resource_id": "10000000-0000-0000-0000-000000000001",
      "changes": {
        "title": "Phỏng vấn Bộ trưởng Bộ Công Thương về chính sách xuất khẩu",
        "status": "pending"
      },
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "status": "success",
      "created_at": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "per_page": 20
}
```

---

## 🚨 **ERROR RESPONSES**

### **Authentication Error**
```json
{
  "detail": "Could not validate credentials",
  "status_code": 401
}
```

### **Permission Error**
```json
{
  "detail": "Insufficient permissions",
  "status_code": 403
}
```

### **Not Found Error**
```json
{
  "detail": "Task not found",
  "status_code": 404
}
```

### **Validation Error**
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "status_code": 422
}
```

---

## 📝 **NOTES**

1. **Authentication**: Tất cả endpoints (trừ login) đều cần Bearer token
2. **Pagination**: Sử dụng `page` và `per_page` parameters
3. **Filtering**: Các endpoints hỗ trợ filter theo nhiều tiêu chí
4. **Rate Limiting**: 100 requests/minute per user
5. **CORS**: Đã cấu hình cho tất cả origins (`*`)

---

**🎉 API Documentation hoàn tất!**

**Next Steps:**
1. Test tất cả endpoints với Postman/curl
2. Integrate với frontend React
3. Deploy production
4. Monitor API performance

---

**END OF API EXAMPLES**
