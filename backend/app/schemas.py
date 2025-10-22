from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from uuid import UUID


# Base schemas
class BaseResponse(BaseModel):
    class Config:
        from_attributes = True


# Authentication schemas
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    user_id: UUID
    username: str
    email: str
    full_name: str
    role: str
    department_id: Optional[UUID] = None
    department_name: Optional[str] = None
    position: str
    avatar_url: Optional[str] = None
    status: str
    join_date: datetime
    last_login: Optional[datetime] = None
    permissions: Dict[str, Dict[str, bool]]


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Department schemas
class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    leader_id: Optional[UUID] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    leader_id: Optional[UUID] = None


class DepartmentResponse(DepartmentBase):
    id: UUID
    staff_count: int
    active_tasks: int
    completed_tasks: int
    pending_tasks: int
    leader_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DepartmentDetailResponse(DepartmentResponse):
    members: List[Dict[str, Any]]


# Staff schemas
class StaffBase(BaseModel):
    username: str
    email: str
    full_name: str
    phone: Optional[str] = None
    department_id: UUID
    position: str
    role: str


class StaffCreate(StaffBase):
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[UUID] = None
    position: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class StaffResponse(BaseModel):
    id: UUID
    user_id: UUID
    username: str
    full_name: str
    email: str
    phone: Optional[str] = None
    department_id: UUID
    department_name: str
    position: str
    role: str
    avatar_url: Optional[str] = None
    status: str
    active_tasks: int
    completed_tasks: int
    join_date: datetime
    created_at: datetime
    updated_at: datetime


class StaffDetailResponse(StaffResponse):
    recent_tasks: List[Dict[str, Any]]


class ResetPasswordRequest(BaseModel):
    new_password: str

    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


# Task schemas
class TaskBase(BaseModel):
    title: str
    description: str
    assignee_id: UUID
    department_id: UUID
    priority: str = "medium"
    due_date: datetime
    article_id: Optional[UUID] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str
    assignee_id: UUID
    assignee_name: str
    assignee_avatar: Optional[str] = None
    department_id: UUID
    department_name: str
    status: str
    priority: str
    due_date: datetime
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_by_id: UUID
    created_by_name: str
    submission_status: str
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewer_name: Optional[str] = None
    revision_notes: Optional[str] = None
    article_id: Optional[UUID] = None


class TaskDetailResponse(TaskResponse):
    updates: List[Dict[str, Any]]


class TaskSubmitRequest(BaseModel):
    article_id: Optional[UUID] = None


class TaskReviewRequest(BaseModel):
    action: str  # approve, request_revision
    revision_notes: Optional[str] = None


class BulkUpdateRequest(BaseModel):
    task_ids: List[UUID]
    updates: Dict[str, Any]


class TaskStatsResponse(BaseModel):
    total: int
    by_status: Dict[str, int]
    by_priority: Dict[str, int]
    overdue: int
    due_today: int
    due_this_week: int
    completion_rate: float


# Article schemas
class ArticleBase(BaseModel):
    title: str
    content_html: Optional[str] = None
    editor_instructions: Optional[str] = None


class ArticleCreateFromSource(BaseModel):
    source_job_id: UUID
    source_url: str
    title: str
    prompt_file: Optional[str] = None
    editor_instructions: Optional[str] = None


class ArticleCreateFromManualURL(BaseModel):
    url: str
    prompt_file: Optional[str] = None
    editor_instructions: Optional[str] = None


class ArticleUpdate(BaseModel):
    content_html: Optional[str] = None


class ArticleResponse(BaseModel):
    article_id: UUID
    title: str
    status: str
    created_at: datetime
    created_by_id: UUID
    created_by_name: str
    source_job_id: Optional[UUID] = None
    source_url: Optional[str] = None
    published_url: Optional[str] = None
    word_count: int
    last_edited_at: Optional[datetime] = None


class ArticleDetailResponse(ArticleResponse):
    content_html: str
    editor_instructions: Optional[str] = None
    prompt_used: Optional[str] = None


class ArticlePublishResponse(BaseModel):
    message: str
    published_url: str
    published_at: datetime


