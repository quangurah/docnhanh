// VnExpress Scraper với timeout handling nâng cao
import { API_CONFIG } from './apiConfig';

export interface VnExpressArticle {
  id: string;
  title: string;
  url: string;
  content: string;
  publishedAt: string;
  category: string;
  tags: string[];
  author: string;
  imageUrl?: string;
}

export interface ScrapingResult {
  success: boolean;
  articles: VnExpressArticle[];
  totalFound: number;
  errors: string[];
  duration: number;
  sources: string[];
}

export class VnExpressScraper {
  private static readonly VNEXPRESS_BASE_URL = 'https://vnexpress.net';
  private static readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  // Enhanced timeout settings for VnExpress
  private static readonly TIMEOUTS = {
    CONNECTION: 15000,    // 15 giây cho kết nối
    READ: 60000,          // 60 giây cho đọc dữ liệu
    TOTAL: 120000,        // 2 phút tổng cộng
    RETRY_DELAY: 3000,    // 3 giây giữa các lần thử
  };

  // Headers để tránh bị chặn
  private static readonly HEADERS = {
    'User-Agent': this.USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  /**
   * Scrape VnExpress với timeout handling nâng cao
   */
  static async scrapeVnExpress(options: {
    categories?: string[];
    maxArticles?: number;
    keywords?: string[];
    timeout?: number;
  } = {}): Promise<ScrapingResult> {
    const startTime = Date.now();
    const {
      categories = ['kinh-doanh', 'the-gioi', 'the-thao', 'giai-tri'],
      maxArticles = 50,
      keywords = [],
      timeout = this.TIMEOUTS.TOTAL
    } = options;

    const result: ScrapingResult = {
      success: false,
      articles: [],
      totalFound: 0,
      errors: [],
      duration: 0,
      sources: []
    };

    try {
      console.log('🚀 Bắt đầu quét VnExpress...');
      
      // Kiểm tra kết nối trước
      await this.checkConnection();
      
      // Quét từng category
      for (const category of categories) {
        try {
          console.log(`📰 Đang quét category: ${category}`);
          const categoryArticles = await this.scrapeCategory(category, maxArticles);
          result.articles.push(...categoryArticles);
          result.sources.push(`${this.VNEXPRESS_BASE_URL}/${category}`);
        } catch (error) {
          const errorMsg = `Lỗi quét category ${category}: ${error}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Lọc theo keywords nếu có
      if (keywords.length > 0) {
        result.articles = this.filterByKeywords(result.articles, keywords);
      }

      // Giới hạn số lượng
      result.articles = result.articles.slice(0, maxArticles);
      result.totalFound = result.articles.length;
      result.success = result.articles.length > 0;
      
      result.duration = Date.now() - startTime;
      
      console.log(`✅ Hoàn thành quét VnExpress: ${result.totalFound} bài viết trong ${result.duration}ms`);
      
    } catch (error) {
      const errorMsg = `Lỗi tổng quét VnExpress: ${error}`;
      console.error(errorMsg);
      result.errors.push(errorMsg);
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Kiểm tra kết nối đến VnExpress
   */
  private static async checkConnection(): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUTS.CONNECTION);

    try {
      const response = await fetch(this.VNEXPRESS_BASE_URL, {
        method: 'HEAD',
        headers: this.HEADERS,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Kết nối VnExpress thành công');
    } catch (error) {
      clearTimeout(timeoutId);
      throw new Error(`Không thể kết nối VnExpress: ${error}`);
    }
  }

  /**
   * Quét một category cụ thể
   */
  private static async scrapeCategory(category: string, maxArticles: number): Promise<VnExpressArticle[]> {
    const url = `${this.VNEXPRESS_BASE_URL}/${category}`;
    const articles: VnExpressArticle[] = [];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUTS.READ);

    try {
      console.log(`🔍 Đang tải: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.HEADERS,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const articleLinks = this.extractArticleLinks(html, category);
      
      console.log(`📄 Tìm thấy ${articleLinks.length} bài viết trong ${category}`);

      // Quét chi tiết từng bài viết (song song với giới hạn)
      const batchSize = 5;
      for (let i = 0; i < Math.min(articleLinks.length, maxArticles); i += batchSize) {
        const batch = articleLinks.slice(i, i + batchSize);
        const batchPromises = batch.map(link => this.scrapeArticle(link));
        
        try {
          const batchArticles = await Promise.allSettled(batchPromises);
          batchArticles.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
              articles.push(result.value);
            }
          });
        } catch (error) {
          console.warn(`Lỗi batch ${i}-${i + batchSize}:`, error);
        }

        // Delay giữa các batch để tránh bị chặn
        if (i + batchSize < Math.min(articleLinks.length, maxArticles)) {
          await this.delay(1000);
        }
      }

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }

    return articles;
  }

