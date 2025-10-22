from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, extract
from app.database import get_db
from app.auth import get_current_user, require_permission
from app.models import (
    User, Task, Article, ScanJob, UsageTracking, AuditLog,
    Department, ChatSession, ChatMessage
)
from app.schemas import (
    UsageStatsRequest, UsageStatsResponse, DashboardAnalyticsResponse,
    PaginatedResponse
)
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/api/v1", tags=["Analytics & Reporting"])


@router.get("/analytics/usage", response_model=UsageStatsResponse)
async def get_usage_statistics(
    date_from: datetime = Query(..., description="Start date for statistics"),
    date_to: datetime = Query(..., description="End date for statistics"),
    group_by: Optional[str] = Query(None, description="Group by: user, department, day, week, month"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("bao-cao", "view"))
):
    """Get usage statistics for AI services"""
    # Base query for usage tracking
    query = db.query(UsageTracking).filter(
        and_(
            UsageTracking.created_at >= date_from,
            UsageTracking.created_at <= date_to
        )
    )
    
    # Get total statistics
    total_requests = query.count()
    total_tokens = db.query(func.sum(UsageTracking.tokens_used)).filter(
        and_(
            UsageTracking.created_at >= date_from,
            UsageTracking.created_at <= date_to
        )
    ).scalar() or 0
    
    total_cost_usd = db.query(func.sum(UsageTracking.cost_usd)).filter(
        and_(
            UsageTracking.created_at >= date_from,
            UsageTracking.created_at <= date_to
        )
    ).scalar() or 0.0
    
    # Get statistics by action
    by_action = {}
    actions = ["article_generation", "ai_chat", "scan_job", "prompt_test"]
    for action in actions:
        action_query = query.filter(UsageTracking.action == action)
        count = action_query.count()
        tokens = db.query(func.sum(UsageTracking.tokens_used)).filter(
            and_(
                UsageTracking.created_at >= date_from,
                UsageTracking.created_at <= date_to,
                UsageTracking.action == action
            )
        ).scalar() or 0
        cost = db.query(func.sum(UsageTracking.cost_usd)).filter(
            and_(
                UsageTracking.created_at >= date_from,
                UsageTracking.created_at <= date_to,
                UsageTracking.action == action
            )
        ).scalar() or 0.0
        
        by_action[action] = {
            "count": count,
            "tokens": tokens,
            "cost_usd": cost
        }
    
    # Get statistics by user
    by_user = []
    user_stats = db.query(
        UsageTracking.user_id,
        func.count(UsageTracking.id).label('requests'),
        func.sum(UsageTracking.tokens_used).label('tokens'),
        func.sum(UsageTracking.cost_usd).label('cost_usd')
    ).filter(
        and_(
            UsageTracking.created_at >= date_from,
            UsageTracking.created_at <= date_to
        )
    ).group_by(UsageTracking.user_id).all()
    
    for stat in user_stats:
        user = db.query(User).filter(User.user_id == stat.user_id).first()
        if user:
            by_user.append({
                "user_id": str(stat.user_id),
                "user_name": user.full_name,
                "requests": stat.requests,
                "tokens": stat.tokens or 0,
                "cost_usd": float(stat.cost_usd or 0)
            })
    
    # Get statistics by department
    by_department = []
    dept_stats = db.query(
        User.department_id,
        func.count(UsageTracking.id).label('requests'),
        func.sum(UsageTracking.tokens_used).label('tokens'),
        func.sum(UsageTracking.cost_usd).label('cost_usd')
    ).join(User, UsageTracking.user_id == User.user_id).filter(
        and_(
            UsageTracking.created_at >= date_from,
            UsageTracking.created_at <= date_to
        )
    ).group_by(User.department_id).all()
    
    for stat in dept_stats:
        if stat.department_id:
            dept = db.query(Department).filter(Department.id == stat.department_id).first()
            if dept:
                by_department.append({
                    "department_id": str(stat.department_id),
                    "department_name": dept.name,
                    "requests": stat.requests,
                    "tokens": stat.tokens or 0,
                    "cost_usd": float(stat.cost_usd or 0)
                })
    
    return UsageStatsResponse(
        period={"from": date_from, "to": date_to},
        total_requests=total_requests,
        total_tokens=total_tokens,
        total_cost_usd=float(total_cost_usd),
        by_action=by_action,
        by_user=by_user,
        by_department=by_department
    )


@router.post("/analytics/track")
async def track_api_usage(
    user_id: str,
    action: str,
    tokens_used: int,
    cost_usd: float,
    metadata: Optional[dict] = None,
    db: Session = Depends(get_db)
):
    """Track API usage (internal endpoint)"""
    # This endpoint is typically called internally by the backend
    # after each AI request to track usage and costs
    
    usage_record = UsageTracking(
        user_id=user_id,
        action=action,
        tokens_used=tokens_used,
        cost_usd=cost_usd,
        metadata=metadata
    )
    
    db.add(usage_record)
    db.commit()
    
    return {"message": "Usage tracked successfully"}


