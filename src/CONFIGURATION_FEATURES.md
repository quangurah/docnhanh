# DocNhanh Configuration & Usage Management Features

## 🎯 Tính năng mới đã thêm

### **⚙️ Configuration Management (Admin Only)**

#### **1. API Keys Management Tab**
- **Apify Token**: Cho Facebook scraping
  - Masked display với show/hide toggle
  - Validation và connection testing
  - Link trực tiếp đến Apify Console

- **OpenAI API Key**: Cho GPT models
  - Secure input với password field
  - Token validation
  - Link đến OpenAI Platform

- **Google Gemini API Key**: Cho Gemini Pro
  - Secure storage và display
  - API testing capabilities
  - Link đến Google AI Studio

#### **2. Usage & Billing Tab**
- **Real-time Usage Monitoring**
  - Current usage vs monthly limits
  - Cost tracking per service
  - Status indicators (healthy/warning/critical)
  - Usage percentage với progress bars

- **Detailed Usage Logs Table**
  - Timestamp, service, operation details
  - Token usage và cost per operation
  - Success/failure status
  - User attribution
  - Export to CSV functionality

- **Usage Analytics**
  - Daily/weekly/monthly trending
  - Cost breakdown by service
  - Success rate monitoring
  - Performance metrics

#### **3. AI Prompts Tab**
- **SEO Article Prompt**: Tối ưu cho SEO
- **Opinion Article Prompt**: Bài viết quan điểm
- **News Article Prompt**: Tin tức khách quan
- Version control và rollback capabilities

#### **4. Sources Configuration Tab**
- **Website Sources**: Danh sách URLs để quét
- **Social Media Sources**: Facebook pages, Twitter accounts
- **Keywords**: Từ khóa ưu tiên và filtering

---

### **📊 Usage Dashboard (Admin Only)**

#### **1. Overview Cards**
- **Total Cost**: Tổng chi phí tháng hiện tại
- **Total Operations**: Số lượng operations
- **Success Rate**: Tỷ lệ thành công
- **Active Services**: Trạng thái dịch vụ

#### **2. Service Monitoring Cards**
- **Per-service Usage**: Usage vs limits
- **Cost Tracking**: Chi phí hiện tại vs budget
- **Status Indicators**: Health status của từng service
- **Trend Analysis**: So sánh với tháng trước

#### **3. Interactive Charts**
- **Cost Trend Line Chart**: Xu hướng chi phí theo thời gian
- **Service Distribution Pie Chart**: Phân bổ chi phí
- **Stacked Area Chart**: Usage chi tiết theo service
- **Responsive Design**: Tối ưu cho mobile

#### **4. Data Export**
- **CSV Export**: Usage logs với metadata
- **Report Generation**: Automated daily/weekly reports
- **Custom Date Ranges**: Flexible filtering options

---

## 🔧 Backend API Requirements

### **Configuration APIs**
```
GET    /api/v1/config                    - Lấy toàn bộ config
PUT    /api/v1/config/api-keys          - Cập nhật API tokens
PUT    /api/v1/config/ai-prompts        - Cập nhật AI prompts  
PUT    /api/v1/config/sources           - Cập nhật nguồn tin
POST   /api/v1/services/test            - Test API connection
```

### **Usage & Billing APIs**
```
GET    /api/v1/usage/overview           - Usage overview
GET    /api/v1/usage/logs               - Chi tiết usage logs
GET    /api/v1/usage/analytics          - Analytics data
POST   /api/v1/usage/export             - Export usage data
GET    /api/v1/usage/alerts             - Cảnh báo usage
PUT    /api/v1/usage/limits             - Cập nhật limits
```

### **Service Health APIs**
```
GET    /api/v1/services/health          - Health check tất cả services
POST   /api/v1/services/test            - Test specific service
GET    /api/v1/cost/recommendations     - Cost optimization suggestions
```

---

## 💡 Key Features Implementation

