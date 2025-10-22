# DocNhanh Configuration API Endpoints

## **⚙️ CONFIGURATION APIs**

### **GET /api/v1/config**
```json
// Admin only
// Response (200)
{
  "success": true,
  "data": {
    "api_keys": {
      "apify_token": "apify_api_*****************************abc123",
      "openai_token": "sk-*****************************def456", 
      "gemini_token": "AI*****************************ghi789"
    },
    "ai_prompts": {
      "seo_article": "Bạn là một chuyên gia SEO và content marketing...",
      "opinion_article": "Bạn là một nhà báo có kinh nghiệm...",
      "news_article": "Bạn là một phóng viên chuyên nghiệp..."
    },
    "sources": {
      "websites": "https://vnexpress.net\nhttps://dantri.com.vn\nhttps://tuoitre.vn",
      "social": "https://facebook.com/vnexpress\nhttps://facebook.com/dantridotcomvn",
      "keywords": "AI, công nghệ, startup, đầu tư, blockchain, fintech"
    },
    "system_settings": {
      "auto_scan_interval": 3600,
      "max_articles_per_job": 100,
      "content_retention_days": 365
    }
  }
}
```

### **PUT /api/v1/config/api-keys**
```json
// Request - Admin only
{
  "apify_token": "apify_api_12345678901234567890123456789012",
  "openai_token": "sk-12345678901234567890123456789012345",
  "gemini_token": "AI12345678901234567890123456789012345"
}

// Response (200)
{
  "success": true,
  "data": {
    "updated_at": "2025-10-08T21:30:00.000Z",
    "updated_fields": ["apify_token", "openai_token", "gemini_token"]
  }
}
```

### **PUT /api/v1/config/ai-prompts**
```json
// Request - Admin only
{
  "seo_article": "Updated SEO prompt...",
  "opinion_article": "Updated opinion prompt...",
  "news_article": "Updated news prompt..."
}

// Response (200)
{
  "success": true,
  "data": {
    "updated_at": "2025-10-08T21:35:00.000Z",
    "updated_fields": ["seo_article", "opinion_article", "news_article"]
  }
}
```

### **PUT /api/v1/config/sources**
```json
// Request - Admin only
{
  "websites": "https://vnexpress.net\nhttps://dantri.com.vn\nhttps://tuoitre.vn\nhttps://thanhnien.vn",
  "social": "https://facebook.com/vnexpress\nhttps://facebook.com/dantridotcomvn\nhttps://facebook.com/tuoitreofficial",
  "keywords": "AI, công nghệ, startup, đầu tư, blockchain, fintech, machine learning"
}

// Response (200)
{
  "success": true,
  "data": {
    "updated_at": "2025-10-08T21:40:00.000Z",
    "updated_fields": ["websites", "social", "keywords"]
  }
}
```

---

## **📊 API USAGE & BILLING APIs**

