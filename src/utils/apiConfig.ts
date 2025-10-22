// API Configuration và timeout settings
export const API_CONFIG = {
  // Timeout settings
  TIMEOUTS: {
    DEFAULT: 30000,        // 30 giây
    SCRAPING: 120000,      // 2 phút cho scraping
    AI_GENERATION: 180000, // 3 phút cho AI generation
    UPLOAD: 300000,        // 5 phút cho upload
  },
  
  // Retry settings
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_BETWEEN_ATTEMPTS: 2000, // 2 giây
    BACKOFF_MULTIPLIER: 2,
  },
  
  // API Endpoints
  ENDPOINTS: {
    BASE_URL: process.env.REACT_APP_API_URL || 'https://docnhanh.marketingservice.io:8502',
    SCRAPING: '/api/v1/scraping',
    NEWS: '/api/v1/news',
    SOCIAL: '/api/v1/social',
    AI: '/api/v1/ai',
    CONFIG: '/api/v1/config',
  },
  
  // VnExpress specific settings
  VNEXPRESS: {
    TIMEOUT: 120000,       // 2 phút
    MAX_RETRIES: 3,
    DELAY_BETWEEN_REQUESTS: 1000, // 1 giây giữa các request
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    HEADERS: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
  }
};

// Utility functions for API calls
export class ApiClient {
  private static async makeRequest(
    url: string, 
    options: RequestInit = {}, 
    timeout: number = API_CONFIG.TIMEOUTS.DEFAULT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...API_CONFIG.VNEXPRESS.HEADERS,
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Retry mechanism
  static async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxAttempts: number = API_CONFIG.RETRY.MAX_ATTEMPTS,
    delay: number = API_CONFIG.RETRY.DELAY_BETWEEN_ATTEMPTS
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        // Exponential backoff
        const backoffDelay = delay * Math.pow(API_CONFIG.RETRY.BACKOFF_MULTIPLIER, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
    
    throw lastError!;
  }

  // VnExpress scraping with enhanced timeout handling
  static async scrapeVnExpress(url: string): Promise<any> {
    return this.retryRequest(async () => {
      const response = await this.makeRequest(
        `${API_CONFIG.ENDPOINTS.BASE_URL}${API_CONFIG.ENDPOINTS.SCRAPING}/vnexpress`,
        {
          method: 'POST',
          body: JSON.stringify({ url }),
        },
        API_CONFIG.VNEXPRESS.TIMEOUT
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    });
  }

  // News scanning with timeout handling
  static async startNewsScan(sources: string[]): Promise<any> {
    return this.retryRequest(async () => {
      const response = await this.makeRequest(
        `${API_CONFIG.ENDPOINTS.BASE_URL}${API_CONFIG.ENDPOINTS.NEWS}/scan`,
        {
          method: 'POST',
          body: JSON.stringify({ 
            sources,
            timeout: API_CONFIG.VNEXPRESS.TIMEOUT,
            retry_count: API_CONFIG.VNEXPRESS.MAX_RETRIES 
          }),
        },
        API_CONFIG.TIMEOUTS.SCRAPING
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    });
  }

  // Check API health
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await this.makeRequest(
        `${API_CONFIG.ENDPOINTS.BASE_URL}/health`,
        { method: 'GET' },
        5000 // 5 giây timeout cho health check
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (error.name === 'AbortError') {
    return 'Kết nối bị timeout. Vui lòng thử lại.';
  }
  
  if (error.message?.includes('timeout')) {
    return 'Kết nối quá chậm. Vui lòng kiểm tra mạng và thử lại.';
  }
  
  if (error.message?.includes('NetworkError')) {
    return 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.';
  }
  
  if (error.message?.includes('HTTP 429')) {
    return 'Quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.';
  }
  
  if (error.message?.includes('HTTP 403')) {
    return 'Không có quyền truy cập. Vui lòng liên hệ admin.';
  }
  
  return error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
};
