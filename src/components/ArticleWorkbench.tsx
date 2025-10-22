import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { Separator } from './ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { 
  Search, 
  Save, 
  Send, 
  RefreshCw, 
  FileText, 
  Bold, 
  Italic, 
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Link2Off,
  Image as ImageIcon,
  Quote,
  Code,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  CheckCircle,
  Clock,
  Globe,
  Settings,
  Loader2,
  Type,
  PenTool,
  Target,
  Lightbulb,
  Undo,
  Redo,
  FileCode
} from 'lucide-react';

interface Article {
  article_id: string;
  title: string;
  status: 'draft' | 'published' | 'pending_review';
  created_at: string;
  created_by: string;
  source_job_id: string;
  source_url: string;
  word_count?: number;
  seo_score?: number;
}

interface ArticleContent {
  content: string;
}

const aiEnhanceOptions = [
  {
    id: 'improve_tone',
    name: 'Cải thiện giọng điệu',
    description: 'Tối ưu hóa giọng văn và tone của bài viết',
    icon: Type,
    color: 'bg-blue-600 hover:bg-blue-700',
    estimatedTime: '30-45 giây'
  },
  {
    id: 'seo_optimize', 
    name: 'Tối ưu SEO',
    description: 'Cải thiện từ khóa và cấu trúc cho SEO',
    icon: Target,
    color: 'bg-green-600 hover:bg-green-700',
    estimatedTime: '45-60 giây'
  },
  {
    id: 'grammar_check',
    name: 'Kiểm tra ngữ pháp',
    description: 'Sửa lỗi chính tả và ngữ pháp',
    icon: CheckCircle,
    color: 'bg-purple-600 hover:bg-purple-700',
    estimatedTime: '20-30 giây'
  },
  {
    id: 'add_insights',
    name: 'Bổ sung insights',
    description: 'Thêm thông tin và góc nhìn chuyên sâu',
    icon: Lightbulb,
    color: 'bg-orange-600 hover:bg-orange-700',
    estimatedTime: '60-90 giây'
  }
];

