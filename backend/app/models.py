from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # editor_in_chief, department_head, reporter, secretary, admin
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    position = Column(String(100), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    status = Column(String(20), default="active")  # active, busy, on_leave, offline
    phone = Column(String(20), nullable=True)
    join_date = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    department = relationship("Department", foreign_keys=[department_id], back_populates="members")
    created_tasks = relationship("Task", foreign_keys="Task.created_by_id", back_populates="creator")
    assigned_tasks = relationship("Task", foreign_keys="Task.assignee_id", back_populates="assignee")
    created_articles = relationship("Article", back_populates="creator")
    audit_logs = relationship("AuditLog", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Department(Base):
    __tablename__ = "departments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(10), nullable=True)
    leader_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    leader = relationship("User", foreign_keys=[leader_id])
    members = relationship("User", back_populates="department")
    tasks = relationship("Task", back_populates="department")


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    status = Column(String(20), default="todo")  # todo, in_progress, completed, blocked
    priority = Column(String(10), default="medium")  # low, medium, high, urgent
    due_date = Column(DateTime(timezone=True), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    submission_status = Column(String(20), default="not_submitted")  # not_submitted, pending_review, approved, revision_requested
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    revision_notes = Column(Text, nullable=True)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.article_id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_tasks")
    creator = relationship("User", foreign_keys=[created_by_id], back_populates="created_tasks")
    department = relationship("Department", back_populates="tasks")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    article = relationship("Article", back_populates="task")
    updates = relationship("TaskUpdate", back_populates="task")


class TaskUpdate(Base):
    __tablename__ = "task_updates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=False)
    type = Column(String(30), nullable=False)  # created, status_changed, assigned, etc.
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    old_value = Column(String(255), nullable=True)
    new_value = Column(String(255), nullable=True)
    comment = Column(Text, nullable=True)
    changes = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    task = relationship("Task", back_populates="updates")
    user = relationship("User")


class Article(Base):
    __tablename__ = "articles"
    
    article_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content_html = Column(Text, nullable=True)
    status = Column(String(20), default="draft")  # draft, processing, published
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    source_job_id = Column(UUID(as_uuid=True), ForeignKey("scan_jobs.scan_id"), nullable=True)
    source_url = Column(String(500), nullable=True)
    published_url = Column(String(500), nullable=True)
    word_count = Column(Integer, default=0)
    editor_instructions = Column(Text, nullable=True)
    prompt_used = Column(String(100), nullable=True)
    last_edited_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="created_articles")
    source_job = relationship("ScanJob", back_populates="articles")
    task = relationship("Task", back_populates="article")


class ScanJob(Base):
    __tablename__ = "scan_jobs"
    
    scan_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_name = Column(String(100), nullable=False)
    source_url = Column(String(500), nullable=False)
    status = Column(String(20), default="pending")  # pending, running, completed, failed
    items_found = Column(Integer, default=0)
    items_processed = Column(Integer, default=0)
    scan_depth = Column(String(20), default="shallow")  # shallow, deep
    max_items = Column(Integer, default=50)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    creator = relationship("User")
    articles = relationship("Article", back_populates="source_job")


class Prompt(Base):
    __tablename__ = "prompts"
    
    prompt_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    category = Column(String(20), nullable=False)  # news, feature, analysis, interview
    is_default = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Source(Base):
    __tablename__ = "sources"
    
    source_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    category = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    auto_scan = Column(Boolean, default=False)
    scan_frequency = Column(String(20), default="daily")  # daily, hourly, weekly
    last_scan_at = Column(DateTime(timezone=True), nullable=True)
    total_scans = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    action = Column(String(50), nullable=False)
    action_type = Column(String(20), nullable=False)  # create, update, delete, login, logout
    module = Column(String(20), nullable=False)  # giao-viec, noi-dung-ai, nhan-su, quan-tri
    entity_type = Column(String(30), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    entity_name = Column(String(255), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    title = Column(String(255), nullable=False)
    page_context = Column(String(100), nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.session_id"), nullable=False)
    type = Column(String(10), nullable=False)  # user, ai
    content = Column(Text, nullable=False)
    suggestions = Column(JSON, nullable=True)
    quick_actions = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")


class Notification(Base):
    __tablename__ = "notifications"
    
    notification_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    type = Column(String(30), nullable=False)  # task_assigned, task_completed, article_published, mention
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False)
    notification_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications")


class UsageTracking(Base):
    __tablename__ = "usage_tracking"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    action = Column(String(50), nullable=False)  # article_generation, ai_chat, scan_job, prompt_test
    tokens_used = Column(Integer, nullable=False)
    cost_usd = Column(Float, nullable=False)
    usage_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