@router.get("/analytics/dashboard", response_model=DashboardAnalyticsResponse)
async def get_dashboard_analytics(
    period: str = Query("this_month", description="Period: today, this_week, this_month, last_30_days"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("bao-cao", "view"))
):
    """Get dashboard analytics"""
    # Calculate date range based on period
    now = datetime.utcnow()
    if period == "today":
        date_from = now.replace(hour=0, minute=0, second=0, microsecond=0)
        date_to = now
    elif period == "this_week":
        date_from = now - timedelta(days=now.weekday())
        date_from = date_from.replace(hour=0, minute=0, second=0, microsecond=0)
        date_to = now
    elif period == "this_month":
        date_from = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        date_to = now
    elif period == "last_30_days":
        date_from = now - timedelta(days=30)
        date_to = now
    else:
        date_from = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        date_to = now
    
    # Task statistics
    task_query = db.query(Task).filter(Task.created_at >= date_from)
    total_tasks = task_query.count()
    completed_tasks = task_query.filter(Task.status == "completed").count()
    in_progress_tasks = task_query.filter(Task.status == "in_progress").count()
    overdue_tasks = task_query.filter(
        and_(Task.due_date < now, Task.status.in_(["todo", "in_progress"]))
    ).count()
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Article statistics
    article_query = db.query(Article).filter(Article.created_at >= date_from)
    total_articles = article_query.count()
    draft_articles = article_query.filter(Article.status == "draft").count()
    published_articles = article_query.filter(Article.status == "published").count()
    processing_articles = article_query.filter(Article.status == "processing").count()
    
    # Scan statistics
    scan_query = db.query(ScanJob).filter(ScanJob.created_at >= date_from)
    total_scans = scan_query.count()
    completed_scans = scan_query.filter(ScanJob.status == "completed").count()
    failed_scans = scan_query.filter(ScanJob.status == "failed").count()
    total_items_found = db.query(func.sum(ScanJob.items_found)).filter(
        and_(ScanJob.created_at >= date_from, ScanJob.status == "completed")
    ).scalar() or 0
    
    # User statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "active").count()
    inactive_users = db.query(User).filter(User.status == "inactive").count()
    
    # AI usage statistics
    ai_usage_query = db.query(UsageTracking).filter(UsageTracking.created_at >= date_from)
    total_ai_requests = ai_usage_query.count()
    total_ai_tokens = db.query(func.sum(UsageTracking.tokens_used)).filter(
        UsageTracking.created_at >= date_from
    ).scalar() or 0
    total_ai_cost = db.query(func.sum(UsageTracking.cost_usd)).filter(
        UsageTracking.created_at >= date_from
    ).scalar() or 0.0
    
    return DashboardAnalyticsResponse(
        tasks={
            "total": total_tasks,
            "completed": completed_tasks,
            "in_progress": in_progress_tasks,
            "overdue": overdue_tasks,
            "completion_rate": round(completion_rate, 1)
        },
        articles={
            "total": total_articles,
            "draft": draft_articles,
            "published": published_articles,
            "processing": processing_articles
        },
        scans={
            "total": total_scans,
            "completed": completed_scans,
            "failed": failed_scans,
            "items_found": total_items_found
        },
        users={
            "total": total_users,
            "active": active_users,
            "inactive": inactive_users
        },
        ai_usage={
            "total_requests": total_ai_requests,
            "total_tokens": total_ai_tokens,
            "total_cost_usd": float(total_ai_cost)
        }
    )