### **GET /api/v1/usage/overview**
```json
// Admin only
// Query params: ?period=current_month (current_month, last_month, last_7_days, last_30_days)

// Response (200)
{
  "success": true,
  "data": {
    "period": "current_month",
    "period_start": "2025-10-01T00:00:00.000Z",
    "period_end": "2025-10-31T23:59:59.999Z",
    "services": [
      {
        "service": "OpenAI GPT-4",
        "service_id": "openai_gpt4",
        "current_usage": 75000,
        "monthly_limit": 100000,
        "cost_current": 37.50,
        "cost_limit": 50.00,
        "last_used": "2025-10-08T20:30:00.000Z",
        "status": "active",
        "usage_percentage": 75.0,
        "cost_percentage": 75.0,
        "trend": {
          "usage_change": "+12.5%",
          "cost_change": "+8.3%"
        }
      },
      {
        "service": "Google Gemini Pro",
        "service_id": "gemini_pro",
        "current_usage": 45000,
        "monthly_limit": 80000,
        "cost_current": 22.50,
        "cost_limit": 40.00,
        "last_used": "2025-10-08T19:45:00.000Z",
        "status": "active",
        "usage_percentage": 56.25,
        "cost_percentage": 56.25,
        "trend": {
          "usage_change": "+5.2%",
          "cost_change": "+3.1%"
        }
      },
      {
        "service": "Apify Facebook Scraper",
        "service_id": "apify_facebook",
        "current_usage": 2800,
        "monthly_limit": 3000,
        "cost_current": 28.00,
        "cost_limit": 30.00,
        "last_used": "2025-10-08T18:15:00.000Z",
        "status": "warning",
        "usage_percentage": 93.33,
        "cost_percentage": 93.33,
        "trend": {
          "usage_change": "+45.2%",
          "cost_change": "+45.2%"
        }
      }
    ],
    "totals": {
      "total_cost_current": 87.50,
      "total_cost_limit": 120.00,
      "total_operations": 1247,
      "successful_operations": 1198,
      "failed_operations": 49,
      "success_rate": 96.07
    }
  }
}
```

### **GET /api/v1/usage/logs**
```json
// Admin only
// Query params: ?page=0&limit=50&service=all&date_from=&date_to=&operation_type=all&status=all

// Response (200)
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_001",
        "timestamp": "2025-10-08T20:30:15.123Z",
        "service": "OpenAI GPT-4",
        "service_id": "openai_gpt4",
        "operation": "Article Generation (SEO)",
        "operation_id": "gen_001",
        "user_id": "user_lehien",
        "username": "lehien",
        "tokens_used": 3500,
        "cost": 0.175,
        "success": true,
        "error_message": null,
        "metadata": {
          "model": "gpt-4",
          "input_tokens": 1200,
          "output_tokens": 2300,
          "temperature": 0.7,
          "max_tokens": 4000,
          "article_type": "seo",
          "response_time_ms": 4250
        }
      },
      {
        "id": "log_002",
        "timestamp": "2025-10-08T20:28:45.456Z",
        "service": "Google Gemini Pro",
        "service_id": "gemini_pro",
        "operation": "Content Enhancement",
        "operation_id": "enhance_001",
        "user_id": "user_lehien",
        "username": "lehien",
        "tokens_used": 2200,
        "cost": 0.055,
        "success": true,
        "error_message": null,
        "metadata": {
          "model": "gemini-pro",
          "input_tokens": 800,
          "output_tokens": 1400,
          "enhancement_type": "seo_optimize",
          "response_time_ms": 2150
        }
      },
      {
        "id": "log_003",
        "timestamp": "2025-10-08T19:45:30.789Z",
        "service": "Apify Facebook Scraper",
        "service_id": "apify_facebook",
        "operation": "Social Media Scan",
        "operation_id": "scan_001",
        "user_id": "user_phantd",
        "username": "phantd",
        "tokens_used": 150,
        "cost": 1.50,
        "success": true,
        "error_message": null,
        "metadata": {
          "actor_id": "apify/facebook-posts-scraper",
          "pages_scraped": 15,
          "posts_found": 47,
          "run_duration_seconds": 125,
          "data_size_mb": 2.3
        }
      },
      {
        "id": "log_004",
        "timestamp": "2025-10-08T19:30:22.012Z",
        "service": "OpenAI GPT-4",
        "service_id": "openai_gpt4",
        "operation": "Article Generation (Opinion)",
        "operation_id": "gen_002",
        "user_id": "user_lehien",
        "username": "lehien",
        "tokens_used": 4200,
        "cost": 0.210,
        "success": false,
        "error_message": "Rate limit exceeded. Please try again later.",
        "metadata": {
          "model": "gpt-4",
          "input_tokens": 1500,
          "output_tokens": 0,
          "article_type": "opinion",
          "response_time_ms": 1000,
          "error_code": "rate_limit_exceeded"
        }
      }
    ],
    "pagination": {
      "current_page": 0,
      "total_pages": 25,
      "total_items": 1247,
      "items_per_page": 50
    },
    "summary": {
      "total_operations": 1247,
      "successful_operations": 1198,
      "failed_operations": 49,
      "total_cost": 87.50,
      "total_tokens": 2847500
    }
  }
}
```

