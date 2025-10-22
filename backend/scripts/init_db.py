#!/usr/bin/env python3
"""
Initialize database with sample data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app.models import Base, User, Department
from app.auth import get_password_hash
from datetime import datetime
import uuid

def create_sample_data():
    """Create sample data for development"""
    db = SessionLocal()
    
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Create departments
        departments_data = [
            {
                "name": "Ban Biên tập",
                "description": "Ban lãnh đạo toà soạn",
                "icon": "👔"
            },
            {
                "name": "Phòng Công nghiệp",
                "description": "Phụ trách tin tức công nghiệp",
                "icon": "🏭"
            },
            {
                "name": "Phòng Thương mại",
                "description": "Phụ trách tin tức thương mại",
                "icon": "💼"
            },
            {
                "name": "Phòng Nông nghiệp",
                "description": "Phụ trách tin tức nông nghiệp",
                "icon": "🌾"
            },
            {
                "name": "Phòng Công nghệ",
                "description": "Phụ trách tin tức công nghệ",
                "icon": "💻"
            }
        ]
        
        departments = []
        for dept_data in departments_data:
            dept = Department(**dept_data)
            db.add(dept)
            departments.append(dept)
        
        db.commit()
        
        # Create users
        users_data = [
            {
                "username": "admin",
                "email": "admin@congthuong.vn",
                "full_name": "Administrator",
                "password_hash": get_password_hash("admin123"),
                "role": "admin",
                "position": "System Administrator",
                "status": "active"
            },
            {
                "username": "editor_chief",
                "email": "editor@congthuong.vn",
                "full_name": "Tổng Biên tập",
                "password_hash": get_password_hash("editor123"),
                "role": "editor_in_chief",
                "position": "Tổng Biên tập",
                "department_id": departments[0].id,
                "status": "active"
            },
            {
                "username": "dept_head_1",
                "email": "dept1@congthuong.vn",
                "full_name": "Trưởng phòng Công nghiệp",
                "password_hash": get_password_hash("dept123"),
                "role": "department_head",
                "position": "Trưởng phòng",
                "department_id": departments[1].id,
                "status": "active"
            },
            {
                "username": "reporter_1",
                "email": "reporter1@congthuong.vn",
                "full_name": "Phóng viên 1",
                "password_hash": get_password_hash("reporter123"),
                "role": "reporter",
                "position": "Phóng viên",
                "department_id": departments[1].id,
                "status": "active"
            },
            {
                "username": "secretary_1",
                "email": "secretary1@congthuong.vn",
                "full_name": "Thư ký 1",
                "password_hash": get_password_hash("secretary123"),
                "role": "secretary",
                "position": "Thư ký",
                "department_id": departments[0].id,
                "status": "active"
            }
        ]
        
        for user_data in users_data:
            user = User(**user_data)
            db.add(user)
        
        db.commit()
        
        # Set department leaders
        departments[0].leader_id = db.query(User).filter(User.username == "editor_chief").first().user_id
        departments[1].leader_id = db.query(User).filter(User.username == "dept_head_1").first().user_id
        
        db.commit()
        
        print("✅ Database initialized successfully!")
        print("📊 Created:")
        print(f"   - {len(departments)} departments")
        print(f"   - {len(users_data)} users")
        print("\n🔑 Test accounts:")
        print("   - admin / admin123 (Admin)")
        print("   - editor_chief / editor123 (Tổng Biên tập)")
        print("   - dept_head_1 / dept123 (Trưởng phòng)")
        print("   - reporter_1 / reporter123 (Phóng viên)")
        print("   - secretary_1 / secretary123 (Thư ký)")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
