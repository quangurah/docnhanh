from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from app.database import get_db
from app.auth import get_current_user, require_permission
from app.models import ChatSession, ChatMessage, User, UsageTracking
from app.schemas import (
    ChatMessageRequest, ChatMessageResponse, ChatSessionResponse, 
    ChatSessionDetailResponse, PaginatedResponse
)
from datetime import datetime
import uuid
import httpx
import asyncio

router = APIRouter(prefix="/api/v1", tags=["AI Chat"])


@router.get("/chat/sessions", response_model=PaginatedResponse)
async def get_chat_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chat sessions"""
    query = db.query(ChatSession)
    
    # Filter by user if specified (admin only)
    if user_id and current_user.role in ["editor_in_chief", "admin"]:
        query = query.filter(ChatSession.user_id == user_id)
    elif current_user.role not in ["editor_in_chief", "admin"]:
        # Regular users can only see their own sessions
        query = query.filter(ChatSession.user_id == current_user.user_id)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    sessions = query.order_by(desc(ChatSession.last_activity)).offset(skip).limit(limit).all()
    
    # Build response
    items = []
    for session in sessions:
        # Get user info
        user = db.query(User).filter(User.user_id == session.user_id).first()
        user_name = user.full_name if user else "Unknown"
        
        # Get message count
        message_count = db.query(ChatMessage).filter(ChatMessage.session_id == session.session_id).count()
        
        items.append({
            "session_id": session.session_id,
            "user_id": session.user_id,
            "user_name": user_name,
            "title": session.title,
            "message_count": message_count,
            "started_at": session.started_at,
            "last_activity": session.last_activity,
            "page_context": session.page_context
        })
    
    return PaginatedResponse(total=total, items=items)


@router.get("/chat/sessions/{session_id}", response_model=ChatSessionDetailResponse)
async def get_chat_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chat session by ID with messages"""
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    # Check permissions
    if str(session.user_id) != str(current_user.user_id) and current_user.role not in ["editor_in_chief", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get user info
    user = db.query(User).filter(User.user_id == session.user_id).first()
    user_name = user.full_name if user else "Unknown"
    
    # Get messages
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id)\
        .order_by(ChatMessage.timestamp).all()
    
    messages_data = []
    for message in messages:
        messages_data.append({
            "message_id": message.message_id,
            "type": message.type,
            "content": message.content,
            "timestamp": message.timestamp,
            "suggestions": message.suggestions,
            "quick_actions": message.quick_actions
        })
    
    return ChatSessionDetailResponse(
        session_id=session.session_id,
        user_id=session.user_id,
        user_name=user_name,
        title=session.title,
        started_at=session.started_at,
        last_activity=session.last_activity,
        page_context=session.page_context,
        messages=messages_data
    )