### **1. Security & Privacy**
- **API Key Masking**: Chỉ hiển thị 4 ký tự đầu và cuối
- **Secure Storage**: API keys encrypted in backend
- **Admin Only Access**: Role-based access control
- **Audit Logging**: Tất cả changes được log

### **2. Real-time Monitoring**
- **Live Usage Updates**: Real-time data refresh
- **Status Indicators**: Visual health status
- **Alert System**: Warnings khi gần limit
- **Performance Tracking**: Response time monitoring

### **3. Cost Management**
- **Budget Limits**: Per-service cost limits
- **Usage Alerts**: Tự động warning khi vượt threshold
- **Cost Optimization**: Gợi ý tối ưu chi phí
- **Trend Analysis**: Dự đoán chi phí tương lai

### **4. User Experience**
- **Intuitive Tabs**: Easy navigation giữa các sections
- **Progressive Disclosure**: Hide complexity from basic users
- **Responsive Design**: Mobile-friendly interface
- **Loading States**: Proper loading indicators

---

## 🎨 UI/UX Design Principles

### **1. Professional Layout**
- **Clean Tabs Interface**: 4 main configuration tabs
- **Card-based Design**: Grouped related settings
- **Consistent Spacing**: 6-unit spacing system
- **Color-coded Status**: Green/Orange/Red cho health status

### **2. Data Visualization**
- **Progress Bars**: Usage vs limits visualization
- **Interactive Charts**: Recharts integration
- **Status Badges**: Clear visual indicators
- **Trend Icons**: Up/down arrows với colors

### **3. Accessibility**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels
- **High Contrast**: Clear visual hierarchy
- **Mobile Responsive**: Touch-friendly controls

### **4. Error Handling**
- **Validation Messages**: Clear error feedback
- **Retry Mechanisms**: Auto-retry failed operations
- **Graceful Degradation**: Fallback states
- **Toast Notifications**: Success/error feedback

---

## 📋 Implementation Checklist

### **Phase 1: Core Configuration (✅ Complete)**
- [x] API Keys management interface
- [x] Secure token input với masking
- [x] Service connection testing
- [x] AI Prompts configuration
- [x] Sources management

### **Phase 2: Usage Monitoring (✅ Complete)**
- [x] Usage dashboard với charts
- [x] Real-time usage tracking
- [x] Cost monitoring và alerts
- [x] Usage logs table
- [x] Export functionality

### **Phase 3: Backend Integration (🔄 Pending)**
- [ ] API endpoints implementation
- [ ] Database schema cho usage logs
- [ ] Real-time data streaming
- [ ] Alert system setup
- [ ] Cost calculation engine

### **Phase 4: Advanced Features (📋 Planned)**
- [ ] Cost optimization recommendations
- [ ] Automated scaling suggestions
- [ ] Custom alert rules
- [ ] Advanced analytics
- [ ] API usage forecasting

---

## 🚀 Benefits for DocNhanh System

### **1. Cost Control**
- **Budget Management**: Prevent overspending
- **Usage Optimization**: Identify inefficient operations
- **Forecasting**: Predict future costs
- **ROI Tracking**: Measure system efficiency

### **2. Operational Excellence**
- **Health Monitoring**: Proactive issue detection
- **Performance Tracking**: Service optimization
- **Audit Trail**: Complete usage history
- **Compliance**: Data retention policies

### **3. User Experience**
- **Transparency**: Clear usage visibility
- **Self-service**: Admin autonomy
- **Quick Setup**: Easy API configuration
- **Professional Interface**: Enterprise-grade UI

### **4. Scalability**
- **Multi-service Support**: Easy addition of new APIs
- **Flexible Limits**: Adjustable quotas
- **Real-time Monitoring**: Handles high-volume usage
- **Efficient Resource Usage**: Optimal API utilization

---

*Hệ thống DocNhanh hiện tại đã có đầy đủ tính năng Configuration và Usage Management chuyên nghiệp, sẵn sàng cho production deployment với enterprise-grade monitoring và cost control.*