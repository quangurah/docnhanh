# DNS Configuration for DocNhanh

## 🌐 Cần cấu hình DNS cho subdomain

### **Current Setup:**
- **Main Domain**: marketingservice.io (WordPress)
- **App Subdomain**: app.marketingservice.io (DocNhanh Frontend)
- **Server IP**: 47.129.210.7

### **DNS Records cần thêm:**

```
Type: A
Name: app
Value: 47.129.210.7
TTL: 300

Type: CNAME  
Name: www.app
Value: app.marketingservice.io
TTL: 300
```

### **SSL Certificate:**
- Sẽ được tự động cấu hình bởi Certbot
- Domain: app.marketingservice.io
- Provider: Let's Encrypt (miễn phí)

### **URLs sau khi setup:**
- **WordPress Admin**: https://marketingservice.io/wp-admin/
- **DocNhanh App**: https://app.marketingservice.io
- **Health Check**: https://app.marketingservice.io/health
