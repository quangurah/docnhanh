#!/usr/bin/env python3
"""
Test API endpoints
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health")
        print(f"✅ Health check: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_login():
    """Test login endpoint"""
    try:
        data = {
            "username": "admin",
            "password": "admin123"
        }
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=data)
        print(f"✅ Login: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            return result.get("access_token")
        return None
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return None

def test_protected_endpoint(token):
    """Test protected endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
        print(f"✅ Protected endpoint: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Protected endpoint failed: {e}")
        return False

def test_users_endpoint(token):
    """Test users endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/users", headers=headers)
        print(f"✅ Users endpoint: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Users endpoint failed: {e}")
        return False

def test_departments_endpoint(token):
    """Test departments endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/departments", headers=headers)
        print(f"✅ Departments endpoint: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Departments endpoint failed: {e}")
        return False

def test_tasks_endpoint(token):
    """Test tasks endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/tasks", headers=headers)
        print(f"✅ Tasks endpoint: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Tasks endpoint failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing DocNhanh API...")
    print("=" * 50)
    
    # Test health
    if not test_health():
        print("❌ Server is not running. Please start the server first.")
        sys.exit(1)
    
    # Test login
    token = test_login()
    if not token:
        print("❌ Login failed. Please check credentials.")
        sys.exit(1)
    
    # Test protected endpoints
    tests = [
        ("Protected endpoint", lambda: test_protected_endpoint(token)),
        ("Users endpoint", lambda: test_users_endpoint(token)),
        ("Departments endpoint", lambda: test_departments_endpoint(token)),
        ("Tasks endpoint", lambda: test_tasks_endpoint(token))
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed")
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("❌ Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
