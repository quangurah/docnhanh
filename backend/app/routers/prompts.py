from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from app.database import get_db
from app.auth import get_current_user, require_permission
from app.models import Prompt, AuditLog, User
from app.schemas import (
    PromptCreate, PromptUpdate, PromptResponse,
    PaginatedResponse
)
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/v1", tags=["Prompt Management"])


@router.get("/prompts", response_model=PaginatedResponse)
async def get_all_prompts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all prompts with filters and pagination"""
    query = db.query(Prompt)
    
    # Apply filters
    if category:
        query = query.filter(Prompt.category == category)
    if search:
        search_filter = or_(
            Prompt.name.ilike(f"%{search}%"),
            Prompt.description.ilike(f"%{search}%"),
            Prompt.content.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    prompts = query.order_by(desc(Prompt.usage_count), desc(Prompt.created_at)).offset(skip).limit(limit).all()
    
    # Build response
    items = []
    for prompt in prompts:
        items.append({
            "prompt_id": prompt.prompt_id,
            "name": prompt.name,
            "description": prompt.description,
            "content": prompt.content,
            "category": prompt.category,
            "is_default": prompt.is_default,
            "usage_count": prompt.usage_count,
            "created_at": prompt.created_at,
            "updated_at": prompt.updated_at
        })
    
    return PaginatedResponse(total=total, items=items)


@router.get("/prompts/{prompt_id}", response_model=PromptResponse)
async def get_prompt_by_id(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get prompt by ID"""
    prompt = db.query(Prompt).filter(Prompt.prompt_id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    return PromptResponse(
        prompt_id=prompt.prompt_id,
        name=prompt.name,
        description=prompt.description,
        content=prompt.content,
        category=prompt.category,
        is_default=prompt.is_default,
        usage_count=prompt.usage_count,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at
    )


@router.post("/prompts", response_model=PromptResponse)
async def create_prompt(
    prompt_data: PromptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("quan-tri", "edit"))
):
    """Create new prompt"""
    # If this is set as default, unset other defaults in the same category
    if prompt_data.is_default:
        db.query(Prompt).filter(
            and_(Prompt.category == prompt_data.category, Prompt.is_default == True)
        ).update({"is_default": False})
    
    # Create prompt
    new_prompt = Prompt(
        name=prompt_data.name,
        description=prompt_data.description,
        content=prompt_data.content,
        category=prompt_data.category,
        is_default=prompt_data.is_default
    )
    
    db.add(new_prompt)
    db.commit()
    db.refresh(new_prompt)
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="prompt_created",
        action_type="create",
        module="quan-tri",
        entity_type="prompt",
        entity_id=new_prompt.prompt_id,
        entity_name=new_prompt.name
    )
    db.add(audit_log)
    db.commit()
    
    return PromptResponse(
        prompt_id=new_prompt.prompt_id,
        name=new_prompt.name,
        description=new_prompt.description,
        content=new_prompt.content,
        category=new_prompt.category,
        is_default=new_prompt.is_default,
        usage_count=new_prompt.usage_count,
        created_at=new_prompt.created_at,
        updated_at=new_prompt.updated_at
    )


@router.put("/prompts/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: str,
    prompt_data: PromptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("quan-tri", "edit"))
):
    """Update prompt"""
    prompt = db.query(Prompt).filter(Prompt.prompt_id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # If this is set as default, unset other defaults in the same category
    if prompt_data.is_default and prompt_data.is_default != prompt.is_default:
        db.query(Prompt).filter(
            and_(Prompt.category == prompt.category, Prompt.is_default == True)
        ).update({"is_default": False})
    
    # Update fields
    if prompt_data.name is not None:
        prompt.name = prompt_data.name
    if prompt_data.description is not None:
        prompt.description = prompt_data.description
    if prompt_data.content is not None:
        prompt.content = prompt_data.content
    if prompt_data.category is not None:
        prompt.category = prompt_data.category
    if prompt_data.is_default is not None:
        prompt.is_default = prompt_data.is_default
    
    prompt.updated_at = datetime.utcnow()
    db.commit()
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="prompt_updated",
        action_type="update",
        module="quan-tri",
        entity_type="prompt",
        entity_id=prompt.prompt_id,
        entity_name=prompt.name
    )
    db.add(audit_log)
    db.commit()
    
    return PromptResponse(
        prompt_id=prompt.prompt_id,
        name=prompt.name,
        description=prompt.description,
        content=prompt.content,
        category=prompt.category,
        is_default=prompt.is_default,
        usage_count=prompt.usage_count,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at
    )


@router.delete("/prompts/{prompt_id}")
async def delete_prompt(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("quan-tri", "edit"))
):
    """Delete prompt"""
    prompt = db.query(Prompt).filter(Prompt.prompt_id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Check if it's a default prompt
    if prompt.is_default:
        raise HTTPException(
            status_code=409, 
            detail="Cannot delete default prompt. Please set another prompt as default first."
        )
    
    # Check if prompt is being used
    if prompt.usage_count > 0:
        raise HTTPException(
            status_code=409, 
            detail=f"Cannot delete prompt with {prompt.usage_count} uses. Please reassign articles first."
        )
    
    # Delete prompt
    db.delete(prompt)
    db.commit()
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="prompt_deleted",
        action_type="delete",
        module="quan-tri",
        entity_type="prompt",
        entity_id=prompt.prompt_id,
        entity_name=prompt.name
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Prompt deleted successfully"}


@router.get("/prompts/categories")
async def get_prompt_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all prompt categories with counts"""
    categories = db.query(
        Prompt.category,
        func.count(Prompt.prompt_id).label('count')
    ).group_by(Prompt.category).all()
    
    return {
        "categories": [
            {"name": cat[0], "count": cat[1]} 
            for cat in categories
        ]
    }


@router.get("/prompts/default/{category}")
async def get_default_prompt(
    category: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get default prompt for category"""
    prompt = db.query(Prompt).filter(
        and_(Prompt.category == category, Prompt.is_default == True)
    ).first()
    
    if not prompt:
        raise HTTPException(status_code=404, detail=f"No default prompt found for category: {category}")
    
    return PromptResponse(
        prompt_id=prompt.prompt_id,
        name=prompt.name,
        description=prompt.description,
        content=prompt.content,
        category=prompt.category,
        is_default=prompt.is_default,
        usage_count=prompt.usage_count,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at
    )


@router.post("/prompts/{prompt_id}/use")
async def use_prompt(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Increment prompt usage count"""
    prompt = db.query(Prompt).filter(Prompt.prompt_id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Increment usage count
    prompt.usage_count += 1
    prompt.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Prompt usage recorded", "usage_count": prompt.usage_count}
