from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from app.database import get_db
from app.auth import get_current_user
from app.models import Notification, User
from app.schemas import NotificationResponse, PaginatedResponse
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/v1", tags=["Notifications"])


@router.get("/notifications", response_model=PaginatedResponse)
async def get_user_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user notifications"""
    query = db.query(Notification).filter(Notification.user_id == current_user.user_id)
    
    # Apply filters
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Get total count
    total = query.count()
    
    # Get unread count
    unread_count = db.query(Notification).filter(
        and_(Notification.user_id == current_user.user_id, Notification.is_read == False)
    ).count()
    
    # Apply pagination and ordering
    notifications = query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()
    
    # Build response
    items = []
    for notification in notifications:
        items.append({
            "notification_id": notification.notification_id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "link": notification.link,
            "is_read": notification.is_read,
            "created_at": notification.created_at,
            "metadata": notification.metadata
        })
    
    return PaginatedResponse(
        total=total,
        items=items,
        unread_count=unread_count
    )


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark notification as read"""
    notification = db.query(Notification).filter(
        and_(
            Notification.notification_id == notification_id,
            Notification.user_id == current_user.user_id
        )
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}


@router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    count = db.query(Notification).filter(
        and_(
            Notification.user_id == current_user.user_id,
            Notification.is_read == False
        )
    ).update({"is_read": True})
    
    db.commit()
    
    return {
        "message": "All notifications marked as read",
        "count": count
    }


@router.post("/notifications")
async def create_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    link: Optional[str] = None,
    metadata: Optional[dict] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create notification (internal endpoint)"""
    # This endpoint is typically called internally by the backend
    # to create notifications for users
    
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        link=link,
        metadata=metadata
    )
    
    db.add(notification)
    db.commit()
    
    return {"message": "Notification created successfully"}


@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete notification"""
    notification = db.query(Notification).filter(
        and_(
            Notification.notification_id == notification_id,
            Notification.user_id == current_user.user_id
        )
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}


@router.get("/notifications/stats")
async def get_notification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notification statistics for current user"""
    # Get total notifications
    total = db.query(Notification).filter(Notification.user_id == current_user.user_id).count()
    
    # Get unread count
    unread = db.query(Notification).filter(
        and_(Notification.user_id == current_user.user_id, Notification.is_read == False)
    ).count()
    
    # Get by type
    by_type = {}
    types = ["task_assigned", "task_completed", "article_published", "mention"]
    for notification_type in types:
        count = db.query(Notification).filter(
            and_(Notification.user_id == current_user.user_id, Notification.type == notification_type)
        ).count()
        by_type[notification_type] = count
    
    return {
        "total": total,
        "unread": unread,
        "by_type": by_type
    }
