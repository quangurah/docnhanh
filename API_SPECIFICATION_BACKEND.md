# 📋 API Specification - Hệ thống DocNhanh Báo Công Thương

## 📌 Thông tin chung

**Tên dự án**: DocNhanh - Hệ thống quản lý nội dung AI cho Báo Công Thương  
**Frontend**: React + TypeScript + Tailwind CSS v4.0 + shadcn/ui  
**Backend**: FastAPI + PostgreSQL + Redis  
**Authentication**: JWT Bearer Token  
**API Version**: v1  
**Base URL**: `/api/v1`

---

## 🎯 Tổng quan hệ thống

Hệ thống DocNhanh gồm 5 modules chính:

1. **Module 1: Giao việc nội bộ** - Quản lý công việc, phòng ban, nhân viên (Kanban board)
2. **Module 2: Quản lý nội dung AI** - Tạo bài viết tự động, scan nguồn, URL-to-Article
3. **Module 3: Quản trị hệ thống** - Quản lý người dùng, phân quyền, audit trail
4. **Module 4: Thống kê & Báo cáo** - Usage tracking, cost analytics, activity logs
5. **Module 5: AI Chat** - Trợ lý AI hỗ trợ nội bộ, chat history

**Số lượng người dùng**: 80 tài khoản chính thức (1 Tổng Biên tập + 78 nhân viên + 1 Admin)  
**Số phòng ban**: 9 phòng ban

---

## 🔐 1. AUTHENTICATION & AUTHORIZATION