@router.get("/analytics/activity-timeline")
async def get_activity_timeline(
    date_from: datetime = Query(..., description="Start date for timeline"),
    date_to: datetime = Query(..., description="End date for timeline"),
    group_by: str = Query("day", description="Group by: hour, day, week"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("bao-cao", "view"))
):
    """Get activity timeline"""
    timeline = []
    
    # Generate timeline based on group_by
    if group_by == "hour":
        # Group by hour
        current = date_from.replace(minute=0, second=0, microsecond=0)
        while current <= date_to:
            next_hour = current + timedelta(hours=1)
            
            # Get activity counts for this hour
            tasks_created = db.query(Task).filter(
                and_(Task.created_at >= current, Task.created_at < next_hour)
            ).count()
            
            tasks_completed = db.query(Task).filter(
                and_(Task.completed_at >= current, Task.completed_at < next_hour)
            ).count()
            
            articles_created = db.query(Article).filter(
                and_(Article.created_at >= current, Article.created_at < next_hour)
            ).count()
            
            articles_published = db.query(Article).filter(
                and_(Article.updated_at >= current, Article.updated_at < next_hour, Article.status == "published")
            ).count()
            
            scans_run = db.query(ScanJob).filter(
                and_(ScanJob.started_at >= current, ScanJob.started_at < next_hour)
            ).count()
            
            ai_requests = db.query(UsageTracking).filter(
                and_(UsageTracking.created_at >= current, UsageTracking.created_at < next_hour)
            ).count()
            
            timeline.append({
                "timestamp": current.isoformat(),
                "tasks_created": tasks_created,
                "tasks_completed": tasks_completed,
                "articles_created": articles_created,
                "articles_published": articles_published,
                "scans_run": scans_run,
                "ai_requests": ai_requests
            })
            
            current = next_hour
    
    elif group_by == "day":
        # Group by day
        current = date_from.replace(hour=0, minute=0, second=0, microsecond=0)
        while current <= date_to:
            next_day = current + timedelta(days=1)
            
            # Get activity counts for this day
            tasks_created = db.query(Task).filter(
                and_(Task.created_at >= current, Task.created_at < next_day)
            ).count()
            
            tasks_completed = db.query(Task).filter(
                and_(Task.completed_at >= current, Task.completed_at < next_day)
            ).count()
            
            articles_created = db.query(Article).filter(
                and_(Article.created_at >= current, Article.created_at < next_day)
            ).count()
            
            articles_published = db.query(Article).filter(
                and_(Article.updated_at >= current, Article.updated_at < next_day, Article.status == "published")
            ).count()
            
            scans_run = db.query(ScanJob).filter(
                and_(ScanJob.started_at >= current, ScanJob.started_at < next_day)
            ).count()
            
            ai_requests = db.query(UsageTracking).filter(
                and_(UsageTracking.created_at >= current, UsageTracking.created_at < next_day)
            ).count()
            
            timeline.append({
                "timestamp": current.isoformat(),
                "tasks_created": tasks_created,
                "tasks_completed": tasks_completed,
                "articles_created": articles_created,
                "articles_published": articles_published,
                "scans_run": scans_run,
                "ai_requests": ai_requests
            })
            
            current = next_day
    
    elif group_by == "week":
        # Group by week
        current = date_from.replace(hour=0, minute=0, second=0, microsecond=0)
        # Start from beginning of week
        current = current - timedelta(days=current.weekday())
        
        while current <= date_to:
            next_week = current + timedelta(weeks=1)
            
            # Get activity counts for this week
            tasks_created = db.query(Task).filter(
                and_(Task.created_at >= current, Task.created_at < next_week)
            ).count()
            
            tasks_completed = db.query(Task).filter(
                and_(Task.completed_at >= current, Task.completed_at < next_week)
            ).count()
            
            articles_created = db.query(Article).filter(
                and_(Article.created_at >= current, Article.created_at < next_week)
            ).count()
            
            articles_published = db.query(Article).filter(
                and_(Article.updated_at >= current, Article.updated_at < next_week, Article.status == "published")
            ).count()
            
            scans_run = db.query(ScanJob).filter(
                and_(ScanJob.started_at >= current, ScanJob.started_at < next_week)
            ).count()
            
            ai_requests = db.query(UsageTracking).filter(
                and_(UsageTracking.created_at >= current, UsageTracking.created_at < next_week)
            ).count()
            
            timeline.append({
                "timestamp": current.isoformat(),
                "tasks_created": tasks_created,
                "tasks_completed": tasks_completed,
                "articles_created": articles_created,
                "articles_published": articles_published,
                "scans_run": scans_run,
                "ai_requests": ai_requests
            })
            
            current = next_week
    
    return {"timeline": timeline}


@router.post("/analytics/export")
async def export_report(
    report_type: str,
    format: str,
    date_from: datetime,
    date_to: datetime,
    filters: Optional[dict] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("bao-cao", "export"))
):
    """Export analytics report"""
    # TODO: Implement actual report generation
    # This would typically generate a file (Excel, PDF, CSV) and return a download URL
    
    report_id = str(uuid.uuid4())
    
    return {
        "message": "Report generated successfully",
        "download_url": f"https://api.example.com/downloads/report-{report_id}.{format}",
        "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
    }


@router.get("/analytics/audit-logs", response_model=PaginatedResponse)
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[str] = Query(None),
    action_type: Optional[str] = Query(None),
    module: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("quan-tri", "view"))
):
    """Get audit logs"""
    query = db.query(AuditLog)
    
    # Apply filters
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if action_type:
        query = query.filter(AuditLog.action_type == action_type)
    if module:
        query = query.filter(AuditLog.module == module)
    if date_from:
        query = query.filter(AuditLog.timestamp >= date_from)
    if date_to:
        query = query.filter(AuditLog.timestamp <= date_to)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    logs = query.order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit).all()
    
    # Build response
    items = []
    for log in logs:
        # Get user info
        user = db.query(User).filter(User.user_id == log.user_id).first()
        user_name = user.full_name if user else "Unknown"
        
        items.append({
            "log_id": log.log_id,
            "user_id": log.user_id,
            "user_name": user_name,
            "action": log.action,
            "action_type": log.action_type,
            "module": log.module,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "entity_name": log.entity_name,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "timestamp": log.timestamp
        })
    
    return PaginatedResponse(total=total, items=items)