### **GET /api/v1/usage/analytics**
```json
// Admin only
// Query params: ?period=last_30_days&group_by=day

// Response (200)
{
  "success": true,
  "data": {
    "period": "last_30_days",
    "group_by": "day",
    "chart_data": [
      {
        "date": "2025-09-09",
        "openai_cost": 2.45,
        "gemini_cost": 1.20,
        "apify_cost": 3.50,
        "total_cost": 7.15,
        "operations": 45
      },
      {
        "date": "2025-09-10",
        "openai_cost": 3.20,
        "gemini_cost": 1.85,
        "apify_cost": 2.10,
        "total_cost": 7.15,
        "operations": 52
      }
    ],
    "trends": {
      "cost_trend": "+15.3%",
      "usage_trend": "+8.7%",
      "efficiency_trend": "+12.1%"
    },
    "top_operations": [
      {
        "operation": "Article Generation (SEO)",
        "count": 245,
        "total_cost": 12.25,
        "avg_cost": 0.05
      },
      {
        "operation": "Content Enhancement",
        "count": 189,
        "total_cost": 9.45,
        "avg_cost": 0.05
      }
    ],
    "top_users": [
      {
        "username": "lehien",
        "operations": 156,
        "total_cost": 7.80,
        "success_rate": 97.4
      },
      {
        "username": "phantd",
        "operations": 123,
        "total_cost": 6.15,
        "success_rate": 95.1
      }
    ]
  }
}
```

### **POST /api/v1/usage/export**
```json
// Request - Admin only
{
  "format": "csv", // "csv", "json", "excel"
  "period": "current_month",
  "services": ["openai_gpt4", "gemini_pro", "apify_facebook"], // optional filter
  "include_metadata": true,
  "date_from": "2025-10-01T00:00:00.000Z", // optional override
  "date_to": "2025-10-08T23:59:59.999Z" // optional override
}

// Response (200)
{
  "success": true,
  "data": {
    "export_id": "export_usage_001",
    "download_url": "https://docnhanh.marketingservice.io:8502/api/v1/exports/export_usage_001",
    "expires_at": "2025-10-09T21:00:00.000Z",
    "total_records": 1247,
    "file_size_mb": 2.3,
    "format": "csv"
  }
}
```

### **GET /api/v1/usage/alerts**
```json
// Admin only
// Response (200)
{
  "success": true,
  "data": {
    "active_alerts": [
      {
        "id": "alert_001",
        "type": "usage_warning",
        "service": "Apify Facebook Scraper",
        "threshold": 90,
        "current_value": 93.33,
        "message": "Apify Facebook Scraper đã sử dụng 93.33% quota tháng này",
        "severity": "warning",
        "created_at": "2025-10-08T18:20:00.000Z"
      },
      {
        "id": "alert_002",
        "type": "cost_warning",
        "service": "OpenAI GPT-4",
        "threshold": 80,
        "current_value": 75.0,
        "message": "Chi phí OpenAI GPT-4 đã đạt 75% budget tháng này",
        "severity": "info",
        "created_at": "2025-10-08T16:45:00.000Z"
      }
    ],
    "alert_settings": {
      "usage_warning_threshold": 90,
      "usage_critical_threshold": 95,
      "cost_warning_threshold": 80,
      "cost_critical_threshold": 95,
      "email_notifications": true,
      "slack_notifications": false
    }
  }
}
```