### 1.1 Login

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "access_token": "string (JWT token)",
  "token_type": "bearer",
  "user": {
    "user_id": "string (UUID)",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "editor_in_chief | department_head | reporter | secretary | admin",
    "department_id": "string (UUID) | null",
    "department_name": "string | null",
    "position": "string",
    "avatar_url": "string | null",
    "status": "active | inactive",
    "permissions": {
      "giao-viec": {
        "view": boolean,
        "create": boolean,
        "edit": boolean,
        "delete": boolean,
        "assign": boolean,
        "approve": boolean,
        "export": boolean
      },
      "noi-dung-ai": { /* tương tự */ },
      "nhan-su": { /* tương tự */ },
      "quan-tri": { /* tương tự */ },
      "bao-cao": { /* tương tự */ }
    }
  }
}
```

**Status Codes**:
- `200 OK`: Đăng nhập thành công
- `401 Unauthorized`: Username/password không đúng
- `403 Forbidden`: Tài khoản bị khóa

---

### 1.2 Get Current User

**Endpoint**: `GET /api/v1/auth/me`

**Headers**: `Authorization: Bearer {token}`

**Response**:
```json
{
  "user_id": "string",
  "username": "string",
  "email": "string",
  "full_name": "string",
  "role": "string",
  "department_id": "string | null",
  "department_name": "string | null",
  "position": "string",
  "avatar_url": "string | null",
  "status": "active | inactive",
  "join_date": "ISO 8601 datetime",
  "last_login": "ISO 8601 datetime",
  "permissions": { /* như trên */ }
}
```

---

### 1.3 Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Headers**: `Authorization: Bearer {token}`

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

---

### 1.4 Refresh Token

**Endpoint**: `POST /api/v1/auth/refresh`

**Headers**: `Authorization: Bearer {token}`

**Response**:
```json
{
  "access_token": "string (new JWT token)",
  "token_type": "bearer"
}
```

---

## 👥 2. MODULE 1: GIAO VIỆC NỘI BỘ (TASK MANAGEMENT)

### 2.1 Departments (Phòng ban)

#### 2.1.1 Get All Departments

**Endpoint**: `GET /api/v1/departments`

**Query Parameters**:
- `skip` (int, default: 0) - Pagination offset
- `limit` (int, default: 100) - Số lượng record

**Response**:
```json
{
  "total": 9,
  "items": [
    {
      "id": "string (UUID)",
      "name": "Ban Biên tập",
      "description": "Ban lãnh đạo toà soạn",
      "icon": "👔",
      "staff_count": 1,
      "active_tasks": 5,
      "completed_tasks": 247,
      "pending_tasks": 2,
      "leader_id": "string (UUID) | null",
      "leader_name": "string | null",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ]
}
```

---

#### 2.1.2 Get Department by ID

**Endpoint**: `GET /api/v1/departments/{department_id}`

**Response**:
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "icon": "string",
  "staff_count": 6,
  "active_tasks": 18,
  "completed_tasks": 342,
  "pending_tasks": 5,
  "leader_id": "string | null",
  "leader_name": "string | null",
  "members": [
    {
      "staff_id": "string",
      "user_id": "string",
      "full_name": "string",
      "position": "string",
      "avatar_url": "string | null",
      "status": "active | busy | on_leave | offline"
    }
  ],
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601"
}
```

---

#### 2.1.3 Create Department

**Endpoint**: `POST /api/v1/departments`

**Permission Required**: `nhan-su:create`

**Request Body**:
```json
{
  "name": "Phòng mới",
  "description": "Mô tả phòng ban",
  "icon": "📁",
  "leader_id": "string (UUID) | null"
}
```

**Response**: `201 Created` + Department object

---

#### 2.1.4 Update Department

**Endpoint**: `PUT /api/v1/departments/{department_id}`

**Permission Required**: `nhan-su:edit`

**Request Body**:
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "icon": "string (optional)",
  "leader_id": "string (optional)"
}
```

**Response**: `200 OK` + Updated Department object

---

#### 2.1.5 Delete Department

**Endpoint**: `DELETE /api/v1/departments/{department_id}`

**Permission Required**: `nhan-su:delete`

**Response**:
```json
{
  "message": "Department deleted successfully"
}
```

**Constraints**:
- Không thể xóa phòng ban còn nhân viên
- Phải chuyển nhân viên sang phòng khác trước

---

### 2.2 Staff (Nhân viên)

#### 2.2.1 Get All Staff

**Endpoint**: `GET /api/v1/staff`

**Query Parameters**:
- `skip` (int, default: 0)
- `limit` (int, default: 50)
- `department_id` (string, optional) - Filter theo phòng ban
- `status` (string, optional) - Filter: active, busy, on_leave, offline
- `role` (string, optional) - Filter: editor_in_chief, department_head, reporter, secretary
- `search` (string, optional) - Tìm kiếm theo tên, email

**Response**:
```json
{
  "total": 80,
  "items": [
    {
      "id": "string (UUID)",
      "user_id": "string (UUID)",
      "username": "string",
      "full_name": "Nguyễn Văn A",
      "email": "email@congthuong.vn",
      "phone": "0912345678",
      "department_id": "string",
      "department_name": "Ban Biên tập",
      "position": "Tổng Biên tập",
      "role": "editor_in_chief",
      "avatar_url": "string | null",
      "status": "active",
      "active_tasks": 3,
      "completed_tasks": 127,
      "join_date": "ISO 8601",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ]
}
```

---

#### 2.2.2 Get Staff by ID

**Endpoint**: `GET /api/v1/staff/{staff_id}`

**Response**:
```json
{
  "id": "string",
  "user_id": "string",
  "username": "string",
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "department_id": "string",
  "department_name": "string",
  "position": "string",
  "role": "string",
  "avatar_url": "string | null",
  "status": "active",
  "active_tasks": 3,
  "completed_tasks": 127,
  "join_date": "ISO 8601",
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601",
  "recent_tasks": [
    {
      "task_id": "string",
      "title": "string",
      "status": "string",
      "priority": "string",
      "due_date": "ISO 8601"
    }
  ]
}
```

---

#### 2.2.3 Create Staff

**Endpoint**: `POST /api/v1/staff`

**Permission Required**: `nhan-su:create`

**Request Body**:
```json
{
  "username": "string (unique)",
  "email": "string (unique)",
  "password": "string (min 8 chars)",
  "full_name": "string",
  "phone": "string (optional)",
  "department_id": "string (UUID)",
  "position": "string",
  "role": "reporter | department_head | secretary"
}
```

**Response**: `201 Created` + Staff object

**Validation**:
- Username: chỉ chữ thường, số, dấu gạch dưới, 3-30 ký tự
- Email: phải hợp lệ
- Password: tối thiểu 8 ký tự

---

#### 2.2.4 Update Staff

**Endpoint**: `PUT /api/v1/staff/{staff_id}`

**Permission Required**: `nhan-su:edit`

**Request Body**:
```json
{
  "full_name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "department_id": "string (optional)",
  "position": "string (optional)",
  "role": "string (optional)",
  "status": "active | busy | on_leave | offline (optional)"
}
```

**Response**: `200 OK` + Updated Staff object

---

#### 2.2.5 Delete Staff

**Endpoint**: `DELETE /api/v1/staff/{staff_id}`

**Permission Required**: `nhan-su:delete`

**Response**:
```json
{
  "message": "Staff deleted successfully"
}
```

**Constraints**:
- Không thể xóa nhân viên đang có task active
- Phải reassign tasks trước

---

#### 2.2.6 Reset Password

**Endpoint**: `POST /api/v1/staff/{staff_id}/reset-password`

**Permission Required**: `nhan-su:edit`

**Request Body**:
```json
{
  "new_password": "string (min 8 chars)"
}
```

**Response**:
```json
{
  "message": "Password reset successfully"
}
```

---

### 2.3 Tasks (Công việc)

#### 2.3.1 Get All Tasks

**Endpoint**: `GET /api/v1/tasks`

**Query Parameters**:
- `skip` (int, default: 0)
- `limit` (int, default: 50)
- `status` (string, optional) - Filter: todo, in_progress, completed, blocked
- `priority` (string, optional) - Filter: low, medium, high, urgent
- `department_id` (string, optional)
- `assignee_id` (string, optional) - Filter theo người được giao
- `created_by_id` (string, optional) - Filter theo người tạo
- `due_date_from` (ISO date, optional)
- `due_date_to` (ISO date, optional)
- `search` (string, optional) - Tìm theo title, description

**Response**:
```json
{
  "total": 235,
  "items": [
    {
      "id": "string (UUID)",
      "title": "Viết bài về triển lãm công nghiệp",
      "description": "Phóng sự chuyên sâu về triển lâm...",
      "assignee_id": "string",
      "assignee_name": "Nguyễn Văn A",
      "assignee_avatar": "string | null",
      "department_id": "string",
      "department_name": "Phòng Công nghiệp",
      "status": "in_progress",
      "priority": "high",
      "due_date": "ISO 8601",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601",
      "started_at": "ISO 8601 | null",
      "completed_at": "ISO 8601 | null",
      "created_by_id": "string",
      "created_by_name": "string",
      
      "submission_status": "not_submitted | pending_review | approved | revision_requested",
      "submitted_at": "ISO 8601 | null",
      "reviewed_at": "ISO 8601 | null",
      "reviewer_name": "string | null",
      "revision_notes": "string | null",
      "article_id": "string | null"
    }
  ]
}
```

---

#### 2.3.2 Get Task by ID

**Endpoint**: `GET /api/v1/tasks/{task_id}`

**Response**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "assignee_id": "string",
  "assignee_name": "string",
  "assignee_avatar": "string | null",
  "department_id": "string",
  "department_name": "string",
  "status": "in_progress",
  "priority": "high",
  "due_date": "ISO 8601",
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601",
  "started_at": "ISO 8601 | null",
  "completed_at": "ISO 8601 | null",
  "created_by_id": "string",
  "created_by_name": "string",
  
  "submission_status": "pending_review",
  "submitted_at": "ISO 8601 | null",
  "reviewed_at": "ISO 8601 | null",
  "reviewer_name": "string | null",
  "revision_notes": "string | null",
  "article_id": "string | null",
  
  "updates": [
    {
      "id": "string",
      "type": "created | status_changed | assigned | reassigned | comment | priority_changed | deadline_changed | edited | started | completed",
      "user_id": "string",
      "user_name": "string",
      "old_value": "string | null",
      "new_value": "string | null",
      "comment": "string | null",
      "changes": ["field1", "field2"],
      "created_at": "ISO 8601"
    }
  ]
}
```

---

#### 2.3.3 Create Task

**Endpoint**: `POST /api/v1/tasks`

**Permission Required**: `giao-viec:create`

**Request Body**:
```json
{
  "title": "string (required, max 200)",
  "description": "string (required)",
  "assignee_id": "string (UUID, required)",
  "department_id": "string (UUID, required)",
  "priority": "low | medium | high | urgent (default: medium)",
  "due_date": "ISO 8601 (required)",
  "article_id": "string (optional)" // Link tới ArticleWorkbench nếu có
}
```

**Response**: `201 Created` + Task object

**Auto-generated**:
- `created_by_id`: Lấy từ JWT token
- `created_at`: Server timestamp
- `status`: Mặc định "todo"

---

#### 2.3.4 Update Task

**Endpoint**: `PUT /api/v1/tasks/{task_id}`

**Permission Required**: `giao-viec:edit` hoặc task owner

**Request Body**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "assignee_id": "string (optional)",
  "department_id": "string (optional)",
  "status": "todo | in_progress | completed | blocked (optional)",
  "priority": "low | medium | high | urgent (optional)",
  "due_date": "ISO 8601 (optional)"
}
```

**Response**: `200 OK` + Updated Task object

**Business Logic**:
- Khi status chuyển từ "todo" → "in_progress" lần đầu: set `started_at`
- Khi status → "completed": set `completed_at`
- Tự động tạo TaskUpdate record cho mỗi thay đổi

---

#### 2.3.5 Delete Task

**Endpoint**: `DELETE /api/v1/tasks/{task_id}`

**Permission Required**: `giao-viec:delete`

**Response**:
```json
{
  "message": "Task deleted successfully"
}
```

---

#### 2.3.6 Submit Task for Review (Workflow)

**Endpoint**: `POST /api/v1/tasks/{task_id}/submit`

**Permission Required**: Task assignee

**Request Body**:
```json
{
  "article_id": "string (optional)" // Link bài viết đã hoàn thành
}
```

**Response**:
```json
{
  "message": "Task submitted for review",
  "submission_status": "pending_review",
  "submitted_at": "ISO 8601"
}
```

---

#### 2.3.7 Approve/Reject Task

**Endpoint**: `POST /api/v1/tasks/{task_id}/review`

**Permission Required**: `giao-viec:approve`

**Request Body**:
```json
{
  "action": "approve | request_revision",
  "revision_notes": "string (required if action=request_revision)"
}
```

**Response**:
```json
{
  "message": "Task approved/revision requested",
  "submission_status": "approved | revision_requested",
  "reviewed_at": "ISO 8601",
  "reviewer_name": "string"
}
```

---

#### 2.3.8 Bulk Update Tasks

**Endpoint**: `POST /api/v1/tasks/bulk-update`

**Permission Required**: `giao-viec:edit`

**Request Body**:
```json
{
  "task_ids": ["uuid1", "uuid2", "uuid3"],
  "updates": {
    "status": "string (optional)",
    "priority": "string (optional)",
    "assignee_id": "string (optional)"
  }
}
```

**Response**:
```json
{
  "message": "Updated 3 tasks successfully",
  "updated_count": 3
}
```

---

#### 2.3.9 Get Tasks Statistics

**Endpoint**: `GET /api/v1/tasks/stats`

**Query Parameters**:
- `department_id` (string, optional)
- `assignee_id` (string, optional)
- `date_from` (ISO date, optional)
- `date_to` (ISO date, optional)

**Response**:
```json
{
  "total": 235,
  "by_status": {
    "todo": 45,
    "in_progress": 89,
    "completed": 98,
    "blocked": 3
  },
  "by_priority": {
    "low": 32,
    "medium": 124,
    "high": 67,
    "urgent": 12
  },
  "overdue": 8,
  "due_today": 15,
  "due_this_week": 42,
  "completion_rate": 41.7
}
```

---

## 🤖 3. MODULE 2: QUẢN LÝ NỘI DUNG AI

### 3.1 Scan Jobs (Quét nguồn tin)

#### 3.1.1 Get All Scan Jobs

**Endpoint**: `GET /api/v1/scans`

**Query Parameters**:
- `skip` (int, default: 0)
- `limit` (int, default: 50)
- `status` (string, optional) - Filter: pending, running, completed, failed
- `date_from` (ISO date, optional)
- `date_to` (ISO date, optional)

**Response**:
```json
{
  "total": 156,
  "items": [
    {
      "scan_id": "string (UUID)",
      "source_name": "VnExpress",
      "source_url": "https://vnexpress.net",
      "status": "completed",
      "items_found": 47,
      "items_processed": 47,
      "started_at": "ISO 8601",
      "completed_at": "ISO 8601 | null",
      "created_by_id": "string",
      "created_by_name": "string",
      "error_message": "string | null"
    }
  ]
}
```

---

#### 3.1.2 Get Scan Job by ID

**Endpoint**: `GET /api/v1/scans/{scan_id}`

**Response**:
```json
{
  "scan_id": "string",
  "source_name": "string",
  "source_url": "string",
  "status": "completed",
  "items_found": 47,
  "items_processed": 47,
  "started_at": "ISO 8601",
  "completed_at": "ISO 8601",
  "created_by_id": "string",
  "created_by_name": "string",
  "error_message": null,
  "items": [
    {
      "item_id": "string",
      "title": "string",
      "url": "string",
      "published_date": "ISO 8601",
      "author": "string | null",
      "category": "string | null",
      "summary": "string | null"
    }
  ]
}
```

---

#### 3.1.3 Create Scan Job

**Endpoint**: `POST /api/v1/scans`

**Permission Required**: `noi-dung-ai:create`

**Request Body**:
```json
{
  "source_name": "string (required)",
  "source_url": "string (required, valid URL)",
  "scan_depth": "shallow | deep (default: shallow)",
  "max_items": "int (default: 50, max: 200)"
}
```

**Response**: `201 Created` + Scan Job object

**Background Task**: Tự động chạy background task quét nguồn

---

#### 3.1.4 Retry Failed Scan

**Endpoint**: `POST /api/v1/scans/{scan_id}/retry`

**Permission Required**: `noi-dung-ai:create`

**Response**:
```json
{
  "message": "Scan job restarted",
  "scan_id": "string",
  "status": "pending"
}
```

---

### 3.2 Articles (Bài viết AI)

#### 3.2.1 Get All Articles

**Endpoint**: `GET /api/v1/articles`

**Query Parameters**:
- `skip` (int, default: 0)
- `limit` (int, default: 50)
- `status` (string, optional) - Filter: draft, processing, published
- `created_by_id` (string, optional)
- `date_from` (ISO date, optional)
- `date_to` (ISO date, optional)
- `search` (string, optional)

**Response**:
```json
{
  "total": 342,
  "items": [
    {
      "article_id": "string (UUID)",
      "title": "Tiêu đề bài viết",
      "status": "published",
      "created_at": "ISO 8601",
      "created_by_id": "string",
      "created_by_name": "string",
      "source_job_id": "string | null",
      "source_url": "string | null",
      "published_url": "string | null",
      "word_count": 1250,
      "last_edited_at": "ISO 8601 | null"
    }
  ]
}
```

---

#### 3.2.2 Get Article by ID

**Endpoint**: `GET /api/v1/articles/{article_id}`

**Response**:
```json
{
  "article_id": "string",
  "title": "string",
  "status": "published",
  "created_at": "ISO 8601",
  "created_by_id": "string",
  "created_by_name": "string",
  "source_job_id": "string | null",
  "source_url": "string | null",
  "published_url": "string | null",
  "content_html": "string (HTML content)",
  "word_count": 1250,
  "last_edited_at": "ISO 8601",
  "editor_instructions": "string | null",
  "prompt_used": "string | null"
}
```

---

#### 3.2.3 Get Article Content

**Endpoint**: `GET /api/v1/articles/{article_id}/content`

**Response**:
```json
{
  "content": "string (HTML hoặc Markdown)"
}
```

---

#### 3.2.4 Create Article from Scan Source

**Endpoint**: `POST /api/v1/articles/create-from-source`

**Permission Required**: `noi-dung-ai:create`

**Request Body**:
```json
{
  "source_job_id": "string (UUID, required)",
  "source_url": "string (required)",
  "title": "string (required)",
  "prompt_file": "string (optional, tên file prompt trong hệ thống)",
  "editor_instructions": "string (optional, yêu cầu đặc biệt)"
}
```

**Response**: `201 Created` + Article object

**Background Task**: AI tự động viết bài dựa trên source

---

#### 3.2.5 Create Article from Manual URL

**Endpoint**: `POST /api/v1/articles/create-from-manual-url`

**Permission Required**: `noi-dung-ai:create`

**Request Body**:
```json
{
  "url": "string (required, valid URL)",
  "prompt_file": "string (optional)",
  "editor_instructions": "string (optional)"
}
```

**Response**: `201 Created` + Article object (status: processing)

**Background Task**: 
1. Scrape nội dung từ URL
2. AI viết lại bài
3. Update status thành "draft"

---

#### 3.2.6 Update Article Content

**Endpoint**: `PUT /api/v1/articles/{article_id}/content`

**Permission Required**: `noi-dung-ai:edit`

**Request Body**:
```json
{
  "content": "string (HTML/Markdown)"
}
```

**Response**:
```json
{
  "message": "Article content updated",
  "last_edited_at": "ISO 8601"
}
```

---

#### 3.2.7 Publish Article

**Endpoint**: `POST /api/v1/articles/{article_id}/publish`

**Permission Required**: `noi-dung-ai:approve`

**Response**:
```json
{
  "message": "Article published successfully",
  "published_url": "https://congthuong.vn/article-slug-123456.html",
  "published_at": "ISO 8601"
}
```

**Integration**: Tích hợp với CMS (WordPress API) để đẩy bài lên website

---

#### 3.2.8 Delete Article

**Endpoint**: `DELETE /api/v1/articles/{article_id}`

**Permission Required**: `noi-dung-ai:delete`

**Response**:
```json
{
  "message": "Article deleted successfully"
}
```

---

### 3.3 AI Prompts Management

#### 3.3.1 Get All Prompts

**Endpoint**: `GET /api/v1/prompts`

**Response**:
```json
{
  "total": 12,
  "items": [
    {
      "prompt_id": "string (UUID)",
      "name": "Prompt viết tin tức công nghiệp",
      "description": "Dành cho bài viết về công nghiệp chế tạo",
      "content": "string (prompt template)",
      "category": "news | feature | analysis | interview",
      "is_default": false,
      "usage_count": 47,
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ]
}
```

---

#### 3.3.2 Create Prompt

**Endpoint**: `POST /api/v1/prompts`

**Permission Required**: `quan-tri:edit`

**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "content": "string (required)",
  "category": "news | feature | analysis | interview",
  "is_default": false
}
```

**Response**: `201 Created` + Prompt object

---

#### 3.3.3 Update Prompt

**Endpoint**: `PUT /api/v1/prompts/{prompt_id}`

**Permission Required**: `quan-tri:edit`

**Request Body**: (tất cả optional)
```json
{
  "name": "string",
  "description": "string",
  "content": "string",
  "category": "string",
  "is_default": boolean
}
```

**Response**: `200 OK` + Updated Prompt object

---

#### 3.3.4 Delete Prompt

**Endpoint**: `DELETE /api/v1/prompts/{prompt_id}`

**Permission Required**: `quan-tri:edit`

**Response**:
```json
{
  "message": "Prompt deleted successfully"
}
```

---

### 3.4 Sources Management (Nguồn tin)

#### 3.4.1 Get All Sources

**Endpoint**: `GET /api/v1/sources`

**Response**:
```json
{
  "total": 23,
  "items": [
    {
      "source_id": "string (UUID)",
      "name": "VnExpress",
      "url": "https://vnexpress.net",
      "category": "Tin tức tổng hợp",
      "is_active": true,
      "auto_scan": true,
      "scan_frequency": "daily | hourly | weekly",
      "last_scan_at": "ISO 8601 | null",
      "total_scans": 47,
      "created_at": "ISO 8601"
    }
  ]
}
```

---

#### 3.4.2 Create Source

**Endpoint**: `POST /api/v1/sources`

**Permission Required**: `quan-tri:edit`

**Request Body**:
```json
{
  "name": "string (required)",
  "url": "string (required, valid URL)",
  "category": "string (optional)",
  "is_active": true,
  "auto_scan": false,
  "scan_frequency": "daily | hourly | weekly (default: daily)"
}
```

**Response**: `201 Created` + Source object

---

#### 3.4.3 Update Source

**Endpoint**: `PUT /api/v1/sources/{source_id}`

**Permission Required**: `quan-tri:edit`

**Request Body**: (tất cả optional)
```json
{
  "name": "string",
  "url": "string",
  "category": "string",
  "is_active": boolean,
  "auto_scan": boolean,
  "scan_frequency": "string"
}
```

**Response**: `200 OK` + Updated Source object

---

#### 3.4.4 Delete Source

**Endpoint**: `DELETE /api/v1/sources/{source_id}`

**Permission Required**: `quan-tri:edit`

**Response**:
```json
{
  "message": "Source deleted successfully"
}
```

---

## 👤 4. MODULE 3: QUẢN TRỊ HỆ THỐNG

### 4.1 User Management

#### 4.1.1 Get All Users

**Endpoint**: `GET /api/v1/users`

**Permission Required**: `nhan-su:view`

**Query Parameters**:
- `skip` (int)
- `limit` (int)
- `role` (string, optional)
- `status` (string, optional)
- `search` (string, optional)

**Response**:
```json
{
  "total": 80,
  "items": [
    {
      "user_id": "string (UUID)",
      "username": "string",
      "email": "string",
      "full_name": "string",
      "role": "editor_in_chief | department_head | reporter | secretary | admin",
      "department_id": "string | null",
      "department_name": "string | null",
      "position": "string",
      "status": "active | inactive",
      "avatar_url": "string | null",
      "last_login": "ISO 8601 | null",
      "created_at": "ISO 8601"
    }
  ]
}
```

---

#### 4.1.2 Create User

**Endpoint**: `POST /api/v1/users`

**Permission Required**: `nhan-su:create`

**Request Body**:
```json
{
  "username": "string (required, unique)",
  "email": "string (required, unique)",
  "password": "string (required, min 8)",
  "full_name": "string (required)",
  "role": "reporter | department_head | secretary (required)",
  "department_id": "string (optional)",
  "position": "string (required)",
  "phone": "string (optional)"
}
```

**Response**: `201 Created` + User object

---

#### 4.1.3 Update User Permissions

**Endpoint**: `PUT /api/v1/users/{user_id}/permissions`

**Permission Required**: `quan-tri:edit`

**Request Body**:
```json
{
  "permissions": {
    "giao-viec": {
      "view": true,
      "create": true,
      "edit": false,
      "delete": false,
      "assign": false,
      "approve": false,
      "export": true
    },
    "noi-dung-ai": { /* ... */ },
    "nhan-su": { /* ... */ },
    "quan-tri": { /* ... */ },
    "bao-cao": { /* ... */ }
  }
}
```

**Response**:
```json
{
  "message": "Permissions updated successfully",
  "user_id": "string",
  "permissions": { /* updated permissions */ }
}
```

---

### 4.2 Audit Trail (Nhật ký hệ thống)

#### 4.2.1 Get Audit Logs

**Endpoint**: `GET /api/v1/audit-logs`

**Permission Required**: `quan-tri:view`

**Query Parameters**:
- `skip` (int, default: 0)
- `limit` (int, default: 50)
- `user_id` (string, optional)
- `action_type` (string, optional) - Filter: create, update, delete, login, logout, etc.
- `module` (string, optional) - Filter: giao-viec, noi-dung-ai, nhan-su, quan-tri
- `date_from` (ISO date, optional)
- `date_to` (ISO date, optional)

**Response**:
```json
{
  "total": 5623,
  "items": [
    {
      "log_id": "string (UUID)",
      "user_id": "string",
      "user_name": "Nguyễn Văn A",
      "action": "task_created",
      "action_type": "create",
      "module": "giao-viec",
      "entity_type": "task",
      "entity_id": "string (UUID)",
      "entity_name": "Viết bài về triển lãm",
      "old_value": null,
      "new_value": "{\"title\": \"...\", \"status\": \"todo\"}",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "timestamp": "ISO 8601"
    }
  ]
}
```

---

#### 4.2.2 Get User Activity

**Endpoint**: `GET /api/v1/users/{user_id}/activity`

**Permission Required**: `quan-tri:view` hoặc own user

**Query Parameters**:
- `skip` (int)
- `limit` (int)
- `date_from` (ISO date)
- `date_to` (ISO date)

**Response**: Giống 4.2.1 nhưng filter theo user

---

### 4.3 System Settings

#### 4.3.1 Get System Settings

**Endpoint**: `GET /api/v1/settings`

**Permission Required**: `quan-tri:view`

**Response**:
```json
{
  "ai_provider": "openai | claude | gemini",
  "ai_model": "gpt-4 | claude-3-opus | gemini-pro",
  "default_article_tone": "formal | casual | neutral",
  "default_language": "vi",
  "auto_save_interval": 30,
  "max_upload_size_mb": 10,
  "session_timeout_minutes": 60,
  "enable_notifications": true,
  "enable_audit_logging": true
}
```

---

#### 4.3.2 Update System Settings

**Endpoint**: `PUT /api/v1/settings`

**Permission Required**: `quan-tri:edit`

**Request Body**: (tất cả optional)
```json
{
  "ai_provider": "string",
  "ai_model": "string",
  "default_article_tone": "string",
  "auto_save_interval": number,
  "session_timeout_minutes": number,
  "enable_notifications": boolean
}
```

**Response**: `200 OK` + Updated settings

---

## 📊 5. MODULE 4: USAGE & ANALYTICS

### 5.1 Usage Tracking

#### 5.1.1 Get Usage Statistics

**Endpoint**: `GET /api/v1/analytics/usage`

**Permission Required**: `bao-cao:view`

**Query Parameters**:
- `date_from` (ISO date, required)
- `date_to` (ISO date, required)
- `group_by` (string, optional) - user, department, day, week, month

**Response**:
```json
{
  "period": {
    "from": "2025-10-01T00:00:00Z",
    "to": "2025-10-22T23:59:59Z"
  },
  "total_requests": 15234,
  "total_tokens": 4523678,
  "total_cost_usd": 127.45,
  "by_action": {
    "article_generation": {
      "count": 342,
      "tokens": 2341234,
      "cost_usd": 67.89
    },
    "ai_chat": {
      "count": 1523,
      "tokens": 876543,
      "cost_usd": 24.32
    },
    "scan_jobs": {
      "count": 89,
      "tokens": 234567,
      "cost_usd": 12.45
    }
  },
  "by_user": [
    {
      "user_id": "string",
      "user_name": "string",
      "requests": 234,
      "tokens": 123456,
      "cost_usd": 34.56
    }
  ],
  "by_department": [
    {
      "department_id": "string",
      "department_name": "string",
      "requests": 456,
      "tokens": 234567,
      "cost_usd": 45.67
    }
  ]
}
```

---

#### 5.1.2 Track API Usage (Internal)

**Endpoint**: `POST /api/v1/analytics/track`

**Note**: Endpoint này được gọi tự động bởi backend sau mỗi AI request

**Request Body**:
```json
{
  "user_id": "string",
  "action": "article_generation | ai_chat | scan_job | prompt_test",
  "tokens_used": 1234,
  "cost_usd": 0.045,
  "metadata": {
    "model": "gpt-4",
    "article_id": "string (optional)",
    "chat_session_id": "string (optional)"
  }
}
```

**Response**:
```json
{
  "message": "Usage tracked successfully"
}
```

---

### 5.2 Analytics & Reports

#### 5.2.1 Get Dashboard Analytics

**Endpoint**: `GET /api/v1/analytics/dashboard`

**Permission Required**: `bao-cao:view`

**Query Parameters**:
- `period` (string) - today, this_week, this_month, last_30_days

**Response**:
```json
{
  "tasks": {
    "total": 235,
    "completed": 98,
    "in_progress": 89,
    "overdue": 8,
    "completion_rate": 41.7
  },
  "articles": {
    "total": 342,
    "draft": 45,
    "published": 287,
    "processing": 10
  },
  "scans": {
    "total": 156,
    "completed": 142,
    "failed": 14,
    "items_found": 2341
  },
  "users": {
    "total": 80,
    "active": 76,
    "inactive": 4
  },
  "ai_usage": {
    "total_requests": 15234,
    "total_tokens": 4523678,
    "total_cost_usd": 127.45
  }
}
```

---

#### 5.2.2 Get Activity Timeline

**Endpoint**: `GET /api/v1/analytics/activity-timeline`

**Permission Required**: `bao-cao:view`

**Query Parameters**:
- `date_from` (ISO date)
- `date_to` (ISO date)
- `group_by` (string) - hour, day, week

**Response**:
```json
{
  "timeline": [
    {
      "timestamp": "2025-10-22T00:00:00Z",
      "tasks_created": 12,
      "tasks_completed": 8,
      "articles_created": 5,
      "articles_published": 3,
      "scans_run": 2,
      "ai_requests": 234
    }
  ]
}
```

---

#### 5.2.3 Export Report

**Endpoint**: `POST /api/v1/analytics/export`

**Permission Required**: `bao-cao:export`

**Request Body**:
```json
{
  "report_type": "tasks | articles | usage | audit_logs",
  "format": "excel | pdf | csv",
  "date_from": "ISO date",
  "date_to": "ISO date",
  "filters": {
    "department_id": "string (optional)",
    "user_id": "string (optional)"
  }
}
```

**Response**:
```json
{
  "message": "Report generated successfully",
  "download_url": "https://api.example.com/downloads/report-uuid.xlsx",
  "expires_at": "ISO 8601"
}
```

---

## 💬 6. MODULE 5: AI CHAT

### 6.1 Chat Sessions

#### 6.1.1 Get Chat History

**Endpoint**: `GET /api/v1/chat/sessions`

**Query Parameters**:
- `skip` (int, default: 0)
- `limit` (int, default: 20)
- `user_id` (string, optional) - Admin only, filter by user

**Response**:
```json
{
  "total": 234,
  "items": [
    {
      "session_id": "string (UUID)",
      "user_id": "string",
      "user_name": "string",
      "title": "Hỏi về quy trình giao việc",
      "message_count": 8,
      "started_at": "ISO 8601",
      "last_activity": "ISO 8601",
      "page_context": "giao-viec/tasks"
    }
  ]
}
```

---

#### 6.1.2 Get Chat Session by ID

**Endpoint**: `GET /api/v1/chat/sessions/{session_id}`

**Response**:
```json
{
  "session_id": "string",
  "user_id": "string",
  "user_name": "string",
  "title": "Hỏi về quy trình giao việc",
  "started_at": "ISO 8601",
  "last_activity": "ISO 8601",
  "page_context": "giao-viec/tasks",
  "messages": [
    {
      "message_id": "string",
      "type": "user | ai",
      "content": "string (text or HTML)",
      "timestamp": "ISO 8601",
      "suggestions": ["Suggestion 1", "Suggestion 2"],
      "quick_actions": [
        {
          "label": "Tạo công việc mới",
          "action": "create_task",
          "data": { /* ... */ }
        }
      ]
    }
  ]
}
```

---

#### 6.1.3 Send Chat Message

**Endpoint**: `POST /api/v1/chat/send`

**Request Body**:
```json
{
  "session_id": "string (optional, tạo mới nếu không có)",
  "message": "string (required)",
  "page_context": "string (optional, e.g., giao-viec/tasks)",
  "context_data": {
    "task_id": "string (optional)",
    "article_id": "string (optional)"
  }
}
```

**Response**:
```json
{
  "session_id": "string",
  "message_id": "string",
  "ai_response": {
    "message_id": "string",
    "type": "ai",
    "content": "string (HTML formatted)",
    "timestamp": "ISO 8601",
    "suggestions": ["Bạn có muốn tạo task mới?", "Xem thống kê công việc"],
    "quick_actions": [
      {
        "label": "Tạo công việc",
        "action": "create_task",
        "icon": "plus"
      }
    ]
  }
}
```

---

#### 6.1.4 Delete Chat Session

**Endpoint**: `DELETE /api/v1/chat/sessions/{session_id}`

**Response**:
```json
{
  "message": "Chat session deleted successfully"
}
```

---

#### 6.1.5 Get Chat Analytics (Admin)

**Endpoint**: `GET /api/v1/chat/analytics`

**Permission Required**: `quan-tri:view`

**Query Parameters**:
- `date_from` (ISO date)
- `date_to` (ISO date)

**Response**:
```json
{
  "total_sessions": 234,
  "total_messages": 1876,
  "active_users": 67,
  "avg_messages_per_session": 8.0,
  "most_common_topics": [
    {
      "topic": "Giao việc",
      "count": 89,
      "percentage": 38.0
    },
    {
      "topic": "Nội dung AI",
      "count": 67,
      "percentage": 28.6
    }
  ],
  "by_page_context": {
    "giao-viec/tasks": 89,
    "noi-dung-ai/articles": 67,
    "dashboard": 45
  }
}
```

---

## 🔔 7. NOTIFICATIONS & WEBHOOKS

### 7.1 Notifications

#### 7.1.1 Get User Notifications

**Endpoint**: `GET /api/v1/notifications`

**Query Parameters**:
- `skip` (int, default: 0)
- `limit` (int, default: 20)
- `unread_only` (boolean, default: false)

**Response**:
```json
{
  "total": 45,
  "unread_count": 8,
  "items": [
    {
      "notification_id": "string (UUID)",
      "type": "task_assigned | task_completed | article_published | mention",
      "title": "Bạn được giao công việc mới",
      "message": "Nguyễn Văn A đã giao cho bạn task: Viết bài về...",
      "link": "/giao-viec/tasks/123",
      "is_read": false,
      "created_at": "ISO 8601",
      "metadata": {
        "task_id": "string",
        "assigned_by": "string"
      }
    }
  ]
}
```

---

#### 7.1.2 Mark Notification as Read

**Endpoint**: `PUT /api/v1/notifications/{notification_id}/read`

**Response**:
```json
{
  "message": "Notification marked as read"
}
```

---

#### 7.1.3 Mark All as Read

**Endpoint**: `POST /api/v1/notifications/mark-all-read`

**Response**:
```json
{
  "message": "All notifications marked as read",
  "count": 8
}
```

---

### 7.2 WebSocket (Real-time)

#### 7.2.1 WebSocket Connection

**Endpoint**: `WS /api/v1/ws`

**Query Parameters**:
- `token` (string, required) - JWT token

**Events từ Server**:

```json
// Task assignment
{
  "event": "task_assigned",
  "data": {
    "task_id": "string",
    "title": "string",
    "assigned_by": "string"
  }
}

// Task status change
{
  "event": "task_status_changed",
  "data": {
    "task_id": "string",
    "old_status": "todo",
    "new_status": "in_progress",
    "updated_by": "string"
  }
}

// New notification
{
  "event": "new_notification",
  "data": {
    "notification_id": "string",
    "type": "task_assigned",
    "title": "string",
    "message": "string"
  }
}

// Article published
{
  "event": "article_published",
  "data": {
    "article_id": "string",
    "title": "string",
    "published_url": "string"
  }
}
```

---

## 📤 8. FILE UPLOADS

### 8.1 Upload Avatar

**Endpoint**: `POST /api/v1/upload/avatar`

**Request**: `multipart/form-data`

**Fields**:
- `file` (File, required) - Image file (JPG, PNG, max 2MB)

**Response**:
```json
{
  "message": "Avatar uploaded successfully",
  "url": "https://cdn.example.com/avatars/uuid.jpg"
}
```

---

### 8.2 Upload Article Image

**Endpoint**: `POST /api/v1/upload/article-image`

**Request**: `multipart/form-data`

**Fields**:
- `file` (File, required) - Image file
- `article_id` (string, optional)

**Response**:
```json
{
  "message": "Image uploaded successfully",
  "url": "https://cdn.example.com/articles/uuid.jpg"
}
```

---

## ❌ 9. ERROR HANDLING

### Standard Error Response

```json
{
  "detail": "Error message in Vietnamese",
  "error_code": "ERROR_CODE",
  "status_code": 400
}
```

### Common Error Codes

| Code | Message | HTTP Status |
|------|---------|-------------|
| `UNAUTHORIZED` | Chưa đăng nhập hoặc token hết hạn | 401 |
| `FORBIDDEN` | Không có quyền truy cập | 403 |
| `NOT_FOUND` | Không tìm thấy dữ liệu | 404 |
| `VALIDATION_ERROR` | Dữ liệu không hợp lệ | 422 |
| `DUPLICATE_ERROR` | Username/Email đã tồn tại | 409 |
| `TASK_HAS_DEPENDENCIES` | Không thể xóa task đang có dependencies | 409 |
| `DEPARTMENT_NOT_EMPTY` | Không thể xóa phòng ban còn nhân viên | 409 |
| `INTERNAL_ERROR` | Lỗi hệ thống | 500 |
| `AI_SERVICE_ERROR` | Lỗi từ AI provider | 503 |

---

## 🔒 10. SECURITY & RATE LIMITING

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/v1/auth/login` | 5 requests / 15 minutes |
| `/api/v1/chat/send` | 20 requests / minute |
| `/api/v1/articles/create-*` | 10 requests / minute |
| All other endpoints | 100 requests / minute |

### Security Headers

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
X-Request-ID: {UUID} (optional, for tracking)
```

---

## 📊 11. DATA MODELS SUMMARY

### User Roles Hierarchy

```
1. editor_in_chief (Tổng Biên tập) - Full access
2. admin (Admin kỹ thuật) - Full access + System config
3. department_head (Lãnh đạo phòng) - Department management
4. reporter (Phóng viên) - Execute tasks
5. secretary (Thư ký) - Read-only + Export
```

### Task Status Flow

```
todo → in_progress → completed
       ↓
     blocked (có thể quay lại in_progress)
```

### Article Status Flow

```
draft → processing → published
```

### Submission Workflow

```
not_submitted → pending_review → approved
                                ↓
                           revision_requested → pending_review
```

---

## 📝 12. NOTES FOR BACKEND TEAM

### Priority Implementation Order

**Phase 1 (Critical)**:
1. Authentication & Authorization
2. User Management + Permissions
3. Departments & Staff CRUD
4. Tasks CRUD + Basic workflow

**Phase 2 (Important)**:
5. Articles creation (manual URL)
6. Audit Trail logging
7. Basic Analytics
8. Notifications

**Phase 3 (Enhancement)**:
9. Scan Jobs
10. AI Chat integration
11. WebSocket real-time
12. Advanced Analytics

### Database Considerations

- **PostgreSQL**: Main database
  - Tables: users, departments, staff, tasks, task_updates, articles, scan_jobs, audit_logs, chat_sessions, chat_messages, notifications, settings
- **Redis**: 
  - Session storage
  - Rate limiting
  - Real-time notifications queue
  - Cache for frequently accessed data (departments list, user permissions)

### AI Integration

- **OpenAI API**: Dùng cho article generation và AI chat
- **Models**: 
  - GPT-4 Turbo cho viết bài
  - GPT-3.5 Turbo cho chat
- **Token tracking**: Track mọi request để tính cost
- **Prompt templates**: Lưu trong database, có thể customize

### File Storage

- **Options**: AWS S3 / Google Cloud Storage / MinIO
- **Structure**:
  ```
  /avatars/{user_id}/{filename}
  /articles/{article_id}/images/{filename}
  /articles/{article_id}/content.html
  /prompts/{prompt_id}.txt
  ```

### Background Tasks (Celery/RQ)

- Scan jobs execution
- Article generation từ URL
- Daily usage reports
- Auto-scan scheduled sources
- Email notifications (nếu có)

### Monitoring & Logging

- **Request logging**: Log tất cả API requests với user_id
- **Error tracking**: Sentry/Rollbar
- **Performance**: Track slow queries (> 1s)
- **AI costs**: Daily reports về token usage và cost

---

## 🚀 13. DEPLOYMENT CHECKLIST

- [ ] Setup PostgreSQL database với indexes phù hợp
- [ ] Setup Redis cho caching và sessions
- [ ] Configure CORS cho frontend domain
- [ ] Setup JWT secret key (256-bit minimum)
- [ ] Configure AI API keys (OpenAI)
- [ ] Setup file storage (S3/GCS)
- [ ] Configure background task queue
- [ ] Setup monitoring và logging
- [ ] Configure rate limiting
- [ ] SSL/TLS certificates
- [ ] Backup strategy (daily database backups)
- [ ] Health check endpoint: `GET /api/v1/health`

---

## 📞 14. CONTACT & SUPPORT

Nếu có thắc mắc về API spec:
- Review frontend code tại: `/components/BaoCongThuong/`
- Check mock data tại: `/components/BaoCongThuong/data/mockData.ts`
- Permissions logic: `/components/BaoCongThuong/data/permissionsData.ts`

---

**Document Version**: 1.0  
**Last Updated**: 22/10/2025  
**Frontend Version**: Completed Phases 1-5  
**Target Backend**: FastAPI + PostgreSQL + Redis
