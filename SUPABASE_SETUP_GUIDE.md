# 🚀 HƯỚNG DẪN SETUP SUPABASE - DOCNHANH

**Project**: DocNhanh - Hệ thống quản lý tòa soạn AI  
**Database**: Supabase PostgreSQL  
**Created**: October 23, 2025  

---

## 📋 **MỤC LỤC**

1. [Chuẩn bị](#chuẩn-bị)
2. [Setup Database Schema](#setup-database-schema)
3. [Insert Sample Data](#insert-sample-data)
4. [Configure Row Level Security](#configure-row-level-security)
5. [Update Backend API](#update-backend-api)
6. [Test API Endpoints](#test-api-endpoints)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 **CHUẨN BỊ**

### **1. Truy cập Supabase Dashboard**
- Đăng nhập: https://supabase.com/dashboard
- Chọn project: `zglzsqubcnwnfnxanwtl`
- Vào **SQL Editor**

### **2. Lấy thông tin kết nối**
- **Project URL**: `https://zglzsqubcnwnfnxanwtl.supabase.co`
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnbHpzcXViY253bmZueGFud3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTkwOTEsImV4cCI6MjA3NjY5NTA5MX0.KxQ1ErtafhnCxEvAgf0BgQ14jbYnxglS-hzldQbvkVE`
- **Database Password**: Lấy từ Settings → Database

---

## 🗄️ **SETUP DATABASE SCHEMA**

### **Bước 1: Tạo Schema cơ bản**

Chạy script sau trong **SQL Editor** của Supabase:

```sql
-- ========================================
-- DOCNHANH - BÁO CÔNG THƯƠNG
-- Initial Database Schema
-- Version: 1.0
-- ========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- 1. USERS & AUTHENTICATION
-- ========================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  address TEXT,
  bio TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'Writer' CHECK (role IN ('Admin', 'Writer', 'View')),
  disabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ========================================
-- 2. DEPARTMENTS
-- ========================================

CREATE TABLE departments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  leader_id UUID,
  deputy_leader_id UUID,
  member_count INTEGER DEFAULT 0,
  active_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  email VARCHAR(255),
  phone VARCHAR(20),
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_departments_leader_id ON departments(leader_id);
CREATE INDEX idx_departments_status ON departments(status);

-- ========================================
-- 3. STAFF
-- ========================================

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  staff_code VARCHAR(20) UNIQUE,
  position VARCHAR(100) NOT NULL,
  department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (
    role IN ('editor_in_chief', 'department_head', 'deputy_head', 'secretary', 'reporter', 'editor', 'staff')
  ),
  active_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  join_date DATE,
  leave_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_department_id ON staff(department_id);
CREATE INDEX idx_staff_role ON staff(role);

-- Add foreign keys for department leaders
ALTER TABLE departments ADD CONSTRAINT fk_departments_leader 
  FOREIGN KEY (leader_id) REFERENCES staff(id) ON DELETE SET NULL;
ALTER TABLE departments ADD CONSTRAINT fk_departments_deputy_leader 
  FOREIGN KEY (deputy_leader_id) REFERENCES staff(id) ON DELETE SET NULL;

-- ========================================
-- 4. TASK CATEGORIES
-- ========================================

CREATE TABLE task_categories (
  id VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_categories_enabled ON task_categories(enabled) WHERE enabled = true;

-- ========================================
-- 5. TASKS
-- ========================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_progress', 'review', 'completed', 'cancelled', 'on_hold')
  ),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  categories TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  department_id VARCHAR(50) REFERENCES departments(id),
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  approval_status VARCHAR(20) DEFAULT 'pending' CHECK (
    approval_status IN ('pending', 'approved', 'rejected', 'revision_requested')
  ),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tags TEXT[],
  attachments_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (due_date IS NULL OR due_date >= start_date)
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_department_id ON tasks(department_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_categories ON tasks USING GIN(categories);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- ========================================
-- 6. TASK ASSIGNMENTS
-- ========================================

CREATE TABLE task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'assignee' CHECK (
    role IN ('assignee', 'reviewer', 'observer', 'approver')
  ),
  status VARCHAR(20) DEFAULT 'active' CHECK (
    status IN ('active', 'completed', 'removed')
  ),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(task_id, user_id, role)
);

CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);

-- ========================================
-- 7. TASK COMMENTS
-- ========================================

CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
  is_internal BOOLEAN DEFAULT false,
  edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX idx_task_comments_created_at ON task_comments(created_at DESC);

-- ========================================
-- 8. TASK ATTACHMENTS
-- ========================================

CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  file_url TEXT NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);

-- ========================================
-- 9. ARTICLES
-- ========================================

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content TEXT,
  summary TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (
    status IN ('draft', 'review', 'approved', 'published', 'archived')
  ),
  author_id UUID NOT NULL REFERENCES users(id),
  editor_id UUID REFERENCES users(id),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags TEXT[],
  keywords TEXT[],
  meta_description TEXT,
  seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  source_url TEXT,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_keywords ON articles USING GIN(keywords);

-- ========================================
-- 10. SCANS
-- ========================================

CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  source VARCHAR(255),
  title VARCHAR(500),
  content TEXT,
  summary TEXT,
  scan_type VARCHAR(20) DEFAULT 'auto' CHECK (scan_type IN ('auto', 'manual')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  ),
  keywords TEXT[],
  sentiment VARCHAR(20),
  relevance_score DECIMAL(3,2),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  triggered_by UUID REFERENCES users(id),
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_scanned_at ON scans(scanned_at DESC);

-- Add scan_id to articles
ALTER TABLE articles ADD COLUMN scan_id UUID REFERENCES scans(id);

-- ========================================
-- 11. SCHEDULES
-- ========================================

CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  source VARCHAR(255),
  frequency VARCHAR(20) NOT NULL CHECK (
    frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'custom')
  ),
  cron_expression VARCHAR(100),
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_run_status VARCHAR(20),
  next_run_at TIMESTAMP WITH TIME ZONE,
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  failed_runs INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_schedules_enabled ON schedules(enabled) WHERE enabled = true;
CREATE INDEX idx_schedules_next_run_at ON schedules(next_run_at);

-- ========================================
-- 12. AI CHAT MESSAGES
-- ========================================

CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  temperature DECIMAL(2,1) DEFAULT 0.7,
  tokens_input INTEGER,
  tokens_output INTEGER,
  tokens_total INTEGER,
  cost_usd DECIMAL(10,6),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);
CREATE INDEX idx_ai_chat_messages_session_id ON ai_chat_messages(session_id);
CREATE INDEX idx_ai_chat_messages_created_at ON ai_chat_messages(created_at DESC);

-- ========================================
-- 13. AI USAGE LOGS
-- ========================================

CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (
    action IN ('chat', 'generate_article', 'scan_url', 'summarize', 'translate', 'seo_optimize', 'rewrite', 'expand', 'other')
  ),
  model VARCHAR(50) NOT NULL,
  provider VARCHAR(50) DEFAULT 'openai',
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER GENERATED ALWAYS AS (tokens_input + tokens_output) STORED,
  cost_usd DECIMAL(10,6),
  metadata JSONB,
  resource_type VARCHAR(50),
  resource_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_action ON ai_usage_logs(action);
CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);

-- ========================================
-- 14. PERMISSIONS
-- ========================================

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL,
  actions TEXT[] DEFAULT '{}',
  scope VARCHAR(20) DEFAULT 'all' CHECK (
    scope IN ('all', 'own', 'department', 'custom')
  ),
  scope_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource)
);

