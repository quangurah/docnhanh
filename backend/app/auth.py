from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import UserResponse

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token scheme
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    return user


def get_user_permissions(user: User) -> dict:
    """Get user permissions based on role"""
    permissions = {
        "giao-viec": {
            "view": True,
            "create": user.role in ["editor_in_chief", "department_head", "admin"],
            "edit": user.role in ["editor_in_chief", "department_head", "admin"],
            "delete": user.role in ["editor_in_chief", "admin"],
            "assign": user.role in ["editor_in_chief", "department_head", "admin"],
            "approve": user.role in ["editor_in_chief", "department_head", "admin"],
            "export": True
        },
        "noi-dung-ai": {
            "view": True,
            "create": user.role in ["editor_in_chief", "department_head", "reporter", "admin"],
            "edit": user.role in ["editor_in_chief", "department_head", "reporter", "admin"],
            "delete": user.role in ["editor_in_chief", "admin"],
            "assign": user.role in ["editor_in_chief", "department_head", "admin"],
            "approve": user.role in ["editor_in_chief", "admin"],
            "export": True
        },
        "nhan-su": {
            "view": user.role in ["editor_in_chief", "admin"],
            "create": user.role in ["editor_in_chief", "admin"],
            "edit": user.role in ["editor_in_chief", "admin"],
            "delete": user.role in ["editor_in_chief", "admin"],
            "assign": False,
            "approve": False,
            "export": user.role in ["editor_in_chief", "admin"]
        },
        "quan-tri": {
            "view": user.role in ["editor_in_chief", "admin"],
            "create": user.role in ["editor_in_chief", "admin"],
            "edit": user.role in ["editor_in_chief", "admin"],
            "delete": user.role in ["editor_in_chief", "admin"],
            "assign": False,
            "approve": False,
            "export": user.role in ["editor_in_chief", "admin"]
        },
        "bao-cao": {
            "view": user.role in ["editor_in_chief", "department_head", "admin"],
            "create": False,
            "edit": False,
            "delete": False,
            "assign": False,
            "approve": False,
            "export": user.role in ["editor_in_chief", "department_head", "admin"]
        }
    }
    return permissions


def require_permission(module: str, action: str):
    """Decorator to check user permissions"""
    def permission_checker(current_user: User = Depends(get_current_user)):
        permissions = get_user_permissions(current_user)
        if not permissions.get(module, {}).get(action, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {module}:{action}"
            )
        return current_user
    return permission_checker


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate user with username and password"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
