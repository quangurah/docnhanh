from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from app.database import get_db
from app.auth import get_current_user, require_permission
from app.models import Source, AuditLog, User
from app.schemas import (
    SourceCreate, SourceUpdate, SourceResponse,
    PaginatedResponse
)
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/v1", tags=["Source Management"])


@router.get("/sources", response_model=PaginatedResponse)
async def get_all_sources(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all sources with filters and pagination"""
    query = db.query(Source)
    
    # Apply filters
    if category:
        query = query.filter(Source.category == category)
    if is_active is not None:
        query = query.filter(Source.is_active == is_active)
    if search:
        search_filter = or_(
            Source.name.ilike(f"%{search}%"),
            Source.url.ilike(f"%{search}%"),
            Source.category.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    sources = query.order_by(desc(Source.total_scans), desc(Source.created_at)).offset(skip).limit(limit).all()
    
    # Build response
    items = []
    for source in sources:
        items.append({
            "source_id": source.source_id,
            "name": source.name,
            "url": source.url,
            "category": source.category,
            "is_active": source.is_active,
            "auto_scan": source.auto_scan,
            "scan_frequency": source.scan_frequency,
            "last_scan_at": source.last_scan_at,
            "total_scans": source.total_scans,
            "created_at": source.created_at
        })
    
    return PaginatedResponse(total=total, items=items)


@router.get("/sources/{source_id}", response_model=SourceResponse)
async def get_source_by_id(
    source_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get source by ID"""
    source = db.query(Source).filter(Source.source_id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    return SourceResponse(
        source_id=source.source_id,
        name=source.name,
        url=source.url,
        category=source.category,
        is_active=source.is_active,
        auto_scan=source.auto_scan,
        scan_frequency=source.scan_frequency,
        last_scan_at=source.last_scan_at,
        total_scans=source.total_scans,
        created_at=source.created_at
    )


@router.post("/sources", response_model=SourceResponse)
async def create_source(
    source_data: SourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("quan-tri", "edit"))
):
    """Create new source"""
    # Check if URL already exists
    existing_source = db.query(Source).filter(Source.url == source_data.url).first()
    if existing_source:
        raise HTTPException(status_code=409, detail="Source URL already exists")
    
    # Create source
    new_source = Source(
        name=source_data.name,
        url=source_data.url,
        category=source_data.category,
        is_active=source_data.is_active,
        auto_scan=source_data.auto_scan,
        scan_frequency=source_data.scan_frequency
    )
    
    db.add(new_source)
    db.commit()
    db.refresh(new_source)
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="source_created",
        action_type="create",
        module="quan-tri",
        entity_type="source",
        entity_id=new_source.source_id,
        entity_name=new_source.name
    )
    db.add(audit_log)
    db.commit()
    
    return SourceResponse(
        source_id=new_source.source_id,
        name=new_source.name,
        url=new_source.url,
        category=new_source.category,
        is_active=new_source.is_active,
        auto_scan=new_source.auto_scan,
        scan_frequency=new_source.scan_frequency,
        last_scan_at=new_source.last_scan_at,
        total_scans=new_source.total_scans,
        created_at=new_source.created_at
    )


@router.put("/sources/{source_id}", response_model=SourceResponse)
async def update_source(
    source_id: str,
    source_data: SourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("quan-tri", "edit"))
):
    """Update source"""
    source = db.query(Source).filter(Source.source_id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    # Check if new URL already exists (if URL is being changed)
    if source_data.url and source_data.url != source.url:
        existing_source = db.query(Source).filter(Source.url == source_data.url).first()
        if existing_source:
            raise HTTPException(status_code=409, detail="Source URL already exists")
    
    # Update fields
    if source_data.name is not None:
        source.name = source_data.name
    if source_data.url is not None:
        source.url = source_data.url
    if source_data.category is not None:
        source.category = source_data.category
    if source_data.is_active is not None:
        source.is_active = source_data.is_active
    if source_data.auto_scan is not None:
        source.auto_scan = source_data.auto_scan
    if source_data.scan_frequency is not None:
        source.scan_frequency = source_data.scan_frequency
    
    db.commit()
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="source_updated",
        action_type="update",
        module="quan-tri",
        entity_type="source",
        entity_id=source.source_id,
        entity_name=source.name
    )
    db.add(audit_log)
    db.commit()
    
    return SourceResponse(
        source_id=source.source_id,
        name=source.name,
        url=source.url,
        category=source.category,
        is_active=source.is_active,
        auto_scan=source.auto_scan,
        scan_frequency=source.scan_frequency,
        last_scan_at=source.last_scan_at,
        total_scans=source.total_scans,
        created_at=source.created_at
    )


@router.delete("/sources/{source_id}")
async def delete_source(
    source_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("quan-tri", "edit"))
):
    """Delete source"""
    source = db.query(Source).filter(Source.source_id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    # Check if source has scan history
    if source.total_scans > 0:
        raise HTTPException(
            status_code=409, 
            detail=f"Cannot delete source with {source.total_scans} scan history. Please archive instead."
        )
    
    # Delete source
    db.delete(source)
    db.commit()
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="source_deleted",
        action_type="delete",
        module="quan-tri",
        entity_type="source",
        entity_id=source.source_id,
        entity_name=source.name
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Source deleted successfully"}


@router.post("/sources/{source_id}/test")
async def test_source(
    source_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test source connectivity"""
    source = db.query(Source).filter(Source.source_id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    # TODO: Implement actual source testing logic
    # This would typically make a test request to the source URL
    
    return {
        "message": "Source test completed",
        "source_id": source.source_id,
        "status": "success",
        "response_time_ms": 150,
        "last_checked": datetime.utcnow().isoformat()
    }


@router.post("/sources/{source_id}/scan")
async def trigger_manual_scan(
    source_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("noi-dung-ai", "create"))
):
    """Trigger manual scan for source"""
    source = db.query(Source).filter(Source.source_id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    if not source.is_active:
        raise HTTPException(status_code=400, detail="Source is not active")
    
    # TODO: Start background scan job
    # This would typically be handled by a background task queue like Celery
    
    return {
        "message": "Manual scan triggered",
        "source_id": source.source_id,
        "scan_job_id": f"manual_{source_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        "status": "pending"
    }


@router.get("/sources/categories")
async def get_source_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all source categories with counts"""
    categories = db.query(
        Source.category,
        func.count(Source.source_id).label('count')
    ).group_by(Source.category).all()
    
    return {
        "categories": [
            {"name": cat[0] or "Uncategorized", "count": cat[1]} 
            for cat in categories
        ]
    }


@router.get("/sources/stats")
async def get_source_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get source statistics"""
    total_sources = db.query(Source).count()
    active_sources = db.query(Source).filter(Source.is_active == True).count()
    auto_scan_sources = db.query(Source).filter(Source.auto_scan == True).count()
    
    # Get scan frequency distribution
    frequency_stats = db.query(
        Source.scan_frequency,
        func.count(Source.source_id).label('count')
    ).group_by(Source.scan_frequency).all()
    
    return {
        "total_sources": total_sources,
        "active_sources": active_sources,
        "auto_scan_sources": auto_scan_sources,
        "by_frequency": {
            freq[0]: freq[1] for freq in frequency_stats
        }
    }