CREATE INDEX idx_permissions_user_id ON permissions(user_id);
CREATE INDEX idx_permissions_resource ON permissions(resource);

-- ========================================
-- 15. AUDIT LOGS
-- ========================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(50),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ========================================
-- 16. SYSTEM CONFIG
-- ========================================

CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(50),
  description TEXT,
  data_type VARCHAR(20) DEFAULT 'string' CHECK (
    data_type IN ('string', 'number', 'boolean', 'object', 'array')
  ),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_config_category ON system_config(category);
CREATE INDEX idx_system_config_is_public ON system_config(is_public);

-- ========================================
-- 17. NOTIFICATIONS
-- ========================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(20) DEFAULT 'info' CHECK (
    type IN ('info', 'success', 'warning', 'error')
  ),
  action_url TEXT,
  action_text VARCHAR(100),
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  resource_type VARCHAR(50),
  resource_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ========================================
-- TRIGGERS & FUNCTIONS
-- ========================================

-- Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Bước 2: Kiểm tra Schema**

```sql
-- Kiểm tra tất cả tables đã được tạo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Kết quả mong đợi: 17 tables
```

---

## 📊 **INSERT SAMPLE DATA**

### **Bước 1: Insert Departments (13 phòng ban)**

```sql
INSERT INTO departments (id, name, name_en, description, member_count, status) VALUES
('ban-bien-tap', 'Ban Biên tập', 'Editorial Board', 'Ban Biên tập Báo Công Thương', 1, 'active'),
('phong-ban-doc', 'Phòng Bạn đọc và Công tác xã hội', 'Reader Affairs & Social Work', 'Phụ trách công tác bạn đọc, truyền thông xã hội', 6, 'active'),
('phong-kinh-te', 'Phòng Kinh tế', 'Economics Department', 'Tin tức kinh tế vĩ mô, chính sách', 6, 'active'),
('phong-cong-nghiep', 'Phòng Công nghiệp - Xây dựng', 'Industry & Construction', 'Công nghiệp, xây dựng, hạ tầng', 6, 'active'),
('phong-thuong-mai', 'Phòng Thương mại - Dịch vụ', 'Trade & Services', 'Thương mại, dịch vụ, logistics', 6, 'active'),
('phong-quang-cao', 'Phòng Quảng cáo', 'Advertising Department', 'Quản lý quảng cáo, marketing', 7, 'active'),
('phong-thi-truong', 'Phòng Thị trường - Pháp chế', 'Market & Legal Affairs', 'Thị trường, pháp luật, quy định', 6, 'active'),
('phong-khcn', 'Phòng Khoa học Công nghệ', 'Science & Technology', 'Khoa học, công nghệ, đổi mới sáng tạo', 6, 'active'),
('phong-ky-thuat', 'Phòng Kỹ thuật - Đa phương tiện', 'Technical & Multimedia', 'Kỹ thuật, đa phương tiện, video', 6, 'active'),
('phong-anh', 'Phòng Ảnh', 'Photography Department', 'Nhiếp ảnh, hình ảnh minh họa', 6, 'active'),
('phong-tckt', 'Phòng Tài chính kế toán', 'Finance & Accounting', 'Tài chính, kế toán, ngân sách', 6, 'active'),
('phong-hanh-chinh', 'Phòng Hành chính - Tổ chức', 'Administration & Organization', 'Hành chính, tổ chức, nhân sự', 6, 'active'),
('phong-tcbh', 'Phòng Tư liệu - Bảo hiểm', 'Archive & Insurance', 'Lưu trữ, tư liệu, bảo hiểm', 6, 'active');
```

