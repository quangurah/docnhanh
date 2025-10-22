# 📨 YÊU CẦU BACKEND DEVELOPMENT - DocNhanh

**Từ:** Frontend Team  
**Tới:** Backend Development Team  
**Ngày:** 20/01/2025  
**Priority:** 🔴 HIGH

---

## 🎯 TÓM TẮT

Frontend DocNhanh **75% hoàn thành** và đã kết nối thành công với backend AWS.

**Hoạt động tốt:**
- ✅ 22 API endpoints đang hoạt động
- ✅ Core workflow: Quét tin → Viết bài → Xuất bản
- ✅ Đủ để demo cho client

**Cần phát triển:**
- ❌ 24 API endpoints còn thiếu
- 🔴 User Management (CRITICAL)
- 🔴 Schedule Management (CRITICAL)

---

## 📊 TÌNH TRẠNG HIỆN TẠI

### ✅ API ĐANG HOẠT ĐỘNG (22 endpoints)

```
Authentication (3):
✅ POST /api/v1/auth/token
✅ GET  /api/v1/users/me
✅ GET  /api/v1/users/me/history

Articles (7):
✅ GET  /api/v1/articles
✅ GET  /api/v1/articles/{date_str}
✅ GET  /api/v1/articles/{id}/content
✅ PUT  /api/v1/articles/{id}/content
✅ POST /api/v1/articles/{id}/publish
✅ POST /api/v1/articles/create-from-source
✅ POST /api/v1/articles/create-from-manual-url

Scans (9):
✅ GET  /api/v1/scan-jobs
✅ GET  /api/v1/scan-jobs/{job_id}
✅ GET  /api/v1/scan-jobs/{job_id}/{filename}
✅ POST /api/v1/scrape/start
✅ POST /api/v1/write/start
✅ POST /api/v1/seo/start
✅ POST /api/v1/develop/start
✅ POST /api/v1/manual/add-and-write
✅ GET  /api/v1/task/{task_id}/status

Configuration (3):
✅ GET  /api/v1/config-files
✅ GET  /api/v1/config/{filename}
✅ POST /api/v1/config/{filename}
```

---

## ❌ API CẦN PHÁT TRIỂN

### 🔴 PHASE 1 - CRITICAL (12 endpoints, 2-3 tuần)

**User Management - 6 endpoints:**
```
❌ GET    /api/v1/users
❌ POST   /api/v1/users
❌ PUT    /api/v1/users/{user_id}
❌ DELETE /api/v1/users/{user_id}
❌ POST   /api/v1/users/{user_id}/reset-password
❌ GET    /api/v1/users/{user_id}/stats
```

**Tại sao cần:** Admin không thể tạo/quản lý users qua UI, phải edit database trực tiếp.

**Impact:** 🔴 HIGH - Blocking user onboarding

---

**Schedule Management - 6 endpoints:**
```
❌ GET    /api/v1/schedules
❌ POST   /api/v1/schedules
❌ PUT    /api/v1/schedules/{schedule_id}
❌ DELETE /api/v1/schedules/{schedule_id}
❌ POST   /api/v1/schedules/{schedule_id}/toggle
❌ GET    /api/v1/schedules/{schedule_id}/history
```

**Tại sao cần:** Hiện không có automation, users phải quét tin thủ công mỗi ngày.

**Impact:** 🔴 HIGH - Blocking automation

**Technical needs:**
- Cron scheduler (APScheduler hoặc Celery)
- Database tables: `schedules`, `schedule_runs`
- Auto-trigger `/api/v1/scrape/start` theo lịch

---

### 🟡 PHASE 2 - IMPORTANT (9 endpoints, 2-3 tuần)

**Article Operations - 4 endpoints:**
```
❌ DELETE /api/v1/articles/{article_id}
❌ POST   /api/v1/articles/batch-update
❌ GET    /api/v1/articles/stats
❌ POST   /api/v1/articles/{article_id}/export
```

**User Profile - 3 endpoints:**
```
❌ Update GET /api/v1/users/me (add role field)
❌ POST /api/v1/users/me/change-password
❌ PUT  /api/v1/users/me/profile
```

**Activity Logs - 2 endpoints:**
```
❌ GET  /api/v1/activity/logs
❌ POST /api/v1/activity/export
```

---

### 🟢 PHASE 3 - OPTIONAL (3 endpoints, defer được)

**Usage Dashboard - 3 endpoints:**
```
❌ GET  /api/v1/usage/stats
❌ GET  /api/v1/usage/api-calls
❌ POST /api/v1/usage/export
```

---

## 📋 CHI TIẾT SPECS

### 1. User Management

#### GET /api/v1/users
**Request:**
```http
GET /api/v1/users?skip=0&limit=20&role=admin&status=active&search=phantd
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total": 5,
  "items": [
    {
      "user_id": "usr_001",
      "username": "phantd",
      "email": "phantd@example.com",
      "full_name": "Phan Thanh Dung",
      "role": "admin",
      "disabled": false,
      "created_at": "2025-01-01T00:00:00Z",
      "last_login": "2025-01-20T10:00:00Z"
    }
  ]
}
```

