#!/bin/bash

# DocNhanh Backend Startup Script

echo "🚀 Starting DocNhanh Backend API..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration!"
fi

# Check database connection
echo "🗄️ Checking database connection..."
python -c "
import os
import sys
sys.path.append('.')
from app.database import engine
try:
    engine.connect()
    print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    sys.exit(1)
"

# Run database migrations
echo "🔄 Running database migrations..."
alembic upgrade head

# Initialize sample data (optional)
if [ "$1" = "--init-data" ]; then
    echo "📊 Initializing sample data..."
    python scripts/init_db.py
fi

# Start the server
echo "🌐 Starting server..."
echo "📍 API Documentation: http://localhost:8000/docs"
echo "📍 Health Check: http://localhost:8000/api/v1/health"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