@router.post("/chat/send", response_model=ChatMessageResponse)
async def send_chat_message(
    request: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send chat message and get AI response"""
    # Get or create session
    session = None
    if request.session_id:
        session = db.query(ChatSession).filter(ChatSession.session_id == request.session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Check permissions
        if str(session.user_id) != str(current_user.user_id):
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Create new session
        session = ChatSession(
            user_id=current_user.user_id,
            title=request.message[:50] + "..." if len(request.message) > 50 else request.message,
            page_context=request.page_context
        )
        db.add(session)
        db.commit()
        db.refresh(session)
    
    # Create user message
    user_message = ChatMessage(
        session_id=session.session_id,
        type="user",
        content=request.message
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Update session last activity
    session.last_activity = datetime.utcnow()
    db.commit()
    
    # TODO: Get AI response
    # This would typically call OpenAI API or similar
    ai_response_content = await get_ai_response(request.message, request.context_data)
    
    # Create AI message
    ai_message = ChatMessage(
        session_id=session.session_id,
        type="ai",
        content=ai_response_content,
        suggestions=["Bạn có muốn tạo task mới?", "Xem thống kê công việc"],
        quick_actions=[
            {
                "label": "Tạo công việc",
                "action": "create_task",
                "icon": "plus"
            }
        ]
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    
    # Track AI usage
    usage_record = UsageTracking(
        user_id=current_user.user_id,
        action="ai_chat",
        tokens_used=len(request.message) + len(ai_response_content),  # Rough estimation
        cost_usd=0.001,  # Rough estimation
        metadata={
            "session_id": str(session.session_id),
            "message_id": str(ai_message.message_id)
        }
    )
    db.add(usage_record)
    db.commit()
    
    return ChatMessageResponse(
        session_id=session.session_id,
        message_id=ai_message.message_id,
        ai_response={
            "message_id": ai_message.message_id,
            "type": "ai",
            "content": ai_response_content,
            "timestamp": ai_message.timestamp,
            "suggestions": ai_message.suggestions,
            "quick_actions": ai_message.quick_actions
        }
    )


async def get_ai_response(message: str, context_data: Optional[dict] = None) -> str:
    """Get AI response for chat message"""
    # TODO: Implement actual AI integration
    # This would typically call OpenAI API, Claude, or similar
    
    # Mock response for now
    responses = [
        "Tôi hiểu bạn đang hỏi về {}. Để giúp bạn tốt hơn, bạn có thể:",
        "Dựa trên câu hỏi của bạn về {}, tôi khuyến nghị:",
        "Để giải quyết vấn đề {}, bạn có thể thử:",
        "Tôi có thể giúp bạn với {}. Dưới đây là một số gợi ý:"
    ]
    
    import random
    response = random.choice(responses).format("hệ thống DocNhanh")
    
    return f"{response}\n\n1. Kiểm tra dashboard để xem tổng quan\n2. Tạo task mới nếu cần\n3. Xem báo cáo thống kê\n4. Quản lý nội dung AI"


@router.delete("/chat/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete chat session"""
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    # Check permissions
    if str(session.user_id) != str(current_user.user_id) and current_user.role not in ["editor_in_chief", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete messages first
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    
    # Delete session
    db.delete(session)
    db.commit()
    
    return {"message": "Chat session deleted successfully"}


@router.get("/chat/analytics")
async def get_chat_analytics(
    date_from: datetime = Query(..., description="Start date for analytics"),
    date_to: datetime = Query(..., description="End date for analytics"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("quan-tri", "view"))
):
    """Get chat analytics (admin only)"""
    # Get session statistics
    total_sessions = db.query(ChatSession).filter(
        and_(ChatSession.started_at >= date_from, ChatSession.started_at <= date_to)
    ).count()
    
    total_messages = db.query(ChatMessage).filter(
        and_(ChatMessage.timestamp >= date_from, ChatMessage.timestamp <= date_to)
    ).count()
    
    # Get active users (users who had chat sessions)
    active_users = db.query(ChatSession.user_id).filter(
        and_(ChatSession.started_at >= date_from, ChatSession.started_at <= date_to)
    ).distinct().count()
    
    # Calculate average messages per session
    avg_messages_per_session = total_messages / total_sessions if total_sessions > 0 else 0
    
    # Get most common topics (mock data for now)
    most_common_topics = [
        {"topic": "Giao việc", "count": 89, "percentage": 38.0},
        {"topic": "Nội dung AI", "count": 67, "percentage": 28.6},
        {"topic": "Báo cáo", "count": 45, "percentage": 19.2},
        {"topic": "Khác", "count": 33, "percentage": 14.2}
    ]
    
    # Get by page context
    page_context_stats = db.query(
        ChatSession.page_context,
        func.count(ChatSession.session_id).label('count')
    ).filter(
        and_(ChatSession.started_at >= date_from, ChatSession.started_at <= date_to)
    ).group_by(ChatSession.page_context).all()
    
    by_page_context = {
        ctx[0] or "dashboard": ctx[1] for ctx in page_context_stats
    }
    
    return {
        "total_sessions": total_sessions,
        "total_messages": total_messages,
        "active_users": active_users,
        "avg_messages_per_session": round(avg_messages_per_session, 1),
        "most_common_topics": most_common_topics,
        "by_page_context": by_page_context
    }
