import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Share2,
  TrendingUp,
  MessageSquare,
  FileText,
  Clock,
  RotateCcw,
  CheckCircle2,
  Grid3X3,
  List,
  Tag
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';



// Mock data for scanned articles
const mockScannedArticles = [
  {
    id: '1',
    title: 'Công nghệ AI đang thay đổi ngành giáo dục như thế nào?',
    url: 'https://vnexpress.net/cong-nghe-ai-thay-doi-giao-duc-4567890.html',
    source: 'VnExpress',
    published_at: '2024-01-15T10:30:00Z',
    extracted_at: '2024-01-15T11:00:00Z',
    scan_session: 'scan_20240115_morning',
    scan_session_name: 'Quét sáng 15/01',
    content_preview: 'Trí tuệ nhân tạo (AI) đang tạo ra những thay đổi căn bản trong ngành giáo dục, từ việc cá nhân hóa trải nghiệm học tập đến tự động hóa quá trình chấm điểm...',
    keywords: ['AI', 'giáo dục', 'công nghệ', 'học tập'],
    source_type: 'news',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    has_generated_article: false,
    read_time: '5 phút',
    engagement_score: 85
  },
  {
    id: '2', 
    title: 'Thị trường bất động sản Q4/2024: Dấu hiệu phục hồi rõ nét',
    url: 'https://thanhnien.vn/thi-truong-bat-dong-san-phuc-hoi-4567891.html',
    source: 'Thanh Niên',
    published_at: '2024-01-15T08:15:00Z',
    extracted_at: '2024-01-15T08:45:00Z',
    scan_session: 'scan_20240115_morning',
    scan_session_name: 'Quét sáng 15/01',
    content_preview: 'Sau giai đoạn chững lại, thị trường bất động sản trong quý 4 năm 2024 đã cho thấy những tín hiệu phục hồi tích cực với lượng giao dịch tăng nhẹ...',
    keywords: ['bất động sản', 'thị trường', 'phục hồi', 'giao dịch'],
    source_type: 'news',
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
    has_generated_article: true,
    read_time: '4 phút',
    engagement_score: 78
  },
  {
    id: '3',
    title: 'Startup Việt gọi vốn thành công 10 triệu USD',
    url: 'https://example.com/startup-goi-von-thanh-cong',
    source: 'TechCrunch Vietnam',
    published_at: '2024-01-15T14:20:00Z',
    extracted_at: '2024-01-15T14:50:00Z',
    scan_session: 'scan_20240115_afternoon',
    scan_session_name: 'Quét chiều 15/01',
    content_preview: 'Startup công nghệ tài chính (fintech) của Việt Nam vừa hoàn tất vòng gọi vốn Series A với số tiền 10 triệu USD từ các nhà đầu tư trong khu vực...',
    keywords: ['startup', 'gọi vốn', 'fintech', 'đầu tư'],
    source_type: 'news',
    thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
    has_generated_article: false,
    read_time: '3 phút',
    engagement_score: 92
  },
  {
    id: '4',
    title: 'Xu hướng mua sắm online trong dịp Tết Nguyên Đán',
    url: 'https://example.com/mua-sam-online-tet',
    source: 'Facebook Business',
    published_at: '2024-01-15T16:00:00Z',
    extracted_at: '2024-01-15T16:30:00Z',
    scan_session: 'scan_20240115_afternoon',
    scan_session_name: 'Quét chiều 15/01',
    content_preview: 'Khảo sát mới nhất cho thấy người tiêu dùng Việt Nam ngày càng ưa chuộng việc mua sắm online cho dịp Tết Nguyên Đán, với mức tăng trưởng 35% so với năm trước...',
    keywords: ['mua sắm', 'online', 'Tết', 'e-commerce'],
    source_type: 'social',
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400',
    has_generated_article: false,
    read_time: '6 phút',
    engagement_score: 67
  },
  {
    id: '5',
    title: 'Biến đổi khí hậu tác động đến nông nghiệp ĐBSCL',
    url: 'https://example.com/bien-doi-khi-hau-nong-nghiep',
    source: 'Tuổi Trẻ',
    published_at: '2024-01-14T12:45:00Z',
    extracted_at: '2024-01-14T13:15:00Z',
    scan_session: 'scan_20240114_afternoon',
    scan_session_name: 'Quét chiều 14/01',
    content_preview: 'Tình trạng xâm nhập mặn và hạn hán kéo dài đang gây ảnh hưởng nghiêm trọng đến hoạt động sản xuất nông nghiệp tại vùng Đồng bằng sông Cửu Long...',
    keywords: ['biến đổi khí hậu', 'nông nghiệp', 'ĐBSCL', 'xâm nhập mặn'],
    source_type: 'news',
    thumbnail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    has_generated_article: false,
    read_time: '7 phút',
    engagement_score: 74
  }
];