### **Bước 2: Insert Task Categories (8 categories)**

```sql
INSERT INTO task_categories (id, label, color, icon, description, enabled, sort_order) VALUES
('trung_uong', 'Trung ương', '#DC2626', '🏛️', 'Tin tức về lãnh đạo Đảng, Nhà nước, sự kiện quan trọng', true, 1),
('bo_nganh_dia_phuong', 'Bộ ngành, địa phương', '#2563EB', '🏢', 'Làm việc với các cơ quan, đơn vị, địa phương', true, 2),
('media', 'Media', '#7C3AED', '🎬', 'Quay phim, dựng video, phóng sự, sản xuất nội dung đa phương tiện', true, 3),
('chuyen_trang', 'Chuyên trang', '#059669', '📰', 'Nội dung chuyên trang chuyên biệt', true, 4),
('chuyen_muc', 'Chuyên mục', '#D97706', '📝', 'Nội dung chuyên mục cố định, định kỳ', true, 5),
('mang_xa_hoi', 'Mạng xã hội', '#DB2777', '📱', 'TikTok, Facebook, YouTube, Zalo OA, Instagram', true, 6),
('ven', 'Ven', '#0891B2', '🌐', 'Nội dung Ven', true, 7),
('seo', 'SEO', '#16A34A', '🔍', 'Tối ưu SEO, keywords, traffic, backlink', true, 8);
```

