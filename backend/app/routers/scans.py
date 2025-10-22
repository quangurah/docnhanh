from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from app.database import get_db
from app.auth import get_current_user, require_permission
from app.models import ScanJob, User, AuditLog
from app.schemas import (
    ScanJobCreate, ScanJobResponse, ScanJobDetailResponse,
    PaginatedResponse
)
from datetime import datetime
import uuid
import httpx
import asyncio

router = APIRouter(prefix="/api/v1", tags=["Scan Management"])


@router.get("/scans", response_model=PaginatedResponse)
async def get_all_scan_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all scan jobs with filters and pagination"""
    query = db.query(ScanJob)
    
    # Apply filters
    if status:
        query = query.filter(ScanJob.status == status)
    if date_from:
        query = query.filter(ScanJob.created_at >= date_from)
    if date_to:
        query = query.filter(ScanJob.created_at <= date_to)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    scan_jobs = query.order_by(desc(ScanJob.created_at)).offset(skip).limit(limit).all()
    
    # Build response
    items = []
    for scan_job in scan_jobs:
        # Get creator info
        creator = db.query(User).filter(User.user_id == scan_job.created_by_id).first()
        creator_name = creator.full_name if creator else "Unknown"
        
        items.append({
            "scan_id": scan_job.scan_id,
            "source_name": scan_job.source_name,
            "source_url": scan_job.source_url,
            "status": scan_job.status,
            "items_found": scan_job.items_found,
            "items_processed": scan_job.items_processed,
            "started_at": scan_job.started_at,
            "completed_at": scan_job.completed_at,
            "created_by_id": scan_job.created_by_id,
            "created_by_name": creator_name,
            "error_message": scan_job.error_message
        })
    
    return PaginatedResponse(total=total, items=items)


@router.get("/scans/{scan_id}", response_model=ScanJobDetailResponse)
async def get_scan_job_by_id(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get scan job by ID with items"""
    scan_job = db.query(ScanJob).filter(ScanJob.scan_id == scan_id).first()
    if not scan_job:
        raise HTTPException(status_code=404, detail="Scan job not found")
    
    # Get creator info
    creator = db.query(User).filter(User.user_id == scan_job.created_by_id).first()
    creator_name = creator.full_name if creator else "Unknown"
    
    # TODO: Get scan items from database or external storage
    # For now, return empty items list
    items = []
    
    return ScanJobDetailResponse(
        scan_id=scan_job.scan_id,
        source_name=scan_job.source_name,
        source_url=scan_job.source_url,
        status=scan_job.status,
        items_found=scan_job.items_found,
        items_processed=scan_job.items_processed,
        started_at=scan_job.started_at,
        completed_at=scan_job.completed_at,
        created_by_id=scan_job.created_by_id,
        created_by_name=creator_name,
        error_message=scan_job.error_message,
        items=items
    )


@router.post("/scans", response_model=ScanJobResponse)
async def create_scan_job(
    scan_data: ScanJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("noi-dung-ai", "create"))
):
    """Create new scan job"""
    # Create scan job
    new_scan_job = ScanJob(
        source_name=scan_data.source_name,
        source_url=scan_data.source_url,
        scan_depth=scan_data.scan_depth,
        max_items=scan_data.max_items,
        status="pending",
        created_by_id=current_user.user_id
    )
    
    db.add(new_scan_job)
    db.commit()
    db.refresh(new_scan_job)
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="scan_job_created",
        action_type="create",
        module="noi-dung-ai",
        entity_type="scan_job",
        entity_id=new_scan_job.scan_id,
        entity_name=new_scan_job.source_name
    )
    db.add(audit_log)
    db.commit()
    
    # TODO: Start background task for scanning
    # This would typically be handled by a background task queue like Celery
    # For now, we'll simulate the scan process
    
    return ScanJobResponse(
        scan_id=new_scan_job.scan_id,
        source_name=new_scan_job.source_name,
        source_url=new_scan_job.source_url,
        status=new_scan_job.status,
        items_found=new_scan_job.items_found,
        items_processed=new_scan_job.items_processed,
        started_at=new_scan_job.started_at,
        completed_at=new_scan_job.completed_at,
        created_by_id=new_scan_job.created_by_id,
        created_by_name=current_user.full_name,
        error_message=new_scan_job.error_message
    )


@router.post("/scans/{scan_id}/retry")
async def retry_failed_scan(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("noi-dung-ai", "create"))
):
    """Retry failed scan job"""
    scan_job = db.query(ScanJob).filter(ScanJob.scan_id == scan_id).first()
    if not scan_job:
        raise HTTPException(status_code=404, detail="Scan job not found")
    
    if scan_job.status not in ["failed", "completed"]:
        raise HTTPException(status_code=400, detail="Can only retry failed or completed scans")
    
    # Reset scan job
    scan_job.status = "pending"
    scan_job.started_at = None
    scan_job.completed_at = None
    scan_job.error_message = None
    scan_job.items_found = 0
    scan_job.items_processed = 0
    
    db.commit()
    
    # TODO: Start background task for scanning
    # This would typically be handled by a background task queue like Celery
    
    return {
        "message": "Scan job restarted",
        "scan_id": scan_job.scan_id,
        "status": "pending"
    }


@router.get("/scans/{scan_id}/items")
async def get_scan_items(
    scan_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get scan job items"""
    scan_job = db.query(ScanJob).filter(ScanJob.scan_id == scan_id).first()
    if not scan_job:
        raise HTTPException(status_code=404, detail="Scan job not found")
    
    # TODO: Get items from database or external storage
    # For now, return mock data
    items = []
    
    return {
        "total": len(items),
        "items": items[skip:skip + limit]
    }


@router.get("/scans/{scan_id}/items/{filename}")
async def get_scan_item_file(
    scan_id: str,
    filename: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get scan job item file"""
    scan_job = db.query(ScanJob).filter(ScanJob.scan_id == scan_id).first()
    if not scan_job:
        raise HTTPException(status_code=404, detail="Scan job not found")
    
    # TODO: Get file from storage
    # For now, return mock content
    return {
        "filename": filename,
        "content": "Mock file content",
        "size": 1024,
        "type": "text/plain"
    }


@router.get("/scans/stats")
async def get_scan_stats(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get scan statistics"""
    query = db.query(ScanJob)
    
    # Apply filters
    if date_from:
        query = query.filter(ScanJob.created_at >= date_from)
    if date_to:
        query = query.filter(ScanJob.created_at <= date_to)
    
    # Get counts
    total = query.count()
    
    by_status = {
        "pending": query.filter(ScanJob.status == "pending").count(),
        "running": query.filter(ScanJob.status == "running").count(),
        "completed": query.filter(ScanJob.status == "completed").count(),
        "failed": query.filter(ScanJob.status == "failed").count()
    }
    
    # Get total items found and processed
    total_items_found = db.query(func.sum(ScanJob.items_found)).scalar() or 0
    total_items_processed = db.query(func.sum(ScanJob.items_processed)).scalar() or 0
    
    return {
        "total": total,
        "by_status": by_status,
        "total_items_found": total_items_found,
        "total_items_processed": total_items_processed,
        "success_rate": round((by_status["completed"] / total * 100) if total > 0 else 0, 2)
    }