const articleTypes = [
  {
    id: 'seo',
    name: 'Bài viết SEO',
    description: 'Tối ưu cho công cụ tìm kiếm',
    icon: TrendingUp,
    color: 'bg-green-600 hover:bg-green-700',
    prompt: 'Viết bài tối ưu SEO với keywords, meta description, và cấu trúc phù hợp'
  },
  {
    id: 'opinion',
    name: 'Bài viết quan điểm',
    description: 'Phân tích và đưa ra quan điểm',
    icon: MessageSquare,
    color: 'bg-blue-600 hover:bg-blue-700',
    prompt: 'Viết bài phân tích với quan điểm cá nhân, lập luận rõ ràng'
  },
  {
    id: 'news',
    name: 'Bài viết tin tức',
    description: 'Truyền đạt thông tin khách quan',
    icon: FileText,
    color: 'bg-purple-600 hover:bg-purple-700',
    prompt: 'Viết bài tin tức khách quan, cung cấp thông tin đầy đủ và chính xác'
  }
];

interface ArticleGenerationProps {
  onSelectArticle?: (article: any) => void;
}

export const ArticleGeneration: React.FC<ArticleGenerationProps> = ({ onSelectArticle }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [scanSessionFilter, setScanSessionFilter] = useState<string>('all');
  const [generatedFilter, setGeneratedFilter] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  
  const itemsPerPage = viewType === 'grid' ? 6 : 10;

  // Filter articles based on search and filters
  const filteredArticles = mockScannedArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content_preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = sourceFilter === 'all' || article.source.toLowerCase().includes(sourceFilter.toLowerCase());
    const matchesScanSession = scanSessionFilter === 'all' || article.scan_session === scanSessionFilter;
    const matchesGenerated = generatedFilter === 'all' || 
                            (generatedFilter === 'generated' && article.has_generated_article) ||
                            (generatedFilter === 'not_generated' && !article.has_generated_article);
    
    return matchesSearch && matchesSource && matchesScanSession && matchesGenerated;
  });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

  // Get unique scan sessions for filter
  const scanSessions = Array.from(new Set(mockScannedArticles.map(article => article.scan_session)))
    .map(session => {
      const article = mockScannedArticles.find(a => a.scan_session === session);
      return {
        id: session,
        name: article?.scan_session_name || session
      };
    });

  const getSourceTypeIcon = (sourceType: string) => {
    return sourceType === 'news' ? Newspaper : Share2;
  };

  const handlePreview = (article: any) => {
    setSelectedArticle(article);
    setPreviewOpen(true);
  };

  const handleWriteArticle = (article: any) => {
    if (onSelectArticle) {
      onSelectArticle(article);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Viết bài từ tin đã quét</h1>
          <p className="text-slate-600 mt-1">
            Chọn tin tức đã quét để tạo bài viết theo hướng mong muốn
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewType === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded-md transition-colors ${
                viewType === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Đã viết: {mockScannedArticles.filter(a => a.has_generated_article).length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Chưa viết: {mockScannedArticles.filter(a => !a.has_generated_article).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <div className="lg:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm tin tức..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={scanSessionFilter} onValueChange={setScanSessionFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Lần quét" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lần quét</SelectItem>
            {scanSessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Nguồn tin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nguồn</SelectItem>
            <SelectItem value="vnexpress">VnExpress</SelectItem>
            <SelectItem value="thanh">Thanh Niên</SelectItem>
            <SelectItem value="tuoi">Tuổi Trẻ</SelectItem>
            <SelectItem value="techcrunch">TechCrunch</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
          </SelectContent>
        </Select>

        <Select value={generatedFilter} onValueChange={setGeneratedFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="not_generated">Chưa viết bài</SelectItem>
            <SelectItem value="generated">Đã viết bài</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles Display */}
      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentArticles.map((article) => {
            const SourceIcon = getSourceTypeIcon(article.source_type);
            
            return (
              <Card key={article.id} className={`relative transition-all duration-200 hover:shadow-lg ${article.has_generated_article ? 'ring-2 ring-green-200 bg-green-50/30' : ''}`}>
                {article.has_generated_article && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Đã viết
                    </Badge>
                  </div>
                )}
                
                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img 
                    src={article.thumbnail} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <SourceIcon className="w-3 h-3" />
                      {article.source}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 leading-tight line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {article.content_preview}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{article.read_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      <span>{article.engagement_score}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {article.scan_session_name}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.published_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {article.keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {article.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{article.keywords.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(article)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(article.url, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Gốc
                    </Button>
                  </div>

                  {/* Write Article Button */}
                  <div className="pt-2 border-t">
                    <Button
                      onClick={() => handleWriteArticle(article)}
                      disabled={article.has_generated_article}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {article.has_generated_article ? 'Đã viết bài' : 'Viết bài'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {currentArticles.map((article) => {
            const SourceIcon = getSourceTypeIcon(article.source_type);
            
            return (
              <Card key={article.id} className={`transition-all duration-200 hover:shadow-md ${article.has_generated_article ? 'ring-2 ring-green-200 bg-green-50/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={article.thumbnail} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                      {article.has_generated_article && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                              <SourceIcon className="w-3 h-3" />
                              {article.source}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {article.scan_session_name}
                            </Badge>
                            {article.has_generated_article && (
                              <Badge className="bg-green-500 text-white text-xs">
                                Đã viết
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900 leading-tight mb-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                            {article.content_preview}
                          </p>
                          
                          {/* Keywords */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {article.keywords.slice(0, 4).map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Tag className="w-2 h-2 mr-1" />
                                {keyword}
                              </Badge>
                            ))}
                            {article.keywords.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{article.keywords.length - 4}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Meta info */}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(article.published_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.read_time}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {article.engagement_score}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(article)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(article.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleWriteArticle(article)}
                            disabled={article.has_generated_article}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {article.has_generated_article ? 'Đã viết' : 'Viết bài'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-sm text-slate-600">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredArticles.length)} trong tổng số {filteredArticles.length} tin tức
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </Button>
            <span className="text-sm text-slate-600">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <img 
                    src={selectedArticle.thumbnail} 
                    alt={selectedArticle.title}
                    className="w-8 h-8 rounded object-cover"
                  />
                  {selectedArticle.title}
                </DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      {React.createElement(getSourceTypeIcon(selectedArticle.source_type), { className: "w-4 h-4" })}
                      {selectedArticle.source}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedArticle.published_at)}
                    </div>
                    <Badge variant="outline">
                      {selectedArticle.scan_session_name}
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Nội dung bài viết:</h4>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedArticle.content_preview}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Từ khóa:</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedArticle.keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Thông tin khác:</h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>Thời gian đọc: {selectedArticle.read_time}</div>
                      <div>Điểm tương tác: {selectedArticle.engagement_score}%</div>
                      <div>Được quét lúc: {formatDate(selectedArticle.extracted_at)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedArticle.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Xem bài gốc
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>


    </div>
  );
};