### **PUT /api/v1/usage/limits**
```json
// Request - Admin only
{
  "service_limits": {
    "openai_gpt4": {
      "monthly_token_limit": 120000,
      "monthly_cost_limit": 60.00
    },
    "gemini_pro": {
      "monthly_token_limit": 100000,
      "monthly_cost_limit": 50.00
    },
    "apify_facebook": {
      "monthly_operation_limit": 3500,
      "monthly_cost_limit": 35.00
    }
  },
  "alert_thresholds": {
    "usage_warning": 85,
    "usage_critical": 95,
    "cost_warning": 80,
    "cost_critical": 90
  }
}

// Response (200)
{
  "success": true,
  "data": {
    "updated_at": "2025-10-08T21:45:00.000Z",
    "updated_services": ["openai_gpt4", "gemini_pro", "apify_facebook"]
  }
}
```

---

## **🔧 SERVICE HEALTH APIs**

### **GET /api/v1/services/health**
```json
// Admin only
// Response (200)
{
  "success": true,
  "data": {
    "services": [
      {
        "service": "OpenAI GPT-4",
        "service_id": "openai_gpt4",
        "status": "healthy",
        "last_check": "2025-10-08T20:30:00.000Z",
        "response_time_ms": 850,
        "uptime_24h": 99.8,
        "error_rate_24h": 0.2,
        "api_key_status": "valid"
      },
      {
        "service": "Google Gemini Pro",
        "service_id": "gemini_pro",
        "status": "healthy",
        "last_check": "2025-10-08T20:30:00.000Z",
        "response_time_ms": 650,
        "uptime_24h": 99.9,
        "error_rate_24h": 0.1,
        "api_key_status": "valid"
      },
      {
        "service": "Apify Facebook Scraper",
        "service_id": "apify_facebook",
        "status": "degraded",
        "last_check": "2025-10-08T20:30:00.000Z",
        "response_time_ms": 2150,
        "uptime_24h": 97.5,
        "error_rate_24h": 2.5,
        "api_key_status": "valid"
      }
    ],
    "overall_status": "healthy"
  }
}
```

### **POST /api/v1/services/test**
```json
// Request - Admin only
{
  "service": "openai_gpt4", // "openai_gpt4", "gemini_pro", "apify_facebook", "all"
  "test_type": "connection" // "connection", "full_test"
}

// Response (200)
{
  "success": true,
  "data": {
    "service": "openai_gpt4",
    "test_result": "success",
    "response_time_ms": 750,
    "details": {
      "api_key_valid": true,
      "model_accessible": true,
      "quota_available": true,
      "sample_request_successful": true
    },
    "tested_at": "2025-10-08T20:35:00.000Z"
  }
}

// Response Error (400)
{
  "success": false,
  "error": {
    "code": "SERVICE_TEST_FAILED",
    "message": "API key không hợp lệ hoặc đã hết hạn",
    "details": {
      "service": "openai_gpt4",
      "api_key_valid": false,
      "error_message": "Invalid API key provided"
    }
  }
}
```

---

## **📈 COST OPTIMIZATION APIs**

### **GET /api/v1/cost/recommendations**
```json
// Admin only
// Response (200)
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "type": "model_optimization",
        "priority": "high",
        "title": "Sử dụng GPT-3.5 cho content enhancement",
        "description": "40% operations có thể sử dụng GPT-3.5 thay vì GPT-4, tiết kiệm ~$15/tháng",
        "potential_savings": 15.50,
        "implementation_difficulty": "easy"
      },
      {
        "type": "usage_pattern",
        "priority": "medium", 
        "title": "Tối ưu batch processing",
        "description": "Gộp các requests nhỏ có thể giảm 20% chi phí Apify",
        "potential_savings": 6.20,
        "implementation_difficulty": "medium"
      }
    ],
    "total_potential_savings": 21.70,
    "current_efficiency_score": 78
  }
}
```

Đây là bộ API endpoints mở rộng cho việc quản lý configuration, API usage tracking và billing cho hệ thống DocNhanh. Tất cả đều có authentication và chỉ Admin mới có quyền truy cập.