### **Bước 3: Insert Users (80 accounts)**

**Lưu ý**: Thay thế `$2b$10$YourBcryptHashHere` bằng bcrypt hash thực tế.

```sql
-- Admin account
INSERT INTO users (id, username, email, full_name, role, password_hash, disabled, created_at) VALUES
('00000000-0000-0000-0000-000000000080', 'admin', 'admin@baocongthuong.vn', 'System Admin', 'Admin', '$2b$10$YourBcryptHashHere', false, NOW());

-- Tổng Biên tập
INSERT INTO users (id, username, email, full_name, role, password_hash, phone, disabled, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'nguyenvanminh', 'chichco6868@gmail.com', 'Nguyễn Văn Minh', 'Admin', '$2b$10$YourBcryptHashHere', '0973896868', false, NOW());

-- Phòng Bạn đọc và Công tác xã hội (6)
INSERT INTO users (id, username, email, full_name, role, password_hash, phone, disabled) VALUES
('00000000-0000-0000-0000-000000000002', 'vananhthai', 'vananhthai02@gmail.com', 'Thái Thị Vân Anh', 'Writer', '$2b$10$YourBcryptHashHere', '0976520256', false),
('00000000-0000-0000-0000-000000000003', 'nguyenvanthi', 'nguyenvanthi@baocongthuong.vn', 'Nguyễn Văn Thi', 'Writer', '$2b$10$YourBcryptHashHere', NULL, false),
('00000000-0000-0000-0000-000000000004', 'lethiminh', 'lethiminh@baocongthuong.vn', 'Lê Thị Minh', 'Writer', '$2b$10$YourBcryptHashHere', NULL, false),
('00000000-0000-0000-0000-000000000005', 'phamvanan', 'phamvanan@baocongthuong.vn', 'Phạm Văn An', 'Writer', '$2b$10$YourBcryptHashHere', NULL, false),
('00000000-0000-0000-0000-000000000006', 'tranthihong', 'tranthihong@baocongthuong.vn', 'Trần Thị Hồng', 'Writer', '$2b$10$YourBcryptHashHere', NULL, false),
('00000000-0000-0000-0000-000000000007', 'buiquang', 'buiquang@baocongthuong.vn', 'Bùi Quang', 'Writer', '$2b$10$YourBcryptHashHere', NULL, false);

-- ... (Tiếp tục với các phòng ban khác - xem file SUPABASE_SAMPLE_DATA.sql đầy đủ)
```

### **Bước 4: Insert Staff (80 entries)**

```sql
-- Admin technical staff
INSERT INTO staff (id, user_id, position, department_id, role, active_tasks, completed_tasks, status, join_date) VALUES
('00000000-0000-0000-0000-000000000080', '00000000-0000-0000-0000-000000000080', 'System Admin', NULL, 'staff', 0, 0, 'active', '2020-01-01');

-- Tổng Biên tập
INSERT INTO staff (id, user_id, position, department_id, role, active_tasks, completed_tasks, status, join_date) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Tổng Biên tập', 'ban-bien-tap', 'editor_in_chief', 5, 247, 'active', '2020-01-01');

-- Phòng Bạn đọc (6)
INSERT INTO staff (id, user_id, position, department_id, role, active_tasks, completed_tasks, status, join_date) VALUES
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Phóng viên', 'phong-ban-doc', 'reporter', 3, 45, 'active', '2022-03-15'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Biên tập viên', 'phong-ban-doc', 'editor', 2, 38, 'active', '2021-06-10'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Phóng viên', 'phong-ban-doc', 'reporter', 4, 52, 'active', '2021-08-20'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Biên tập viên', 'phong-ban-doc', 'editor', 1, 29, 'active', '2023-01-05'),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'Phó phòng', 'phong-ban-doc', 'deputy_head', 3, 67, 'active', '2020-05-15'),
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 'Trưởng phòng', 'phong-ban-doc', 'department_head', 5, 89, 'active', '2019-03-01');

-- ... (Tiếp tục với các phòng ban khác)
```

### **Bước 5: Insert Sample Tasks (10 examples)**