# Scan Job schemas
class ScanJobBase(BaseModel):
    source_name: str
    source_url: str
    scan_depth: str = "shallow"
    max_items: int = 50


class ScanJobCreate(ScanJobBase):
    pass


class ScanJobResponse(BaseModel):
    scan_id: UUID
    source_name: str
    source_url: str
    status: str
    items_found: int
    items_processed: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_by_id: UUID
    created_by_name: str
    error_message: Optional[str] = None


class ScanJobDetailResponse(ScanJobResponse):
    items: List[Dict[str, Any]]


# Prompt schemas
class PromptBase(BaseModel):
    name: str
    description: Optional[str] = None
    content: str
    category: str
    is_default: bool = False


class PromptCreate(PromptBase):
    pass


class PromptUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_default: Optional[bool] = None


class PromptResponse(BaseModel):
    prompt_id: UUID
    name: str
    description: Optional[str] = None
    content: str
    category: str
    is_default: bool
    usage_count: int
    created_at: datetime
    updated_at: datetime


# Source schemas
class SourceBase(BaseModel):
    name: str
    url: str
    category: Optional[str] = None
    is_active: bool = True
    auto_scan: bool = False
    scan_frequency: str = "daily"


class SourceCreate(SourceBase):
    pass


class SourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
    auto_scan: Optional[bool] = None
    scan_frequency: Optional[str] = None


class SourceResponse(BaseModel):
    source_id: UUID
    name: str
    url: str
    category: Optional[str] = None
    is_active: bool
    auto_scan: bool
    scan_frequency: str
    last_scan_at: Optional[datetime] = None
    total_scans: int
    created_at: datetime


# Analytics schemas
class UsageStatsRequest(BaseModel):
    date_from: datetime
    date_to: datetime
    group_by: Optional[str] = None


class UsageStatsResponse(BaseModel):
    period: Dict[str, datetime]
    total_requests: int
    total_tokens: int
    total_cost_usd: float
    by_action: Dict[str, Dict[str, Union[int, float]]]
    by_user: List[Dict[str, Union[str, int, float]]]
    by_department: List[Dict[str, Union[str, int, float]]]


class DashboardAnalyticsResponse(BaseModel):
    tasks: Dict[str, Union[int, float]]
    articles: Dict[str, int]
    scans: Dict[str, int]
    users: Dict[str, int]
    ai_usage: Dict[str, Union[int, float]]


# Chat schemas
class ChatMessageRequest(BaseModel):
    session_id: Optional[UUID] = None
    message: str
    page_context: Optional[str] = None
    context_data: Optional[Dict[str, Any]] = None


class ChatMessageResponse(BaseModel):
    session_id: UUID
    message_id: UUID
    ai_response: Dict[str, Any]


class ChatSessionResponse(BaseModel):
    session_id: UUID
    user_id: UUID
    user_name: str
    title: str
    message_count: int
    started_at: datetime
    last_activity: datetime
    page_context: Optional[str] = None


class ChatSessionDetailResponse(ChatSessionResponse):
    messages: List[Dict[str, Any]]


# Notification schemas
class NotificationResponse(BaseModel):
    notification_id: UUID
    type: str
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = None


# Audit Log schemas
class AuditLogResponse(BaseModel):
    log_id: UUID
    user_id: UUID
    user_name: str
    action: str
    action_type: str
    module: str
    entity_type: str
    entity_id: Optional[UUID] = None
    entity_name: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime


# System Settings schemas
class SystemSettingsResponse(BaseModel):
    ai_provider: str
    ai_model: str
    default_article_tone: str
    default_language: str
    auto_save_interval: int
    max_upload_size_mb: int
    session_timeout_minutes: int
    enable_notifications: bool
    enable_audit_logging: bool


class SystemSettingsUpdate(BaseModel):
    ai_provider: Optional[str] = None
    ai_model: Optional[str] = None
    default_article_tone: Optional[str] = None
    auto_save_interval: Optional[int] = None
    session_timeout_minutes: Optional[int] = None
    enable_notifications: Optional[bool] = None


# Pagination schemas
class PaginatedResponse(BaseModel):
    total: int
    items: List[Any]


# Error schemas
class ErrorResponse(BaseModel):
    detail: str
    error_code: str
    status_code: int