export const ArticleWorkbench: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articleContent, setArticleContent] = useState<string>('');
  const [articleTitle, setArticleTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState<string>('');
  const [cmsDialogOpen, setCmsDialogOpen] = useState(false);
  const [cmsAction, setCmsAction] = useState<'publish' | 'review'>('publish');
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  
  // Link dialog
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  
  // Image dialog
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 10;

  // Mock data for demonstration
  const mockArticles: Article[] = [
    {
      article_id: 'article-1',
      title: 'Công nghệ AI đang thay đổi ngành giáo dục như thế nào?',
      status: 'draft',
      created_at: '2025-10-08T07:35:00.123Z',
      created_by: 'lehien',
      source_job_id: '2025-10-07_180000_news',
      source_url: 'https://vnexpress.net/cong-nghe-ai-thay-doi-giao-duc-4567890.html',
      word_count: 1250,
      seo_score: 75
    },
    {
      article_id: 'article-2',
      title: 'Thị trường bất động sản Q4/2024: Dấu hiệu phục hồi rõ nét',
      status: 'published',
      created_at: '2025-10-07T15:20:00.456Z',
      created_by: 'phantd',
      source_job_id: '2025-10-07_120000_news',
      source_url: 'https://thanhnien.vn/thi-truong-bat-dong-san-phuc-hoi-4567891.html',
      word_count: 980,
      seo_score: 88
    },
    {
      article_id: 'article-3',
      title: 'Startup Việt gọi vốn thành công 10 triệu USD',
      status: 'pending_review',
      created_at: '2025-10-07T10:15:00.789Z',
      created_by: 'lehien',
      source_job_id: '2025-10-07_120000_news',
      source_url: 'https://example.com/startup-goi-von-thanh-cong',
      word_count: 800,
      seo_score: 65
    }
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      // In real implementation: GET /api/v1/articles
      setTimeout(() => {
        setArticles(mockArticles);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setIsLoading(false);
    }
  };

  const fetchArticleContent = async (articleId: string) => {
    setIsContentLoading(true);
    try {
      // In real implementation: GET /api/v1/articles/{article_id}/content
      const article = mockArticles.find(a => a.article_id === articleId);
      const mockContent = `<h1>${article?.title}</h1>
<p><strong>Giới thiệu:</strong> Trí tuệ nhân tạo (AI) đang tạo ra những thay đổi căn bản trong ngành giáo dục, từ việc cá nhân hóa trải nghiệm học tập đến tự động hóa quá trình chấm điểm và đánh giá.</p>

<h2>Tác động của AI trong giáo dục</h2>
<p>Công nghệ AI đã và đang được ứng dụng rộng rãi trong nhiều lĩnh vực của giáo dục:</p>

<ul>
<li><strong>Cá nhân hóa học tập:</strong> AI có thể phân tích dữ liệu học tập của từng học sinh để đưa ra lộ trình học tập phù hợp</li>
<li><strong>Hỗ trợ giảng dạy:</strong> Các công cụ AI giúp giáo viên tạo nội dung bài giảng, câu hỏi kiểm tra một cách nhanh chóng</li>
<li><strong>Đánh giá tự động:</strong> Hệ thống chấm điểm tự động giúp tiết kiệm thời gian và đảm bảo tính khách quan</li>
</ul>

<blockquote>
<p>"AI không thay thế giáo viên, mà giúp giáo viên trở nên hiệu quả hơn trong việc truyền đạt kiến thức" - Chuyên gia giáo dục John Smith</p>
</blockquote>

<h2>Thách thức và cơ hội</h2>
<p>Việc ứng dụng AI trong giáo dục cũng đặt ra nhiều thách thức:</p>

<ol>
<li>Đảm bảo quyền riêng tư và bảo mật dữ liệu học sinh</li>
<li>Cần có sự đầu tư về cơ sở hạ tầng công nghệ</li>
<li>Đào tạo giáo viên sử dụng công cụ AI hiệu quả</li>
</ol>

<h2>Kết luận</h2>
<p>AI đang mở ra những cơ hội vô hạn cho ngành giáo dục. Với sự phát triển không ngừng của công nghệ, chúng ta có thể kỳ vọng vào một tương lai giáo dục hiện đại, hiệu quả và phù hợp với từng cá nhân.</p>`;

      setTimeout(() => {
        setArticleContent(mockContent);
        setArticleTitle(article?.title || '');
        setIsContentLoading(false);
      }, 300);
    } catch (error) {
      console.error('Failed to fetch article content:', error);
      setIsContentLoading(false);
    }
  };

  const handleEditorCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertContent = (content: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const element = document.createElement('div');
        element.innerHTML = content;
        range.insertNode(element.firstChild || element);
      }
    }
  };

  const handleInsertLink = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setLinkText(selection.toString());
    }
    setLinkDialogOpen(true);
  };

  const confirmInsertLink = () => {
    if (linkUrl) {
      if (linkText) {
        insertContent(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${linkText}</a>`);
      } else {
        handleEditorCommand('createLink', linkUrl);
      }
    }
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleInsertImage = () => {
    setImageDialogOpen(true);
  };

  const confirmInsertImage = () => {
    if (imageUrl) {
      insertContent(`<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto; margin: 1rem 0;" />`);
    }
    setImageDialogOpen(false);
    setImageUrl('');
    setImageAlt('');
  };

  const toggleHtmlMode = () => {
    if (!isHtmlMode) {
      // Switching to HTML mode
      setHtmlContent(editorRef.current?.innerHTML || '');
      setIsHtmlMode(true);
    } else {
      // Switching back to Visual mode
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
        setArticleContent(htmlContent);
      }
      setIsHtmlMode(false);
    }
  };

  const saveArticle = async () => {
    if (!selectedArticle || !user || (user.role !== 'Admin' && user.role !== 'Writer')) {
      toast.error('Bạn không có quyền lưu bài viết');
      return;
    }

    setIsSaving(true);
    try {
      // In real implementation: PUT /api/v1/articles/{article_id}/content
      const content = editorRef.current?.innerHTML || articleContent;
      console.log('Saving article:', { title: articleTitle, content });
      
      setTimeout(() => {
        toast.success('Đã lưu bài viết thành công');
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Failed to save article:', error);
      toast.error('Không thể lưu bài viết');
      setIsSaving(false);
    }
  };

  const handleCMSAction = async () => {
    if (!selectedArticle || !user || (user.role !== 'Admin' && user.role !== 'Writer')) {
      toast.error('Bạn không có quyền thực hiện thao tác này');
      return;
    }

    setIsPublishing(true);
    setCmsDialogOpen(false);
    
    try {
      // In real implementation: POST /api/v1/articles/{article_id}/cms-action
      const content = editorRef.current?.innerHTML || articleContent;
      console.log(`CMS Action: ${cmsAction}`, { 
        article_id: selectedArticle.article_id,
        title: articleTitle, 
        content 
      });
      
      setTimeout(() => {
        const newStatus = cmsAction === 'publish' ? 'published' : 'pending_review';
        
        // Update article status in local state
        setArticles(articles.map(article => 
          article.article_id === selectedArticle.article_id 
            ? { ...article, status: newStatus as any }
            : article
        ));
        setSelectedArticle({ ...selectedArticle, status: newStatus as any });
        
        const message = cmsAction === 'publish' 
          ? 'Đã gửi bài viết lên CMS và xuất bản thành công!' 
          : 'Đã gửi bài viết để duyệt thành công!';
        
        toast.success(message);
        setIsPublishing(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to perform CMS action:', error);
      toast.error('Không thể thực hiện thao tác với CMS');
      setIsPublishing(false);
    }
  };

  const handleAIEnhance = async (enhanceType: string) => {
    if (!selectedArticle || !editorRef.current) return;
    
    setAiEnhancing(enhanceType);
    
    try {
      // In real implementation: POST /api/v1/articles/{article_id}/ai-enhance
      const content = editorRef.current.innerHTML;
      console.log(`AI Enhance: ${enhanceType}`, { content });
      
      // Mock AI enhancement
      const option = aiEnhanceOptions.find(opt => opt.id === enhanceType);
      const mockDelay = option?.estimatedTime.includes('60-90') ? 3000 : 
                       option?.estimatedTime.includes('45-60') ? 2000 :
                       option?.estimatedTime.includes('30-45') ? 1500 : 1000;
      
      await new Promise(resolve => setTimeout(resolve, mockDelay));
      
      let enhancedContent = content;
      
      switch (enhanceType) {
        case 'improve_tone':
          enhancedContent = content.replace(
            /<p>/g, 
            '<p style="color: #1a1a1a; line-height: 1.7;">'
          );
          break;
        case 'seo_optimize':
          enhancedContent = content.replace(
            /<h2>/g, 
            '<h2 style="color: #2563eb; margin-top: 2rem;">'
          );
          break;
        case 'grammar_check':
          enhancedContent = content.replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1');
          break;
        case 'add_insights':
          enhancedContent = content + `
<div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 1rem; margin: 1rem 0;">
<h3 style="color: #2563eb; margin: 0 0 0.5rem 0;">💡 Insights bổ sung</h3>
<p style="margin: 0;">Theo nghiên cứu gần đây, xu hướng này đang phát triển mạnh mẽ và được dự đoán sẽ tiếp tục tăng trưởng trong những năm tới.</p>
</div>`;
          break;
      }
      
      if (editorRef.current) {
        editorRef.current.innerHTML = enhancedContent;
      }
      
      toast.success(`Đã ${option?.name.toLowerCase()} thành công!`);
      
    } catch (error) {
      console.error('AI enhance failed:', error);
      toast.error('Có lỗi xảy ra khi cải thiện bài viết');
    } finally {
      setAiEnhancing('');
    }
  };

  const selectArticle = (article: Article) => {
    setSelectedArticle(article);
    fetchArticleContent(article.article_id);
  };

  const getStatusBadge = (status: string, includeIcon: boolean = false) => {
    const configs = {
      draft: { 
        variant: 'secondary' as const, 
        label: 'Nháp', 
        icon: Clock,
        color: 'text-yellow-600' 
      },
      published: { 
        variant: 'default' as const, 
        label: 'Đã xuất bản', 
        icon: Globe,
        color: 'text-green-600' 
      },
      pending_review: { 
        variant: 'outline' as const, 
        label: 'Chờ duyệt', 
        icon: Eye,
        color: 'text-blue-600' 
      }
    };
    
    const config = configs[status as keyof typeof configs] || {
      variant: 'outline' as const,
      label: status,
      icon: Settings,
      color: 'text-gray-600'
    };
    
    return (
      <Badge variant={config.variant} className={includeIcon ? `${config.color}` : ''}>
        {includeIcon && (
          <config.icon className="w-3 h-3 mr-1" />
        )}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Filter and paginate articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedArticles = filteredArticles.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workbench Bài viết</h1>
          <p className="text-slate-600 mt-1">
            Quản lý, chỉnh sửa và xuất bản bài viết
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedArticle && (
            <div className="flex items-center gap-2 text-sm text-slate-600 mr-4">
              {selectedArticle.word_count && (
                <span>📝 {selectedArticle.word_count} từ</span>
              )}
              {selectedArticle.seo_score && (
                <span className={`${selectedArticle.seo_score >= 80 ? 'text-green-600' : 
                  selectedArticle.seo_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  📊 SEO: {selectedArticle.seo_score}/100
                </span>
              )}
            </div>
          )}
          <Button
            variant="outline"
            onClick={fetchArticles}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article List */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-xl text-slate-900">Danh sách Bài viết</CardTitle>
            <CardDescription className="text-slate-600">
              Tổng cộng {filteredArticles.length} bài viết
            </CardDescription>
            
            {/* Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="pending_review">Chờ duyệt</SelectItem>
                  <SelectItem value="published">Đã xuất bản</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-0">
                {paginatedArticles.map((article) => (
                  <div
                    key={article.article_id}
                    className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedArticle?.article_id === article.article_id 
                        ? 'bg-muted border-l-4 border-l-primary' 
                        : ''
                    }`}
                    onClick={() => selectArticle(article)}
                  >
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium leading-tight line-clamp-2">
                        {article.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(article.status, true)}
                        <span className="text-xs text-muted-foreground">
                          {article.created_by}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(article.created_at)}</span>
                        <div className="flex items-center gap-2">
                          {article.word_count && <span>{article.word_count} từ</span>}
                          {article.seo_score && (
                            <span className={`${article.seo_score >= 80 ? 'text-green-600' : 
                              article.seo_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              SEO: {article.seo_score}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="p-4 border-t bg-slate-50">
                    <Pagination>
                      <PaginationContent>
                        {currentPage > 0 && (
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(currentPage - 1)}
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        )}
                        
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          const pageNum = Math.max(0, currentPage - 1) + i;
                          if (pageNum >= totalPages) return null;
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={pageNum === currentPage}
                                className="cursor-pointer"
                              >
                                {pageNum + 1}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        {currentPage < totalPages - 1 && (
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(currentPage + 1)}
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Article Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-900">
                    {selectedArticle ? 'Chỉnh sửa Bài viết' : 'Chọn bài viết để chỉnh sửa'}
                  </CardTitle>
                  {selectedArticle && (
                    <CardDescription className="mt-1">
                      {getStatusBadge(selectedArticle.status, true)}
                    </CardDescription>
                  )}
                </div>
                
                {selectedArticle && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPreview(!isPreview)}
                    >
                      {isPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {isPreview ? 'Chỉnh sửa' : 'Xem trước'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedArticle ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <PenTool className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Chưa chọn bài viết
                  </h3>
                  <p className="text-muted-foreground">
                    Chọn một bài viết từ danh sách để bắt đầu chỉnh sửa
                  </p>
                </div>
              ) : isContentLoading ? (
                <div className="flex justify-center p-12">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Đang tải nội dung...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Title Editor */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Tiêu đề bài viết</label>
                    <Input
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      placeholder="Nhập tiêu đề bài viết..."
                      className="text-lg font-medium"
                      disabled={user?.role === 'View'}
                    />
                  </div>

                  {!isPreview && (
                    <>
                      {/* Editor Mode Toggle */}
                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          variant={!isHtmlMode ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (isHtmlMode) {
                              toggleHtmlMode();
                            }
                          }}
                          className="h-8"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Visual
                        </Button>
                        <Button
                          variant={isHtmlMode ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (!isHtmlMode) {
                              toggleHtmlMode();
                            }
                          }}
                          className="h-8"
                        >
                          <FileCode className="w-4 h-4 mr-1" />
                          HTML
                        </Button>
                      </div>

                      {!isHtmlMode ? (
                        <>
                          {/* WordPress-style Editor Toolbar */}
                          <div className="border rounded-t-lg bg-white">
                            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-slate-50">
                              {/* Format Selector */}
                              <Select 
                                defaultValue="p"
                                onValueChange={(value) => {
                                  if (value === 'p') {
                                    handleEditorCommand('formatBlock', '<p>');
                                  } else if (value.startsWith('h')) {
                                    handleEditorCommand('formatBlock', `<${value}>`);
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8 w-[120px] bg-white text-sm">
                                  <SelectValue placeholder="Format" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="p">Paragraph</SelectItem>
                                  <SelectItem value="h1">Heading 1</SelectItem>
                                  <SelectItem value="h2">Heading 2</SelectItem>
                                  <SelectItem value="h3">Heading 3</SelectItem>
                                  <SelectItem value="h4">Heading 4</SelectItem>
                                  <SelectItem value="h5">Heading 5</SelectItem>
                                  <SelectItem value="h6">Heading 6</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Separator orientation="vertical" className="mx-1 h-6" />
                              
                              {/* Undo/Redo */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('undo')}
                                className="h-8 w-8 p-0"
                                title="Hoàn tác"
                              >
                                <Undo className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('redo')}
                                className="h-8 w-8 p-0"
                                title="Làm lại"
                              >
                                <Redo className="w-4 h-4" />
                              </Button>
                              
                              <Separator orientation="vertical" className="mx-1 h-6" />
                              
                              {/* Text Formatting */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('bold')}
                                className="h-8 w-8 p-0"
                                title="Đậm"
                              >
                                <Bold className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('italic')}
                                className="h-8 w-8 p-0"
                                title="Nghiêng"
                              >
                                <Italic className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('underline')}
                                className="h-8 w-8 p-0"
                                title="Gạch chân"
                              >
                                <Underline className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('strikeThrough')}
                                className="h-8 w-8 p-0"
                                title="Gạch ngang"
                              >
                                <Strikethrough className="w-4 h-4" />
                              </Button>
                              
                              <Separator orientation="vertical" className="mx-1 h-6" />
                              
                              {/* Lists */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('insertUnorderedList')}
                                className="h-8 w-8 p-0"
                                title="Danh sách không thứ tự"
                              >
                                <List className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('insertOrderedList')}
                                className="h-8 w-8 p-0"
                                title="Danh sách có thứ tự"
                              >
                                <ListOrdered className="w-4 h-4" />
                              </Button>
                              
                              <Separator orientation="vertical" className="mx-1 h-6" />
                              
                              {/* Insert Link/Unlink */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleInsertLink}
                                className="h-8 w-8 p-0"
                                title="Chèn liên kết"
                              >
                                <LinkIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('unlink')}
                                className="h-8 w-8 p-0"
                                title="Gỡ liên kết"
                              >
                                <Link2Off className="w-4 h-4" />
                              </Button>
                              
                              <Separator orientation="vertical" className="mx-1 h-6" />
                              
                              {/* Quote & Code */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => insertContent('<blockquote style="border-left: 4px solid #e2e8f0; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #64748b;">Nhập trích dẫn...</blockquote><p><br></p>')}
                                className="h-8 w-8 p-0"
                                title="Trích dẫn"
                              >
                                <Quote className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => insertContent('<code style="background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em; color: #334155;">code</code>')}
                                className="h-8 w-8 p-0"
                                title="Mã"
                              >
                                <Code className="w-4 h-4" />
                              </Button>
                              
                              <Separator orientation="vertical" className="mx-1 h-6" />
                              
                              {/* Alignment */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('justifyLeft')}
                                className="h-8 w-8 p-0"
                                title="Căn trái"
                              >
                                <AlignLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('justifyCenter')}
                                className="h-8 w-8 p-0"
                                title="Căn giữa"
                              >
                                <AlignCenter className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditorCommand('justifyRight')}
                                className="h-8 w-8 p-0"
                                title="Căn phải"
                              >
                                <AlignRight className="w-4 h-4" />
                              </Button>
                              
                              <Separator orientation="vertical" className="mx-1 h-6" />
                              
                              {/* Insert Image */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleInsertImage}
                                className="h-8 w-8 p-0"
                                title="Chèn ảnh"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Content Editor */}
                          <div
                            ref={editorRef}
                            contentEditable={user?.role !== 'View'}
                            dangerouslySetInnerHTML={{ __html: articleContent }}
                            className="min-h-[500px] max-h-[700px] overflow-y-auto p-6 border border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            style={{
                              lineHeight: '1.8',
                              fontSize: '15px',
                              color: '#1a1a1a'
                            }}
                            onInput={(e) => setArticleContent((e.target as HTMLDivElement).innerHTML)}
                          />
                        </>
                      ) : (
                        <>
                          {/* HTML Editor */}
                          <textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            className="w-full min-h-[500px] max-h-[700px] p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                            style={{
                              lineHeight: '1.6',
                              fontSize: '14px'
                            }}
                            disabled={user?.role === 'View'}
                          />
                        </>
                      )}
                    </>
                  )}

                  {isPreview && (
                    <div className="border rounded-lg p-6 bg-white min-h-[400px]">
                      <div className="prose prose-lg max-w-none">
                        <h1 className="text-3xl font-bold mb-4 text-slate-900">{articleTitle}</h1>
                        <div dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || articleContent }} />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {user && (user.role === 'Admin' || user.role === 'Writer') && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button
                        onClick={saveArticle}
                        disabled={isSaving}
                        variant="outline"
                      >
                        <Save className={`w-4 h-4 mr-2 ${isSaving ? 'animate-pulse' : ''}`} />
                        {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
                      </Button>
                      
                      <Button
                        onClick={() => {
                          setCmsAction('review');
                          setCmsDialogOpen(true);
                        }}
                        disabled={isPublishing}
                        variant="outline"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Gửi duyệt
                      </Button>
                      
                      <Button
                        onClick={() => {
                          setCmsAction('publish');
                          setCmsDialogOpen(true);
                        }}
                        disabled={isPublishing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className={`w-4 h-4 mr-2 ${isPublishing ? 'animate-pulse' : ''}`} />
                        {isPublishing ? 'Đang xử lý...' : 'Xuất bản lên CMS'}
                      </Button>
                    </div>
                  )}

                  {/* Source Info */}
                  {selectedArticle.source_url && (
                    <div className="pt-4 border-t bg-slate-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-slate-900 mb-2">Thông tin nguồn</h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        URL:{' '}
                        <a 
                          href={selectedArticle.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedArticle.source_url}
                        </a>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Job ID: {selectedArticle.source_job_id}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Enhancement Panel */}
          {selectedArticle && !isPreview && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200">
                <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Enhancement
                </CardTitle>
                <CardDescription>
                  Sử dụng AI để cải thiện chất lượng bài viết của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiEnhanceOptions.map((option) => {
                    const Icon = option.icon;
                    const isEnhancing = aiEnhancing === option.id;
                    
                    return (
                      <Card key={option.id} className="border-2 border-slate-200 hover:border-purple-300 transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${option.color.replace('hover:', '')} text-white flex-shrink-0`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 mb-1">{option.name}</h3>
                              <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                                {option.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                  ⚡ {option.estimatedTime}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => handleAIEnhance(option.id)}
                                  disabled={!!aiEnhancing}
                                  className={`${option.color} text-white h-7 px-3 text-xs`}
                                >
                                  {isEnhancing ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-3 h-3 mr-1" />
                                      Cải thiện
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {aiEnhancing && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">
                        AI đang xử lý yêu cầu của bạn... Vui lòng đợi trong giây lát.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* CMS Action Dialog */}
      <AlertDialog open={cmsDialogOpen} onOpenChange={setCmsDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {cmsAction === 'publish' ? (
                <>
                  <Send className="w-5 h-5 text-green-600" />
                  Xuất bản lên CMS
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5 text-blue-600" />
                  Gửi bài để duyệt
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                {cmsAction === 'publish' 
                  ? 'Bạn có chắc chắn muốn xuất bản bài viết này lên CMS? Bài viết sẽ được công khai ngay lập tức.'
                  : 'Bạn có chắc chắn muốn gửi bài viết này để duyệt? Editor sẽ xem xét và phê duyệt bài viết.'
                }
              </p>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">
                  {articleTitle || selectedArticle?.title}
                </p>
                <p className="text-sm text-slate-600">
                  Trạng thái hiện tại: {getStatusBadge(selectedArticle?.status || 'draft')}
                </p>
              </div>

              <div className={`p-3 rounded-lg border ${
                cmsAction === 'publish' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-sm ${
                  cmsAction === 'publish' ? 'text-green-800' : 'text-blue-800'
                }`}>
                  <strong>Lưu ý:</strong> {cmsAction === 'publish' 
                    ? 'Sau khi xuất bản, bài viết sẽ hiển thị công khai trên website.'
                    : 'Bài viết sẽ được chuyển sang trạng thái "Chờ duyệt" và editor sẽ xem xét trong vòng 24h.'
                  }
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCMSAction}
              className={cmsAction === 'publish' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {cmsAction === 'publish' ? (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Xuất bản ngay
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Gửi để duyệt
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-600" />
              Chèn liên kết
            </DialogTitle>
            <DialogDescription>
              Nhập URL và văn bản hiển thị cho liên kết của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-text">Văn bản hiển thị (tùy chọn)</Label>
              <Input
                id="link-text"
                placeholder="Nhấp vào đây"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Để trống nếu bạn đã chọn văn bản trong editor
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={confirmInsertLink} disabled={!linkUrl}>
              <LinkIcon className="w-4 h-4 mr-2" />
              Chèn liên kết
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-600" />
              Chèn hình ảnh
            </DialogTitle>
            <DialogDescription>
              Nhập URL của hình ảnh và mô tả alt text (tùy chọn).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL hình ảnh</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt text (tùy chọn)</Label>
              <Input
                id="image-alt"
                placeholder="Mô tả hình ảnh"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Alt text giúp SEO và hỗ trợ accessibility
              </p>
            </div>
            {imageUrl && (
              <div className="space-y-2">
                <Label>Xem trước</Label>
                <div className="border rounded-lg p-2 bg-slate-50">
                  <img 
                    src={imageUrl} 
                    alt={imageAlt || 'Preview'} 
                    className="max-w-full h-auto max-h-48 mx-auto rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ELỗi tải ảnh%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={confirmInsertImage} disabled={!imageUrl}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Chèn hình ảnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};