**Permissions:** Admin only

---

#### POST /api/v1/users
**Request:**
```http
POST /api/v1/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "full_name": "New User Name",
  "password": "StrongPassword@123",
  "role": "writer"
}
```

**Response:**
```json
{
  "user_id": "usr_006",
  "username": "newuser",
  "message": "User created successfully"
}
```

**Validation:**
- Username: unique, 3-20 chars, lowercase + numbers
- Email: unique, valid email
- Password: min 8 chars, uppercase + lowercase + number + special char
- Role: admin | writer | viewer

---

#### PUT /api/v1/users/{user_id}
**Request:**
```http
PUT /api/v1/users/usr_001
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "full_name": "Updated Name",
  "role": "admin",
  "disabled": false
}
```

**Business Rules:**
- Admin can update any user
- User can update self only (except role)
- Cannot remove last admin

---

#### DELETE /api/v1/users/{user_id}
**Request:**
```http
DELETE /api/v1/users/usr_006
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

**Business Rules:**
- Soft delete (set disabled = true)
- Cannot delete self
- Cannot delete last admin

---

#### POST /api/v1/users/{user_id}/reset-password
**Request:**
```http
POST /api/v1/users/usr_001/reset-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_password": "NewPassword@456"
}
```

**Permissions:**
- Admin: can reset any user (no old password needed)
- User: can reset own (requires old_password field)

---

#### GET /api/v1/users/{user_id}/stats
**Request:**
```http
GET /api/v1/users/usr_001/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user_id": "usr_001",
  "username": "phantd",
  "stats": {
    "total_articles_created": 45,
    "total_articles_published": 38,
    "total_scans_initiated": 12,
    "total_edits": 156,
    "last_login": "2025-01-20T10:00:00Z",
    "account_created": "2025-01-01T00:00:00Z"
  }
}
```

---

### 2. Schedule Management

#### GET /api/v1/schedules
**Request:**
```http
GET /api/v1/schedules?status=active
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total": 3,
  "items": [
    {
      "schedule_id": "sch_001",
      "name": "Quét tin buổi sáng",
      "description": "Tự động quét tin tức từ báo mạng lúc 7h sáng",
      "cron_expression": "0 7 * * *",
      "timezone": "Asia/Ho_Chi_Minh",
      "enabled": true,
      "scan_type": "news",
      "config_file": "websites.txt",
      "next_run": "2025-01-21T07:00:00Z",
      "last_run": "2025-01-20T07:00:00Z",
      "last_status": "success",
      "created_by": "phantd",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /api/v1/schedules
**Request:**
```http
POST /api/v1/schedules
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Quét social media",
  "description": "Quét từ Facebook, Twitter mỗi 3 giờ",
  "cron_expression": "0 */3 * * *",
  "timezone": "Asia/Ho_Chi_Minh",
  "scan_type": "social",
  "config_file": "social.txt",
  "enabled": true
}
```

**Response:**
```json
{
  "schedule_id": "sch_004",
  "message": "Schedule created successfully",
  "next_run": "2025-01-20T12:00:00Z"
}
```

**Cron Examples:**
```
"0 * * * *"      - Every hour
"0 */3 * * *"    - Every 3 hours
"0 7 * * *"      - Daily at 7 AM
"0 9 * * 1"      - Every Monday at 9 AM
```

---

#### POST /api/v1/schedules/{schedule_id}/toggle
**Request:**
```http
POST /api/v1/schedules/sch_001/toggle
Authorization: Bearer <token>
```

**Response:**
```json
{
  "schedule_id": "sch_001",
  "enabled": false,
  "message": "Schedule disabled successfully"
}
```

---

#### GET /api/v1/schedules/{schedule_id}/history
**Request:**
```http
GET /api/v1/schedules/sch_001/history?skip=0&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total": 50,
  "items": [
    {
      "run_id": "run_001",
      "schedule_id": "sch_001",
      "scheduled_time": "2025-01-20T07:00:00Z",
      "actual_start_time": "2025-01-20T07:00:02Z",
      "end_time": "2025-01-20T07:05:30Z",
      "status": "success",
      "job_id": "2025-01-20_070000_news",
      "articles_found": 45,
      "error_message": null
    }
  ]
}
```

---

## 🗄️ DATABASE SCHEMA NEEDED

```sql
-- Users table (nếu chưa có)
CREATE TABLE users (
    user_id VARCHAR PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR NOT NULL,
    password_hash VARCHAR NOT NULL,
    role VARCHAR CHECK (role IN ('admin', 'writer', 'viewer')),
    disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Schedules table
CREATE TABLE schedules (
    schedule_id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    cron_expression VARCHAR NOT NULL,
    timezone VARCHAR DEFAULT 'Asia/Ho_Chi_Minh',
    scan_type VARCHAR CHECK (scan_type IN ('news', 'social')),
    config_file VARCHAR,
    enabled BOOLEAN DEFAULT TRUE,
    created_by VARCHAR REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    next_run TIMESTAMP,
    last_run TIMESTAMP,
    last_status VARCHAR
);

-- Schedule runs history
CREATE TABLE schedule_runs (
    run_id VARCHAR PRIMARY KEY,
    schedule_id VARCHAR REFERENCES schedules(schedule_id),
    scheduled_time TIMESTAMP,
    actual_start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR CHECK (status IN ('success', 'failed')),
    job_id VARCHAR,
    articles_found INTEGER,
    error_message TEXT
);
```

---

## 🔧 TECHNICAL REQUIREMENTS

**Authentication:**
- All endpoints cần JWT Bearer token
- Role-based access control
- 401 if unauthorized, 403 if forbidden

**Pagination:**
- Default: skip=0, limit=20
- Max limit: 100
- Response format: `{ total: number, items: [...] }`

**Error Responses:**
```json
{
  "detail": "Error message in Vietnamese",
  "error_code": "USER_NOT_FOUND",
  "status_code": 404
}
```

**Cron Scheduler:**
- Recommend: APScheduler (Python)
- Store next_run time in database
- On trigger → call existing `/api/v1/scrape/start`
- Log results to schedule_runs table

---

## 📅 TIMELINE ĐỀ XUẤT

### Week 1-2 (Jan 20 - Feb 2)
**Focus:** User Management
- ✅ Implement 6 user endpoints
- ✅ Database migrations
- ✅ Testing với Postman
- ✅ Deploy to AWS

**Deliverable:** Admin có thể quản lý users qua UI

---

### Week 3-4 (Feb 3 - Feb 16)
**Focus:** Schedule Management
- ✅ Implement 6 schedule endpoints
- ✅ Cron scheduler setup
- ✅ Testing automation
- ✅ Deploy to AWS

**Deliverable:** Schedules chạy tự động, không cần manual trigger

---

### Week 5-6 (Feb 17 - Mar 2)
**Focus:** Article Operations & Activity Logs
- ✅ Article delete/batch/export (4 endpoints)
- ✅ User profile enhancements (3 endpoints)
- ✅ Activity logs system-wide (2 endpoints)

**Deliverable:** Full article management + audit trail

---

### Week 7+ (Optional)
**Focus:** Usage Dashboard
- ⚠️ Can defer if timeline tight
- 3 endpoints cho analytics

---

## ✅ ACCEPTANCE CRITERIA

### Phase 1 Complete When:
- [ ] Admin tạo được user mới qua UI (không cần SQL)
- [ ] Admin reset được password qua UI
- [ ] Schedules chạy tự động theo cron
- [ ] Schedule history tracking đúng
- [ ] Users thấy đúng role trong profile
- [ ] All 12 endpoints tested with Postman
- [ ] Deployed to AWS: https://api.marketingservice.io/

### Phase 2 Complete When:
- [ ] Admin xóa được articles qua UI
- [ ] Batch update hoạt động cho 10+ articles
- [ ] Articles export được to DOCX/PDF
- [ ] Users đổi được password của mình
- [ ] Activity logs system-wide accessible

---

## 🧪 TESTING CREDENTIALS

```
Test Accounts (Password: Docnhanh@123):
- phantd     (Admin)
- buimanhha  (Writer)
- lehien     (Writer)
- thangnlq   (Viewer)
- dobinh     (Viewer)
```

**Backend URL:** https://api.marketingservice.io/  
**API Docs:** https://api.marketingservice.io/docs

---

## 📞 COMMUNICATION

**Frontend Team:**
- ✅ Ready to test endpoints as soon as available
- ✅ Can provide Postman collections for testing
- ✅ Available for questions & clarifications

**Backend Team:**
- 🔴 Please confirm timeline feasibility
- 🔴 Notify when each endpoint ready for testing
- 🔴 Share any blockers or questions early

**Next Steps:**
1. Backend team review this document
2. Confirm/adjust timeline
3. Start Phase 1 development (User + Schedule Management)
4. Notify frontend when endpoints ready for integration testing

---

## 📎 DETAILED DOCUMENTATION

**Full Report:**
- `/FINAL_STATUS_REPORT.md` - 800+ lines, complete analysis
- `/PRODUCTION_READINESS_REPORT.md` - Detailed specs for all 24 endpoints
- `/BACKEND_DEVELOPMENT_REQUEST.md` - Original request with examples

**Database:**
- `/USERS_SETUP.sql` - User table schema

**Testing:**
- `/TESTING_CREDENTIALS.md` - All test accounts
- `/USERS_TESTING_GUIDE.md` - How to test

---

**Priority:** 🔴 **HIGH**  
**Estimated Effort:** 4-6 weeks (2 developers)  
**Impact:** Blocking production launch  

**Contact Frontend Team if questions.**

---

**Last Updated:** January 20, 2025  
**Status:** Ready to send
