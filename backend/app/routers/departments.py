from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.database import get_db
from app.auth import get_current_user, require_permission
from app.models import Department, User, Task
from app.schemas import (
    DepartmentCreate, DepartmentUpdate, DepartmentResponse, 
    DepartmentDetailResponse, PaginatedResponse
)
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/v1", tags=["Department Management"])


@router.get("/departments", response_model=PaginatedResponse)
async def get_all_departments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all departments with pagination"""
    query = db.query(Department)
    total = query.count()
    
    departments = query.offset(skip).limit(limit).all()
    
    items = []
    for dept in departments:
        # Get staff count
        staff_count = db.query(User).filter(User.department_id == dept.id).count()
        
        # Get task counts
        active_tasks = db.query(Task).filter(
            and_(Task.department_id == dept.id, Task.status.in_(["todo", "in_progress"]))
        ).count()
        
        completed_tasks = db.query(Task).filter(
            and_(Task.department_id == dept.id, Task.status == "completed")
        ).count()
        
        pending_tasks = db.query(Task).filter(
            and_(Task.department_id == dept.id, Task.status == "todo")
        ).count()
        
        # Get leader name
        leader_name = None
        if dept.leader_id:
            leader = db.query(User).filter(User.user_id == dept.leader_id).first()
            leader_name = leader.full_name if leader else None
        
        items.append({
            "id": dept.id,
            "name": dept.name,
            "description": dept.description,
            "icon": dept.icon,
            "staff_count": staff_count,
            "active_tasks": active_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "leader_id": dept.leader_id,
            "leader_name": leader_name,
            "created_at": dept.created_at,
            "updated_at": dept.updated_at
        })
    
    return PaginatedResponse(total=total, items=items)


@router.get("/departments/{department_id}", response_model=DepartmentDetailResponse)
async def get_department_by_id(
    department_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get department by ID with members"""
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Get staff count
    staff_count = db.query(User).filter(User.department_id == department.id).count()
    
    # Get task counts
    active_tasks = db.query(Task).filter(
        and_(Task.department_id == department.id, Task.status.in_(["todo", "in_progress"]))
    ).count()
    
    completed_tasks = db.query(Task).filter(
        and_(Task.department_id == department.id, Task.status == "completed")
    ).count()
    
    pending_tasks = db.query(Task).filter(
        and_(Task.department_id == department.id, Task.status == "todo")
    ).count()
    
    # Get leader name
    leader_name = None
    if department.leader_id:
        leader = db.query(User).filter(User.user_id == department.leader_id).first()
        leader_name = leader.full_name if leader else None
    
    # Get members
    members = db.query(User).filter(User.department_id == department.id).all()
    members_data = []
    for member in members:
        members_data.append({
            "staff_id": member.user_id,
            "user_id": member.user_id,
            "full_name": member.full_name,
            "position": member.position,
            "avatar_url": member.avatar_url,
            "status": member.status
        })
    
    return DepartmentDetailResponse(
        id=department.id,
        name=department.name,
        description=department.description,
        icon=department.icon,
        staff_count=staff_count,
        active_tasks=active_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        leader_id=department.leader_id,
        leader_name=leader_name,
        members=members_data,
        created_at=department.created_at,
        updated_at=department.updated_at
    )


@router.post("/departments", response_model=DepartmentResponse)
async def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("nhan-su", "create"))
):
    """Create new department"""
    # Validate leader exists if provided
    if department_data.leader_id:
        leader = db.query(User).filter(User.user_id == department_data.leader_id).first()
        if not leader:
            raise HTTPException(status_code=404, detail="Leader not found")
    
    # Create department
    new_department = Department(
        name=department_data.name,
        description=department_data.description,
        icon=department_data.icon,
        leader_id=department_data.leader_id
    )
    
    db.add(new_department)
    db.commit()
    db.refresh(new_department)
    
    return DepartmentResponse(
        id=new_department.id,
        name=new_department.name,
        description=new_department.description,
        icon=new_department.icon,
        staff_count=0,
        active_tasks=0,
        completed_tasks=0,
        pending_tasks=0,
        leader_id=new_department.leader_id,
        leader_name=None,
        created_at=new_department.created_at,
        updated_at=new_department.updated_at
    )


@router.put("/departments/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: str,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("nhan-su", "edit"))
):
    """Update department"""
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Validate leader exists if provided
    if department_data.leader_id:
        leader = db.query(User).filter(User.user_id == department_data.leader_id).first()
        if not leader:
            raise HTTPException(status_code=404, detail="Leader not found")
    
    # Update fields
    if department_data.name is not None:
        department.name = department_data.name
    if department_data.description is not None:
        department.description = department_data.description
    if department_data.icon is not None:
        department.icon = department_data.icon
    if department_data.leader_id is not None:
        department.leader_id = department_data.leader_id
    
    department.updated_at = datetime.utcnow()
    db.commit()
    
    # Get updated counts
    staff_count = db.query(User).filter(User.department_id == department.id).count()
    active_tasks = db.query(Task).filter(
        and_(Task.department_id == department.id, Task.status.in_(["todo", "in_progress"]))
    ).count()
    completed_tasks = db.query(Task).filter(
        and_(Task.department_id == department.id, Task.status == "completed")
    ).count()
    pending_tasks = db.query(Task).filter(
        and_(Task.department_id == department.id, Task.status == "todo")
    ).count()
    
    # Get leader name
    leader_name = None
    if department.leader_id:
        leader = db.query(User).filter(User.user_id == department.leader_id).first()
        leader_name = leader.full_name if leader else None
    
    return DepartmentResponse(
        id=department.id,
        name=department.name,
        description=department.description,
        icon=department.icon,
        staff_count=staff_count,
        active_tasks=active_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        leader_id=department.leader_id,
        leader_name=leader_name,
        created_at=department.created_at,
        updated_at=department.updated_at
    )


@router.delete("/departments/{department_id}")
async def delete_department(
    department_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("nhan-su", "delete"))
):
    """Delete department"""
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if department has staff
    staff_count = db.query(User).filter(User.department_id == department.id).count()
    if staff_count > 0:
        raise HTTPException(
            status_code=409, 
            detail=f"Cannot delete department with {staff_count} staff members. Please reassign staff first."
        )
    
    # Check if department has active tasks
    active_tasks = db.query(Task).filter(
        and_(Task.department_id == department.id, Task.status.in_(["todo", "in_progress"]))
    ).count()
    
    if active_tasks > 0:
        raise HTTPException(
            status_code=409, 
            detail=f"Cannot delete department with {active_tasks} active tasks. Please reassign tasks first."
        )
    
    db.delete(department)
    db.commit()
    
    return {"message": "Department deleted successfully"}
