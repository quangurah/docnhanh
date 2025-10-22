from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import hashlib
import secrets
import string
from app.database import get_db
from app.models import AuditLog, User
from sqlalchemy.orm import Session

def generate_random_string(length: int = 32) -> str:
    """Generate random string"""
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(length))

def hash_string(text: str) -> str:
    """Hash string using SHA256"""
    return hashlib.sha256(text.encode()).hexdigest()

def log_audit(
    user_id: str,
    action: str,
    action_type: str,
    module: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    entity_name: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    db: Session = None
):
    """Log audit trail"""
    if db is None:
        db = next(get_db())
    
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        action_type=action_type,
        module=module,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_name=entity_name,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    db.add(audit_log)
    db.commit()

def get_user_by_id(user_id: str, db: Session) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.user_id == user_id).first()

def format_datetime(dt: datetime) -> str:
    """Format datetime to ISO string"""
    return dt.isoformat() if dt else None

def parse_datetime(dt_str: str) -> Optional[datetime]:
    """Parse ISO datetime string"""
    try:
        return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    except:
        return None

def calculate_word_count(text: str) -> int:
    """Calculate word count from text"""
    if not text:
        return 0
    # Remove HTML tags and count words
    import re
    clean_text = re.sub(r'<[^>]+>', '', text)
    return len(clean_text.split())

def validate_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    import re
    pattern = r'^(\+84|84|0)[1-9][0-9]{8,9}$'
    return re.match(pattern, phone) is not None

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    import re
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:255-len(ext)-1] + ('.' + ext if ext else '')
    return filename

def get_file_extension(filename: str) -> str:
    """Get file extension"""
    return filename.split('.')[-1].lower() if '.' in filename else ''

def is_image_file(filename: str) -> bool:
    """Check if file is an image"""
    image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
    return get_file_extension(filename) in image_extensions

def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"

def generate_slug(text: str) -> str:
    """Generate URL-friendly slug from text"""
    import re
    import unicodedata
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove accents
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    
    # Replace spaces and special characters with hyphens
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    
    # Remove leading/trailing hyphens
    text = text.strip('-')
    
    return text

def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate text to specified length"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix

def extract_metadata_from_url(url: str) -> Dict[str, Any]:
    """Extract metadata from URL (mock implementation)"""
    # TODO: Implement actual URL metadata extraction
    return {
        "title": "Sample Article Title",
        "description": "Sample article description",
        "author": "Unknown Author",
        "published_date": "2025-01-20T10:00:00Z",
        "image_url": None,
        "word_count": 0
    }

def calculate_reading_time(word_count: int, words_per_minute: int = 200) -> int:
    """Calculate reading time in minutes"""
    return max(1, word_count // words_per_minute)

def get_pagination_info(page: int, per_page: int, total: int) -> Dict[str, Any]:
    """Get pagination information"""
    total_pages = (total + per_page - 1) // per_page
    has_next = page < total_pages
    has_prev = page > 1
    
    return {
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages,
        "has_next": has_next,
        "has_prev": has_prev
    }