  /**
   * Trích xuất links bài viết từ HTML
   */
  private static extractArticleLinks(html: string, category: string): string[] {
    const links: string[] = [];
    
    // Regex patterns cho VnExpress
    const patterns = [
      /href="([^"]*\/[^"]*\.html)"/g,
      /href="([^"]*\/[^"]*\/[^"]*\.html)"/g,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let link = match[1];
        
        // Chuẩn hóa URL
        if (link.startsWith('/')) {
          link = this.VNEXPRESS_BASE_URL + link;
        } else if (!link.startsWith('http')) {
          link = this.VNEXPRESS_BASE_URL + '/' + link;
        }

        // Lọc chỉ lấy links của VnExpress
        if (link.includes('vnexpress.net') && link.includes('.html')) {
          links.push(link);
        }
      }
    });

    // Loại bỏ duplicates
    return [...new Set(links)];
  }

  /**
   * Quét chi tiết một bài viết
   */
  private static async scrapeArticle(url: string): Promise<VnExpressArticle | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUTS.READ);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.HEADERS,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      return this.parseArticle(html, url);

    } catch (error) {
      clearTimeout(timeoutId);
      console.warn(`Lỗi quét bài viết ${url}:`, error);
      return null;
    }
  }

  /**
   * Parse thông tin bài viết từ HTML
   */
  private static parseArticle(html: string, url: string): VnExpressArticle | null {
    try {
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';

      // Extract content
      const contentMatch = html.match(/<div[^>]*class="[^"]*fck_detail[^"]*"[^>]*>(.*?)<\/div>/s);
      const content = contentMatch ? this.cleanHtml(contentMatch[1]) : '';

      // Extract published date
      const dateMatch = html.match(/<span[^>]*class="[^"]*time[^"]*"[^>]*>([^<]+)<\/span>/i);
      const publishedAt = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

      // Extract author
      const authorMatch = html.match(/<p[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/p>/i);
      const author = authorMatch ? authorMatch[1].trim() : '';

      // Extract image
      const imageMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*class="[^"]*thumb[^"]*"/i);
      const imageUrl = imageMatch ? imageMatch[1] : undefined;

      if (!title || !content) {
        return null;
      }

      return {
        id: this.generateId(url),
        title,
        url,
        content,
        publishedAt,
        category: this.extractCategory(url),
        tags: this.extractTags(html),
        author,
        imageUrl,
      };

    } catch (error) {
      console.warn(`Lỗi parse bài viết ${url}:`, error);
      return null;
    }
  }

  /**
   * Lọc bài viết theo keywords
   */
  private static filterByKeywords(articles: VnExpressArticle[], keywords: string[]): VnExpressArticle[] {
    if (keywords.length === 0) return articles;

    return articles.filter(article => {
      const searchText = `${article.title} ${article.content}`.toLowerCase();
      return keywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
    });
  }

  /**
   * Utility functions
   */
  private static cleanHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static extractCategory(url: string): string {
    const match = url.match(/vnexpress\.net\/([^\/]+)/);
    return match ? match[1] : 'unknown';
  }

  private static extractTags(html: string): string[] {
    const tagMatches = html.match(/<a[^>]*class="[^"]*tag[^"]*"[^>]*>([^<]+)<\/a>/g);
    return tagMatches ? tagMatches.map(match => 
      match.replace(/<[^>]*>/g, '').trim()
    ) : [];
  }

  private static generateId(url: string): string {
    return url.split('/').pop()?.replace('.html', '') || Date.now().toString();
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
