from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from app.database import get_db
from app.auth import get_current_user, require_permission
from app.models import Task, User, Department, TaskUpdate, Article, AuditLog
from app.schemas import (
    TaskCreate, TaskUpdate as TaskUpdateSchema, TaskResponse, TaskDetailResponse,
    TaskSubmitRequest, TaskReviewRequest, BulkUpdateRequest, TaskStatsResponse,
    PaginatedResponse
)
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/api/v1", tags=["Task Management"])


@router.get("/tasks", response_model=PaginatedResponse)
async def get_all_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    department_id: Optional[str] = Query(None),
    assignee_id: Optional[str] = Query(None),
    created_by_id: Optional[str] = Query(None),
    due_date_from: Optional[datetime] = Query(None),
    due_date_to: Optional[datetime] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all tasks with filters and pagination"""
    query = db.query(Task)
    
    # Apply filters
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if department_id:
        query = query.filter(Task.department_id == department_id)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    if created_by_id:
        query = query.filter(Task.created_by_id == created_by_id)
    if due_date_from:
        query = query.filter(Task.due_date >= due_date_from)
    if due_date_to:
        query = query.filter(Task.due_date <= due_date_to)
    if search:
        search_filter = or_(
            Task.title.ilike(f"%{search}%"),
            Task.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    tasks = query.order_by(desc(Task.created_at)).offset(skip).limit(limit).all()
    
    # Build response
    items = []
    for task in tasks:
        # Get assignee info
        assignee = db.query(User).filter(User.user_id == task.assignee_id).first()
        assignee_name = assignee.full_name if assignee else "Unknown"
        assignee_avatar = assignee.avatar_url if assignee else None
        
        # Get department info
        department = db.query(Department).filter(Department.id == task.department_id).first()
        department_name = department.name if department else "Unknown"
        
        # Get creator info
        creator = db.query(User).filter(User.user_id == task.created_by_id).first()
        creator_name = creator.full_name if creator else "Unknown"
        
        # Get reviewer info
        reviewer_name = None
        if task.reviewer_id:
            reviewer = db.query(User).filter(User.user_id == task.reviewer_id).first()
            reviewer_name = reviewer.full_name if reviewer else None
        
        items.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "assignee_id": task.assignee_id,
            "assignee_name": assignee_name,
            "assignee_avatar": assignee_avatar,
            "department_id": task.department_id,
            "department_name": department_name,
            "status": task.status,
            "priority": task.priority,
            "due_date": task.due_date,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "started_at": task.started_at,
            "completed_at": task.completed_at,
            "created_by_id": task.created_by_id,
            "created_by_name": creator_name,
            "submission_status": task.submission_status,
            "submitted_at": task.submitted_at,
            "reviewed_at": task.reviewed_at,
            "reviewer_name": reviewer_name,
            "revision_notes": task.revision_notes,
            "article_id": task.article_id
        })
    
    return PaginatedResponse(total=total, items=items)


@router.get("/tasks/{task_id}", response_model=TaskDetailResponse)
async def get_task_by_id(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task by ID with updates"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get assignee info
    assignee = db.query(User).filter(User.user_id == task.assignee_id).first()
    assignee_name = assignee.full_name if assignee else "Unknown"
    assignee_avatar = assignee.avatar_url if assignee else None
    
    # Get department info
    department = db.query(Department).filter(Department.id == task.department_id).first()
    department_name = department.name if department else "Unknown"
    
    # Get creator info
    creator = db.query(User).filter(User.user_id == task.created_by_id).first()
    creator_name = creator.full_name if creator else "Unknown"
    
    # Get reviewer info
    reviewer_name = None
    if task.reviewer_id:
        reviewer = db.query(User).filter(User.user_id == task.reviewer_id).first()
        reviewer_name = reviewer.full_name if reviewer else None
    
    # Get task updates
    updates = db.query(TaskUpdate).filter(TaskUpdate.task_id == task.id)\
        .order_by(desc(TaskUpdate.created_at)).all()
    
    updates_data = []
    for update in updates:
        update_user = db.query(User).filter(User.user_id == update.user_id).first()
        updates_data.append({
            "id": update.id,
            "type": update.type,
            "user_id": update.user_id,
            "user_name": update_user.full_name if update_user else "Unknown",
            "old_value": update.old_value,
            "new_value": update.new_value,
            "comment": update.comment,
            "changes": update.changes,
            "created_at": update.created_at
        })
    
    return TaskDetailResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        assignee_id=task.assignee_id,
        assignee_name=assignee_name,
        assignee_avatar=assignee_avatar,
        department_id=task.department_id,
        department_name=department_name,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        created_at=task.created_at,
        updated_at=task.updated_at,
        started_at=task.started_at,
        completed_at=task.completed_at,
        created_by_id=task.created_by_id,
        created_by_name=creator_name,
        submission_status=task.submission_status,
        submitted_at=task.submitted_at,
        reviewed_at=task.reviewed_at,
        reviewer_name=reviewer_name,
        revision_notes=task.revision_notes,
        article_id=task.article_id,
        updates=updates_data
    )


@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("giao-viec", "create"))
):
    """Create new task"""
    # Validate assignee exists
    assignee = db.query(User).filter(User.user_id == task_data.assignee_id).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")
    
    # Validate department exists
    department = db.query(Department).filter(Department.id == task_data.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Create task
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        assignee_id=task_data.assignee_id,
        department_id=task_data.department_id,
        priority=task_data.priority,
        due_date=task_data.due_date,
        created_by_id=current_user.user_id,
        article_id=task_data.article_id,
        status="todo"
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    # Create task update record
    task_update = TaskUpdate(
        task_id=new_task.id,
        type="created",
        user_id=current_user.user_id,
        new_value=f"Task created: {new_task.title}"
    )
    db.add(task_update)
    db.commit()
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="task_created",
        action_type="create",
        module="giao-viec",
        entity_type="task",
        entity_id=new_task.id,
        entity_name=new_task.title
    )
    db.add(audit_log)
    db.commit()
    
    # Build response
    assignee_name = assignee.full_name
    assignee_avatar = assignee.avatar_url
    department_name = department.name
    creator_name = current_user.full_name
    
    return TaskResponse(
        id=new_task.id,
        title=new_task.title,
        description=new_task.description,
        assignee_id=new_task.assignee_id,
        assignee_name=assignee_name,
        assignee_avatar=assignee_avatar,
        department_id=new_task.department_id,
        department_name=department_name,
        status=new_task.status,
        priority=new_task.priority,
        due_date=new_task.due_date,
        created_at=new_task.created_at,
        updated_at=new_task.updated_at,
        started_at=new_task.started_at,
        completed_at=new_task.completed_at,
        created_by_id=new_task.created_by_id,
        created_by_name=creator_name,
        submission_status=new_task.submission_status,
        submitted_at=new_task.submitted_at,
        reviewed_at=new_task.reviewed_at,
        reviewer_name=None,
        revision_notes=new_task.revision_notes,
        article_id=new_task.article_id
    )


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions - user can edit if they're the assignee or have edit permission
    can_edit = (
        str(task.assignee_id) == str(current_user.user_id) or
        current_user.role in ["editor_in_chief", "department_head", "admin"]
    )
    
    if not can_edit:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Track changes for audit
    changes = {}
    old_values = {}
    
    if task_data.title is not None and task_data.title != task.title:
        old_values["title"] = task.title
        task.title = task_data.title
        changes["title"] = task_data.title
    
    if task_data.description is not None and task_data.description != task.description:
        old_values["description"] = task.description
        task.description = task_data.description
        changes["description"] = task_data.description
    
    if task_data.assignee_id is not None and task_data.assignee_id != task.assignee_id:
        # Validate new assignee
        new_assignee = db.query(User).filter(User.user_id == task_data.assignee_id).first()
        if not new_assignee:
            raise HTTPException(status_code=404, detail="New assignee not found")
        
        old_values["assignee_id"] = str(task.assignee_id)
        task.assignee_id = task_data.assignee_id
        changes["assignee_id"] = str(task_data.assignee_id)
    
    if task_data.department_id is not None and task_data.department_id != task.department_id:
        # Validate new department
        new_department = db.query(Department).filter(Department.id == task_data.department_id).first()
        if not new_department:
            raise HTTPException(status_code=404, detail="New department not found")
        
        old_values["department_id"] = str(task.department_id)
        task.department_id = task_data.department_id
        changes["department_id"] = str(task_data.department_id)
    
    if task_data.status is not None and task_data.status != task.status:
        old_values["status"] = task.status
        task.status = task_data.status
        changes["status"] = task_data.status
        
        # Handle status transitions
        if task_data.status == "in_progress" and task.started_at is None:
            task.started_at = datetime.utcnow()
        elif task_data.status == "completed":
            task.completed_at = datetime.utcnow()
    
    if task_data.priority is not None and task_data.priority != task.priority:
        old_values["priority"] = task.priority
        task.priority = task_data.priority
        changes["priority"] = task_data.priority
    
    if task_data.due_date is not None and task_data.due_date != task.due_date:
        old_values["due_date"] = task.due_date.isoformat()
        task.due_date = task_data.due_date
        changes["due_date"] = task_data.due_date.isoformat()
    
    task.updated_at = datetime.utcnow()
    db.commit()
    
    # Create task update record if there were changes
    if changes:
        update_type = "edited"
        if "status" in changes:
            update_type = "status_changed"
        elif "assignee_id" in changes:
            update_type = "reassigned"
        elif "priority" in changes:
            update_type = "priority_changed"
        elif "due_date" in changes:
            update_type = "deadline_changed"
        
        task_update = TaskUpdate(
            task_id=task.id,
            type=update_type,
            user_id=current_user.user_id,
            old_value=str(old_values) if old_values else None,
            new_value=str(changes),
            changes=list(changes.keys())
        )
        db.add(task_update)
        db.commit()
    
    # Get updated info for response
    assignee = db.query(User).filter(User.user_id == task.assignee_id).first()
    assignee_name = assignee.full_name if assignee else "Unknown"
    assignee_avatar = assignee.avatar_url if assignee else None
    
    department = db.query(Department).filter(Department.id == task.department_id).first()
    department_name = department.name if department else "Unknown"
    
    creator = db.query(User).filter(User.user_id == task.created_by_id).first()
    creator_name = creator.full_name if creator else "Unknown"
    
    reviewer_name = None
    if task.reviewer_id:
        reviewer = db.query(User).filter(User.user_id == task.reviewer_id).first()
        reviewer_name = reviewer.full_name if reviewer else None
    
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        assignee_id=task.assignee_id,
        assignee_name=assignee_name,
        assignee_avatar=assignee_avatar,
        department_id=task.department_id,
        department_name=department_name,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        created_at=task.created_at,
        updated_at=task.updated_at,
        started_at=task.started_at,
        completed_at=task.completed_at,
        created_by_id=task.created_by_id,
        created_by_name=creator_name,
        submission_status=task.submission_status,
        submitted_at=task.submitted_at,
        reviewed_at=task.reviewed_at,
        reviewer_name=reviewer_name,
        revision_notes=task.revision_notes,
        article_id=task.article_id
    )


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("giao-viec", "delete"))
):
    """Delete task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if task has dependencies (e.g., linked articles)
    if task.article_id:
        article = db.query(Article).filter(Article.article_id == task.article_id).first()
        if article:
            raise HTTPException(
                status_code=409, 
                detail="Cannot delete task with linked article. Please unlink article first."
            )
    
    # Delete task updates first
    db.query(TaskUpdate).filter(TaskUpdate.task_id == task.id).delete()
    
    # Delete task
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}


