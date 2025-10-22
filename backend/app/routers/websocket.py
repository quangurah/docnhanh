from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from typing import Dict, List
import json
import asyncio
from app.auth import verify_token
from app.database import get_db
from sqlalchemy.orm import Session
from app.models import User

router = APIRouter(prefix="/api/v1", tags=["WebSocket"])

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_text(json.dumps(message))
            except:
                # Connection closed, remove from active connections
                self.disconnect(user_id)
    
    async def broadcast(self, message: dict):
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(json.dumps(message))
            except:
                # Connection closed, remove from active connections
                self.disconnect(user_id)

manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    """WebSocket endpoint for real-time notifications"""
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    try:
        # Verify token
        payload = verify_token(token)
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Get user from database
        db = next(get_db())
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Connect user
        await manager.connect(websocket, user_id)
        
        # Send welcome message
        await manager.send_personal_message({
            "event": "connected",
            "data": {
                "user_id": user_id,
                "username": user.username,
                "message": "Connected to DocNhanh real-time updates"
            }
        }, user_id)
        
        # Keep connection alive and handle messages
        while True:
            try:
                # Wait for client message (ping/pong)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("event") == "ping":
                    await manager.send_personal_message({
                        "event": "pong",
                        "data": {"timestamp": "2025-01-20T10:00:00Z"}
                    }, user_id)
                
            except WebSocketDisconnect:
                manager.disconnect(user_id)
                break
            except Exception as e:
                print(f"WebSocket error: {e}")
                break
                
    except Exception as e:
        print(f"WebSocket connection error: {e}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)


async def send_task_assigned_notification(user_id: str, task_data: dict):
    """Send task assigned notification via WebSocket"""
    await manager.send_personal_message({
        "event": "task_assigned",
        "data": {
            "task_id": task_data.get("task_id"),
            "title": task_data.get("title"),
            "assigned_by": task_data.get("assigned_by")
        }
    }, user_id)


async def send_task_status_changed_notification(user_id: str, task_data: dict):
    """Send task status changed notification via WebSocket"""
    await manager.send_personal_message({
        "event": "task_status_changed",
        "data": {
            "task_id": task_data.get("task_id"),
            "old_status": task_data.get("old_status"),
            "new_status": task_data.get("new_status"),
            "updated_by": task_data.get("updated_by")
        }
    }, user_id)


async def send_new_notification(user_id: str, notification_data: dict):
    """Send new notification via WebSocket"""
    await manager.send_personal_message({
        "event": "new_notification",
        "data": {
            "notification_id": notification_data.get("notification_id"),
            "type": notification_data.get("type"),
            "title": notification_data.get("title"),
            "message": notification_data.get("message")
        }
    }, user_id)


async def send_article_published_notification(user_id: str, article_data: dict):
    """Send article published notification via WebSocket"""
    await manager.send_personal_message({
        "event": "article_published",
        "data": {
            "article_id": article_data.get("article_id"),
            "title": article_data.get("title"),
            "published_url": article_data.get("published_url")
        }
    }, user_id)


async def broadcast_system_announcement(message: str, announcement_type: str = "info"):
    """Broadcast system announcement to all connected users"""
    await manager.broadcast({
        "event": "system_announcement",
        "data": {
            "message": message,
            "type": announcement_type,
            "timestamp": "2025-01-20T10:00:00Z"
        }
    })
