from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from app.database import get_db
from app.auth import get_current_user, require_permission
from app.models import Article, User, ScanJob, AuditLog
from app.schemas import (
    ArticleCreateFromSource, ArticleCreateFromManualURL, ArticleUpdate,
    ArticleResponse, ArticleDetailResponse, ArticlePublishResponse,
    PaginatedResponse
)
from datetime import datetime
import uuid
import httpx
import asyncio

router = APIRouter(prefix="/api/v1", tags=["Article Management"])


@router.get("/articles", response_model=PaginatedResponse)
async def get_all_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    created_by_id: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all articles with filters and pagination"""
    query = db.query(Article)
    
    # Apply filters
    if status:
        query = query.filter(Article.status == status)
    if created_by_id:
        query = query.filter(Article.created_by_id == created_by_id)
    if date_from:
        query = query.filter(Article.created_at >= date_from)
    if date_to:
        query = query.filter(Article.created_at <= date_to)
    if search:
        search_filter = or_(
            Article.title.ilike(f"%{search}%"),
            Article.content_html.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    articles = query.order_by(desc(Article.created_at)).offset(skip).limit(limit).all()
    
    # Build response
    items = []
    for article in articles:
        # Get creator info
        creator = db.query(User).filter(User.user_id == article.created_by_id).first()
        creator_name = creator.full_name if creator else "Unknown"
        
        items.append({
            "article_id": article.article_id,
            "title": article.title,
            "status": article.status,
            "created_at": article.created_at,
            "created_by_id": article.created_by_id,
            "created_by_name": creator_name,
            "source_job_id": article.source_job_id,
            "source_url": article.source_url,
            "published_url": article.published_url,
            "word_count": article.word_count,
            "last_edited_at": article.last_edited_at
        })
    
    return PaginatedResponse(total=total, items=items)


@router.get("/articles/{article_id}", response_model=ArticleDetailResponse)
async def get_article_by_id(
    article_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get article by ID"""
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Get creator info
    creator = db.query(User).filter(User.user_id == article.created_by_id).first()
    creator_name = creator.full_name if creator else "Unknown"
    
    return ArticleDetailResponse(
        article_id=article.article_id,
        title=article.title,
        status=article.status,
        created_at=article.created_at,
        created_by_id=article.created_by_id,
        created_by_name=creator_name,
        source_job_id=article.source_job_id,
        source_url=article.source_url,
        published_url=article.published_url,
        content_html=article.content_html or "",
        word_count=article.word_count,
        last_edited_at=article.last_edited_at,
        editor_instructions=article.editor_instructions,
        prompt_used=article.prompt_used
    )