@router.post("/tasks/{task_id}/submit")
async def submit_task_for_review(
    task_id: str,
    request: TaskSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit task for review"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user is the assignee
    if str(task.assignee_id) != str(current_user.user_id):
        raise HTTPException(status_code=403, detail="Only task assignee can submit for review")
    
    # Update task
    task.submission_status = "pending_review"
    task.submitted_at = datetime.utcnow()
    if request.article_id:
        task.article_id = request.article_id
    
    # Create task update
    task_update = TaskUpdate(
        task_id=task.id,
        type="submitted",
        user_id=current_user.user_id,
        new_value="Task submitted for review"
    )
    db.add(task_update)
    db.commit()
    
    return {
        "message": "Task submitted for review",
        "submission_status": "pending_review",
        "submitted_at": task.submitted_at
    }


@router.post("/tasks/{task_id}/review")
async def review_task(
    task_id: str,
    request: TaskReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("giao-viec", "approve"))
):
    """Approve or request revision for task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.submission_status != "pending_review":
        raise HTTPException(status_code=400, detail="Task is not pending review")
    
    # Update task based on action
    if request.action == "approve":
        task.submission_status = "approved"
        task.status = "completed"
        task.completed_at = datetime.utcnow()
    elif request.action == "request_revision":
        task.submission_status = "revision_requested"
        task.revision_notes = request.revision_notes
        task.status = "todo"  # Reset to todo for revision
    
    task.reviewed_at = datetime.utcnow()
    task.reviewer_id = current_user.user_id
    
    # Create task update
    task_update = TaskUpdate(
        task_id=task.id,
        type="reviewed",
        user_id=current_user.user_id,
        new_value=f"Task {request.action}ed",
        comment=request.revision_notes if request.action == "request_revision" else None
    )
    db.add(task_update)
    db.commit()
    
    return {
        "message": f"Task {request.action}ed",
        "submission_status": task.submission_status,
        "reviewed_at": task.reviewed_at,
        "reviewer_name": current_user.full_name
    }


@router.post("/tasks/bulk-update")
async def bulk_update_tasks(
    request: BulkUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("giao-viec", "edit"))
):
    """Bulk update multiple tasks"""
    updated_count = 0
    
    for task_id in request.task_ids:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            continue
        
        # Apply updates
        if "status" in request.updates:
            task.status = request.updates["status"]
            if request.updates["status"] == "in_progress" and task.started_at is None:
                task.started_at = datetime.utcnow()
            elif request.updates["status"] == "completed":
                task.completed_at = datetime.utcnow()
        
        if "priority" in request.updates:
            task.priority = request.updates["priority"]
        
        if "assignee_id" in request.updates:
            # Validate new assignee
            new_assignee = db.query(User).filter(User.user_id == request.updates["assignee_id"]).first()
            if new_assignee:
                task.assignee_id = request.updates["assignee_id"]
        
        task.updated_at = datetime.utcnow()
        updated_count += 1
    
    db.commit()
    
    return {
        "message": f"Updated {updated_count} tasks successfully",
        "updated_count": updated_count
    }


@router.get("/tasks/stats", response_model=TaskStatsResponse)
async def get_task_stats(
    department_id: Optional[str] = Query(None),
    assignee_id: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task statistics"""
    query = db.query(Task)
    
    # Apply filters
    if department_id:
        query = query.filter(Task.department_id == department_id)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    if date_from:
        query = query.filter(Task.created_at >= date_from)
    if date_to:
        query = query.filter(Task.created_at <= date_to)
    
    # Get counts
    total = query.count()
    
    by_status = {
        "todo": query.filter(Task.status == "todo").count(),
        "in_progress": query.filter(Task.status == "in_progress").count(),
        "completed": query.filter(Task.status == "completed").count(),
        "blocked": query.filter(Task.status == "blocked").count()
    }
    
    by_priority = {
        "low": query.filter(Task.priority == "low").count(),
        "medium": query.filter(Task.priority == "medium").count(),
        "high": query.filter(Task.priority == "high").count(),
        "urgent": query.filter(Task.priority == "urgent").count()
    }
    
    # Calculate overdue tasks
    now = datetime.utcnow()
    overdue = query.filter(
        and_(Task.due_date < now, Task.status.in_(["todo", "in_progress"]))
    ).count()
    
    # Calculate due today
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    due_today = query.filter(
        and_(
            Task.due_date >= today_start,
            Task.due_date < today_end,
            Task.status.in_(["todo", "in_progress"])
        )
    ).count()
    
    # Calculate due this week
    week_end = today_start + timedelta(days=7)
    due_this_week = query.filter(
        and_(
            Task.due_date >= today_start,
            Task.due_date < week_end,
            Task.status.in_(["todo", "in_progress"])
        )
    ).count()
    
    # Calculate completion rate
    completion_rate = 0.0
    if total > 0:
        completion_rate = (by_status["completed"] / total) * 100
    
    return TaskStatsResponse(
        total=total,
        by_status=by_status,
        by_priority=by_priority,
        overdue=overdue,
        due_today=due_today,
        due_this_week=due_this_week,
        completion_rate=completion_rate
    )
