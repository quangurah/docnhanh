from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.database import get_db
from app.auth import get_current_user, require_permission, get_password_hash
from app.models import User, Department, Task, Article, AuditLog
from app.schemas import (
    StaffCreate, StaffUpdate, StaffResponse, StaffDetailResponse, 
    ResetPasswordRequest, PaginatedResponse
)
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/v1", tags=["User Management"])


@router.get("/users", response_model=PaginatedResponse)
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("nhan-su", "view"))
):
    """Get all users with pagination and filters"""
    query = db.query(User)
    
    # Apply filters
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)
    if search:
        search_filter = or_(
            User.full_name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.username.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    users = query.offset(skip).limit(limit).all()
    
    # Build response
    items = []
    for user in users:
        # Get task counts
        active_tasks = db.query(Task).filter(
            and_(Task.assignee_id == user.user_id, Task.status.in_(["todo", "in_progress"]))
        ).count()
        
        completed_tasks = db.query(Task).filter(
            and_(Task.assignee_id == user.user_id, Task.status == "completed")
        ).count()
        
        items.append({
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "department_id": user.department_id,
            "department_name": user.department.name if user.department else None,
            "position": user.position,
            "status": user.status,
            "avatar_url": user.avatar_url,
            "last_login": user.last_login,
            "created_at": user.created_at,
            "active_tasks": active_tasks,
            "completed_tasks": completed_tasks
        })
    
    return PaginatedResponse(total=total, items=items)


@router.get("/users/{user_id}", response_model=StaffDetailResponse)
async def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("nhan-su", "view"))
):
    """Get user by ID"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get task counts
    active_tasks = db.query(Task).filter(
        and_(Task.assignee_id == user.user_id, Task.status.in_(["todo", "in_progress"]))
    ).count()
    
    completed_tasks = db.query(Task).filter(
        and_(Task.assignee_id == user.user_id, Task.status == "completed")
    ).count()
    
    # Get recent tasks
    recent_tasks = db.query(Task).filter(Task.assignee_id == user.user_id)\
        .order_by(Task.created_at.desc()).limit(5).all()
    
    recent_tasks_data = []
    for task in recent_tasks:
        recent_tasks_data.append({
            "task_id": task.id,
            "title": task.title,
            "status": task.status,
            "priority": task.priority,
            "due_date": task.due_date
        })
    
    return StaffDetailResponse(
        id=user.user_id,
        user_id=user.user_id,
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        department_id=user.department_id,
        department_name=user.department.name if user.department else None,
        position=user.position,
        role=user.role,
        avatar_url=user.avatar_url,
        status=user.status,
        active_tasks=active_tasks,
        completed_tasks=completed_tasks,
        join_date=user.join_date,
        created_at=user.created_at,
        updated_at=user.updated_at,
        recent_tasks=recent_tasks_data
    )


@router.post("/users", response_model=dict)
async def create_user(
    user_data: StaffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("nhan-su", "create"))
):
    """Create new user"""
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Username already exists")
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already exists")
    
    # Validate department exists
    if user_data.department_id:
        department = db.query(Department).filter(Department.id == user_data.department_id).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=hashed_password,
        phone=user_data.phone,
        department_id=user_data.department_id,
        position=user_data.position,
        role=user_data.role,
        status="active"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="user_created",
        action_type="create",
        module="nhan-su",
        entity_type="user",
        entity_id=new_user.user_id,
        entity_name=new_user.full_name,
        new_value=f"{{'username': '{new_user.username}', 'role': '{new_user.role}'}}"
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "user_id": new_user.user_id,
        "username": new_user.username,
        "message": "User created successfully"
    }


@router.put("/users/{user_id}", response_model=StaffResponse)
async def update_user(
    user_id: str,
    user_data: StaffUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("nhan-su", "edit"))
):
    """Update user"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if trying to update self (allow limited updates)
    if str(user.user_id) == str(current_user.user_id):
        # Users can only update their own profile (not role)
        if user_data.role and user_data.role != user.role:
            raise HTTPException(status_code=403, detail="Cannot change your own role")
    
    # Validate department exists
    if user_data.department_id:
        department = db.query(Department).filter(Department.id == user_data.department_id).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")
    
    # Update fields
    old_values = {}
    if user_data.full_name is not None:
        old_values["full_name"] = user.full_name
        user.full_name = user_data.full_name
    if user_data.email is not None:
        old_values["email"] = user.email
        user.email = user_data.email
    if user_data.phone is not None:
        old_values["phone"] = user.phone
        user.phone = user_data.phone
    if user_data.department_id is not None:
        old_values["department_id"] = user.department_id
        user.department_id = user_data.department_id
    if user_data.position is not None:
        old_values["position"] = user.position
        user.position = user_data.position
    if user_data.role is not None:
        old_values["role"] = user.role
        user.role = user_data.role
    if user_data.status is not None:
        old_values["status"] = user.status
        user.status = user_data.status
    
    user.updated_at = datetime.utcnow()
    db.commit()
    
    # Log audit
    if old_values:
        audit_log = AuditLog(
            user_id=current_user.user_id,
            action="user_updated",
            action_type="update",
            module="nhan-su",
            entity_type="user",
            entity_id=user.user_id,
            entity_name=user.full_name,
            old_value=str(old_values),
            new_value=str({k: v for k, v in user_data.dict().items() if v is not None})
        )
        db.add(audit_log)
        db.commit()
    
    return StaffResponse(
        id=user.user_id,
        user_id=user.user_id,
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        department_id=user.department_id,
        department_name=user.department.name if user.department else None,
        position=user.position,
        role=user.role,
        avatar_url=user.avatar_url,
        status=user.status,
        active_tasks=0,  # Will be calculated in detail endpoint
        completed_tasks=0,
        join_date=user.join_date,
        created_at=user.created_at,
        updated_at=user.updated_at
    )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("nhan-su", "delete"))
):
    """Delete user (soft delete)"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Cannot delete self
    if str(user.user_id) == str(current_user.user_id):
        raise HTTPException(status_code=403, detail="Cannot delete your own account")
    
    # Check if user has active tasks
    active_tasks = db.query(Task).filter(
        and_(Task.assignee_id == user.user_id, Task.status.in_(["todo", "in_progress"]))
    ).count()
    
    if active_tasks > 0:
        raise HTTPException(
            status_code=409, 
            detail=f"Cannot delete user with {active_tasks} active tasks. Please reassign tasks first."
        )
    
    # Soft delete (set status to inactive)
    user.status = "inactive"
    user.updated_at = datetime.utcnow()
    db.commit()
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="user_deleted",
        action_type="delete",
        module="nhan-su",
        entity_type="user",
        entity_id=user.user_id,
        entity_name=user.full_name
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "User deleted successfully"}


@router.post("/users/{user_id}/reset-password")
async def reset_password(
    user_id: str,
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("nhan-su", "edit"))
):
    """Reset user password"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password
    user.password_hash = get_password_hash(request.new_password)
    user.updated_at = datetime.utcnow()
    db.commit()
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="password_reset",
        action_type="update",
        module="nhan-su",
        entity_type="user",
        entity_id=user.user_id,
        entity_name=user.full_name
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Password reset successfully"}


@router.get("/users/{user_id}/stats")
async def get_user_stats(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("nhan-su", "view"))
):
    """Get user statistics"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get statistics
    total_articles_created = db.query(Article).filter(Article.created_by_id == user.user_id).count()
    total_articles_published = db.query(Article).filter(
        and_(Article.created_by_id == user.user_id, Article.status == "published")
    ).count()
    
    # Get task statistics
    total_tasks_assigned = db.query(Task).filter(Task.assignee_id == user.user_id).count()
    total_tasks_completed = db.query(Task).filter(
        and_(Task.assignee_id == user.user_id, Task.status == "completed")
    ).count()
    
    return {
        "user_id": user.user_id,
        "username": user.username,
        "stats": {
            "total_articles_created": total_articles_created,
            "total_articles_published": total_articles_published,
            "total_tasks_assigned": total_tasks_assigned,
            "total_tasks_completed": total_tasks_completed,
            "last_login": user.last_login,
            "account_created": user.created_at
        }
    }