@router.get("/articles/{article_id}/content")
async def get_article_content(
    article_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get article content only"""
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return {"content": article.content_html or ""}


@router.post("/articles/create-from-source", response_model=ArticleResponse)
async def create_article_from_source(
    request: ArticleCreateFromSource,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("noi-dung-ai", "create"))
):
    """Create article from scan source"""
    # Validate source job exists
    source_job = db.query(ScanJob).filter(ScanJob.scan_id == request.source_job_id).first()
    if not source_job:
        raise HTTPException(status_code=404, detail="Source job not found")
    
    # Create article
    new_article = Article(
        title=request.title,
        status="processing",
        created_by_id=current_user.user_id,
        source_job_id=request.source_job_id,
        source_url=request.source_url,
        editor_instructions=request.editor_instructions,
        prompt_used=request.prompt_file
    )
    
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="article_created_from_source",
        action_type="create",
        module="noi-dung-ai",
        entity_type="article",
        entity_id=new_article.article_id,
        entity_name=new_article.title
    )
    db.add(audit_log)
    db.commit()
    
    # TODO: Start background task for AI content generation
    # This would typically be handled by a background task queue like Celery
    
    return ArticleResponse(
        article_id=new_article.article_id,
        title=new_article.title,
        status=new_article.status,
        created_at=new_article.created_at,
        created_by_id=new_article.created_by_id,
        created_by_name=current_user.full_name,
        source_job_id=new_article.source_job_id,
        source_url=new_article.source_url,
        published_url=new_article.published_url,
        word_count=new_article.word_count,
        last_edited_at=new_article.last_edited_at
    )


@router.post("/articles/create-from-manual-url", response_model=ArticleResponse)
async def create_article_from_manual_url(
    request: ArticleCreateFromManualURL,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("noi-dung-ai", "create"))
):
    """Create article from manual URL"""
    # Create article
    new_article = Article(
        title="Processing...",  # Will be updated by AI
        status="processing",
        created_by_id=current_user.user_id,
        source_url=request.url,
        editor_instructions=request.editor_instructions,
        prompt_used=request.prompt_file
    )
    
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="article_created_from_url",
        action_type="create",
        module="noi-dung-ai",
        entity_type="article",
        entity_id=new_article.article_id,
        entity_name=new_article.title
    )
    db.add(audit_log)
    db.commit()
    
    # TODO: Start background task for URL scraping and AI content generation
    # This would typically be handled by a background task queue like Celery
    
    return ArticleResponse(
        article_id=new_article.article_id,
        title=new_article.title,
        status=new_article.status,
        created_at=new_article.created_at,
        created_by_id=new_article.created_by_id,
        created_by_name=current_user.full_name,
        source_job_id=new_article.source_job_id,
        source_url=new_article.source_url,
        published_url=new_article.published_url,
        word_count=new_article.word_count,
        last_edited_at=new_article.last_edited_at
    )


@router.put("/articles/{article_id}/content")
async def update_article_content(
    article_id: str,
    request: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("noi-dung-ai", "edit"))
):
    """Update article content"""
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Update content
    if request.content_html is not None:
        article.content_html = request.content_html
        article.last_edited_at = datetime.utcnow()
        
        # Update word count (simple estimation)
        if request.content_html:
            # Remove HTML tags and count words
            import re
            text_content = re.sub(r'<[^>]+>', '', request.content_html)
            word_count = len(text_content.split())
            article.word_count = word_count
    
    article.updated_at = datetime.utcnow()
    db.commit()
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="article_content_updated",
        action_type="update",
        module="noi-dung-ai",
        entity_type="article",
        entity_id=article.article_id,
        entity_name=article.title
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "message": "Article content updated",
        "last_edited_at": article.last_edited_at
    }


@router.post("/articles/{article_id}/publish", response_model=ArticlePublishResponse)
async def publish_article(
    article_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("noi-dung-ai", "approve"))
):
    """Publish article"""
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if article.status != "draft":
        raise HTTPException(status_code=400, detail="Only draft articles can be published")
    
    # Update article status
    article.status = "published"
    article.published_url = f"https://congthuong.vn/article-{article.article_id}.html"
    article.updated_at = datetime.utcnow()
    
    db.commit()
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="article_published",
        action_type="update",
        module="noi-dung-ai",
        entity_type="article",
        entity_id=article.article_id,
        entity_name=article.title
    )
    db.add(audit_log)
    db.commit()
    
    # TODO: Integrate with CMS (WordPress API) to push article to website
    # This would typically be handled by a background task
    
    return ArticlePublishResponse(
        message="Article published successfully",
        published_url=article.published_url,
        published_at=article.updated_at
    )


@router.delete("/articles/{article_id}")
async def delete_article(
    article_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("noi-dung-ai", "delete"))
):
    """Delete article"""
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check if article is published
    if article.status == "published":
        raise HTTPException(
            status_code=409, 
            detail="Cannot delete published article. Please unpublish first."
        )
    
    # Delete article
    db.delete(article)
    db.commit()
    
    # Log audit
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action="article_deleted",
        action_type="delete",
        module="noi-dung-ai",
        entity_type="article",
        entity_id=article.article_id,
        entity_name=article.title
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Article deleted successfully"}


@router.post("/articles/batch-update")
async def batch_update_articles(
    article_ids: List[str],
    updates: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("noi-dung-ai", "edit"))
):
    """Batch update multiple articles"""
    updated_count = 0
    
    for article_id in article_ids:
        article = db.query(Article).filter(Article.article_id == article_id).first()
        if not article:
            continue
        
        # Apply updates
        if "status" in updates:
            article.status = updates["status"]
        
        article.updated_at = datetime.utcnow()
        updated_count += 1
    
    db.commit()
    
    return {
        "message": f"Updated {updated_count} articles successfully",
        "updated_count": updated_count
    }


@router.get("/articles/stats")
async def get_article_stats(
    created_by_id: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get article statistics"""
    query = db.query(Article)
    
    # Apply filters
    if created_by_id:
        query = query.filter(Article.created_by_id == created_by_id)
    if date_from:
        query = query.filter(Article.created_at >= date_from)
    if date_to:
        query = query.filter(Article.created_at <= date_to)
    
    # Get counts
    total = query.count()
    
    by_status = {
        "draft": query.filter(Article.status == "draft").count(),
        "processing": query.filter(Article.status == "processing").count(),
        "published": query.filter(Article.status == "published").count()
    }
    
    # Get word count statistics
    total_words = db.query(func.sum(Article.word_count)).filter(
        Article.word_count > 0
    ).scalar() or 0
    
    avg_words = 0
    if total > 0:
        avg_words = total_words / total
    
    return {
        "total": total,
        "by_status": by_status,
        "total_words": total_words,
        "avg_words": round(avg_words, 2)
    }


@router.post("/articles/{article_id}/export")
async def export_article(
    article_id: str,
    format: str = "docx",  # docx, pdf, html
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export article to file"""
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # TODO: Implement actual file export logic
    # This would typically generate a file and return a download URL
    
    return {
        "message": f"Article exported to {format.upper()}",
        "download_url": f"https://api.example.com/downloads/article-{article_id}.{format}",
        "expires_at": datetime.utcnow().isoformat()
    }