```sql
INSERT INTO tasks (id, title, description, status, priority, categories, created_by, department_id, start_date, due_date, progress) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'Phỏng vấn Bộ trưởng Bộ Công Thương về chính sách xuất khẩu',
  'Chuẩn bị câu hỏi, lên lịch và thực hiện phỏng vấn. Deadline: 30/10/2025',
  'in_progress',
  'high',
  ARRAY['trung_uong', 'chuyen_trang'],
  '00000000-0000-0000-0000-000000000001',
  'phong-kinh-te',
  '2025-10-20',
  '2025-10-30',
  40
),
(
  '10000000-0000-0000-0000-000000000002',
  'Viết bài về triển lãm thương mại quốc tế Việt Nam 2025',
  'Tham dự sự kiện, chụp ảnh và viết bài chi tiết về các gian hàng nổi bật',
  'pending',
  'medium',
  ARRAY['bo_nganh_dia_phuong', 'chuyen_trang'],
  '00000000-0000-0000-0000-000000000002',
  'phong-thuong-mai',
  '2025-10-23',
  '2025-10-28',
  0
),
(
  '10000000-0000-0000-0000-000000000003',
  'Quay video TikTok series "Khởi nghiệp Việt"',
  'Series 5 video ngắn (60s mỗi video) về các startup công nghệ Việt Nam thành công',
  'in_progress',
  'high',
  ARRAY['media', 'mang_xa_hoi'],
  '00000000-0000-0000-0000-000000000003',
  'phong-ky-thuat',
  '2025-10-15',
  '2025-10-25',
  60
);
-- ... (Thêm 7 tasks nữa)
```

### **Bước 6: Insert System Config**

```sql
INSERT INTO system_config (key, value, category, description, is_public) VALUES
('ai.openai_api_key', '"sk-proj-..."', 'ai', 'OpenAI API Key', false),
('ai.default_model', '"gpt-4o-mini"', 'ai', 'Default AI model', false),
('ai.max_tokens', '4000', 'ai', 'Max tokens per request', false),
('theme.primary_color', '"#0066CC"', 'theme', 'Primary brand color (Báo Công Thương blue)', true),
('theme.secondary_color', '"#FF6B00"', 'theme', 'Secondary brand color (orange)', true),
('theme.logo_url', '"https://baocongthuong.vn/logo.png"', 'theme', 'Logo URL', true),
('notification.email_enabled', 'true', 'notification', 'Enable email notifications', false),
('notification.email_from', '"noreply@baocongthuong.vn"', 'notification', 'Email sender address', false),
('security.session_timeout', '1800', 'security', 'Session timeout in seconds (30 minutes)', false),
('security.max_login_attempts', '5', 'security', 'Max failed login attempts before lockout', false);
```

### **Bước 7: Verify Data**

```sql
-- Kiểm tra số lượng records
SELECT 'users' AS table_name, COUNT(*) FROM users
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'task_categories', COUNT(*) FROM task_categories
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'system_config', COUNT(*) FROM system_config;

-- Kết quả mong đợi:
-- users: 80
-- departments: 13
-- staff: 80
-- task_categories: 8
-- tasks: 10
-- system_config: 10
```

---

## 🔒 **CONFIGURE ROW LEVEL SECURITY**

### **Bước 1: Enable RLS**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### **Bước 2: Create RLS Policies**

```sql
-- Users policies
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'Admin'
    )
  );

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Tasks policies
CREATE POLICY "Users can view department tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    department_id IN (
      SELECT department_id FROM staff
      WHERE user_id = auth.uid()
    )
    OR
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM task_assignments
      WHERE task_id = tasks.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Writers can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('Admin', 'Writer')
    )
  );

-- AI Chat policies
CREATE POLICY "Users can view their own chats"
  ON ai_chat_messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create chat messages"
  ON ai_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- System Config policies
CREATE POLICY "Admins full access to system_config"
  ON system_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Everyone can read public configs"
  ON system_config FOR SELECT
  TO authenticated
  USING (is_public = true);
```

---

## 🔄 **UPDATE BACKEND API**

### **Bước 1: Update Database URL**

Cập nhật file `backend/.env`:

```bash
# Supabase Database URL
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.zglzsqubcnwnfnxanwtl.supabase.co:5432/postgres?sslmode=require

# Supabase Configuration
SUPABASE_PROJECT_URL=https://zglzsqubcnwnfnxanwtl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnbHpzcXViY253bmZueGFud3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTkwOTEsImV4cCI6MjA3NjY5NTA5MX0.KxQ1ErtafhnCxEvAgf0BgQ14jbYnxglS-hzldQbvkVE
```

### **Bước 2: Test Database Connection**

```bash
# Restart backend với Supabase
docker-compose down
docker-compose up -d redis backend

# Test connection
curl http://localhost:8000/api/v1/health
```

---

## 🧪 **TEST API ENDPOINTS**

### **1. Health Check**

```bash
curl -X GET "http://localhost:8000/api/v1/health"
```

**Response:**
```json
{
  "status": "healthy",
  "message": "DocNhanh API is running",
  "version": "1.0.0",
  "timestamp": "2025-01-20T10:00:00Z"
}
```

### **2. Login (Admin)**

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "dunghoi123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

### **3. Get Current User**

```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
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

### **4. List Departments**

```bash
curl -X GET "http://localhost:8000/api/v1/departments" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
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
      "status": "active",
      "created_at": "2025-01-20T10:00:00Z"
    },
    {
      "id": "phong-ban-doc",
      "name": "Phòng Bạn đọc và Công tác xã hội",
      "name_en": "Reader Affairs & Social Work",
      "description": "Phụ trách công tác bạn đọc, truyền thông xã hội",
      "member_count": 6,
      "status": "active",
      "created_at": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 13,
  "page": 1,
  "per_page": 20
}
```

### **5. List Tasks**

```bash
curl -X GET "http://localhost:8000/api/v1/tasks" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
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
      "created_at": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "per_page": 20
}
```

### **6. Create New Task**

```bash
curl -X POST "http://localhost:8000/api/v1/tasks" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Viết bài về hội nghị APEC 2025",
    "description": "Tham dự và viết bài về hội nghị APEC tại Việt Nam",
    "priority": "high",
    "categories": ["trung_uong", "bo_nganh_dia_phuong"],
    "department_id": "phong-kinh-te",
    "due_date": "2025-11-15"
  }'
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
  "progress": 0,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### **7. AI Chat**

```bash
curl -X POST "http://localhost:8000/api/v1/ai/chat" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Viết tiêu đề hấp dẫn cho bài viết về xuất khẩu gạo Việt Nam",
    "model": "gpt-4o-mini"
  }'
```

**Response:**
```json
{
  "id": "20000000-0000-0000-0000-000000000001",
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

### **8. Get System Config**

```bash
curl -X GET "http://localhost:8000/api/v1/config" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
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
    }
  ]
}
```

---

## 🔧 **TROUBLESHOOTING**

### **Lỗi thường gặp:**

1. **Database connection failed**
   - Kiểm tra `DATABASE_URL` trong `.env`
   - Đảm bảo password database đúng
   - Kiểm tra Supabase project có active không

2. **RLS policies blocking access**
   - Kiểm tra user có role đúng không
   - Verify RLS policies đã được tạo
   - Test với admin account trước

3. **Foreign key constraints**
   - Đảm bảo insert data theo đúng thứ tự
   - Kiểm tra UUID format đúng
   - Verify foreign key relationships

### **Debug commands:**

```sql
-- Kiểm tra tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Kiểm tra RLS
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Kiểm tra policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Test connection
SELECT current_database(), current_user, version();
```

---

## ✅ **CHECKLIST HOÀN THÀNH**

- [ ] ✅ Schema created (17 tables)
- [ ] ✅ Sample data inserted (80 users, 13 departments, 8 categories)
- [ ] ✅ RLS enabled and policies created
- [ ] ✅ Backend connected to Supabase
- [ ] ✅ API endpoints tested
- [ ] ✅ Authentication working
- [ ] ✅ CRUD operations functional
- [ ] ✅ AI chat integration ready

---

**🎉 Setup hoàn tất! Backend đã sẵn sàng với Supabase database.**

**Next Steps:**
1. Test tất cả API endpoints
2. Integrate với frontend
3. Deploy production
4. Monitor performance

---

**END OF SETUP GUIDE**
