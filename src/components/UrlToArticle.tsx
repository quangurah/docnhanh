import React, { useState } from 'react';
import { 
  Link, 
  Search, 
  Clock,
  ExternalLink,
  RotateCcw,
  TrendingUp,
  MessageSquare,
  FileText,
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Share,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
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
import { toast } from 'sonner@2.0.3';

const articleTypes = [
  {
    id: 'seo',
    name: 'Bài viết SEO',
    description: 'Tối ưu cho công cụ tìm kiếm với keywords và cấu trúc phù hợp',
    icon: TrendingUp,
    color: 'bg-green-600 hover:bg-green-700',
    features: ['Tối ưu từ khóa', 'Meta description', 'Cấu trúc H1-H6', 'Internal linking']
  },
  {
    id: 'opinion',
    name: 'Bài viết quan điểm',
    description: 'Phân tích sâu với quan điểm cá nhân và lập luận chặt chẽ',
    icon: MessageSquare,
    color: 'bg-blue-600 hover:bg-blue-700',
    features: ['Phân tích chuyên sâu', 'Quan điểm rõ ràng', 'Lập luận logic', 'Kết luận mạnh mẽ']
  },
  {
    id: 'news',
    name: 'Bài viết tin tức',
    description: 'Truyền đạt thông tin khách quan và chính xác',
    icon: FileText,
    color: 'bg-purple-600 hover:bg-purple-700',
    features: ['Thông tin chính xác', 'Cấu trúc 5W1H', 'Khách quan', 'Dễ hiểu']
  }
];

export const UrlToArticle: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedContent, setExtractedContent] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAnalyzeUrl = async () => {
    if (!url) {
      toast.error('Vui lòng nhập URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error('URL không hợp lệ');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // TODO: Implement actual API call to extract content
      console.log('Analyzing URL:', url);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock extracted content
      const mockContent = {
        title: 'Công nghệ blockchain đang thay đổi ngành tài chính như thế nào?',
        meta_description: 'Khám phá cách công nghệ blockchain đang cách mạng hóa ngành tài chính với các ứng dụng từ thanh toán đến smart contracts.',
        author: 'Nguyễn Văn A',
        published_date: '2024-01-15T10:30:00Z',
        reading_time: '8 phút',
        content: `Công nghệ blockchain đã không còn là một khái niệm xa lạ trong thế giới công nghệ hiện đại. Từ những ngày đầu chỉ được biết đến qua Bitcoin, blockchain giờ đây đã trở thành một trong những công nghệ đột phá quan trọng nhất trong ngành tài chính.

Blockchain, hay "chuỗi khối", là một cơ sở dữ liệu phân tán cho phép lưu trữ thông tin một cách an toàn, minh bạch và không thể thay đổi. Mỗi "khối" trong chuỗi chứa các giao dịch được mã hóa và liên kết với khối trước đó, tạo thành một chuỗi liên tục không thể bị phá vỡ.

Trong ngành tài chính, blockchain đang mang lại những thay đổi căn bản:

1. **Thanh toán không biên giới**: Blockchain cho phép thực hiện các giao dịch xuyên biên giới nhanh chóng và với chi phí thấp, loại bỏ nhu cầu về các trung gian truyền thống như ngân hàng.

2. **Smart Contracts (Hợp đồng thông minh)**: Đây là các chương trình tự động thực thi khi các điều kiện được xác định trước được đáp ứng, giúp giảm thiểu rủi ro và chi phí trong các giao dịch tài chính.

3. **DeFi (Tài chính phi tập trung)**: Blockchain đã tạo ra một hệ sinh thái tài chính hoàn toàn mới, cho phép người dùng truy cập các dịch vụ tài chính mà không cần thông qua các tổ chức tài chính truyền thống.

Tuy nhiên, việc áp dụng blockchain trong tài chính cũng đối mặt với nhiều thách thức, bao gồm vấn đề về quy định pháp lý, khả năng mở rộng và tiêu thụ năng lượng.`,
        images: [
          'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'
        ],
        keywords: ['blockchain', 'tài chính', 'Bitcoin', 'DeFi', 'smart contracts', 'công nghệ'],
        sentiment: 'positive',
        credibility_score: 87,
        complexity_level: 'intermediate'
      };
      
      setExtractedContent(mockContent);
      toast.success('Phân tích URL thành công!');
      
    } catch (error) {
      toast.error('Có lỗi xảy ra khi phân tích URL');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateArticle = (type: string) => {
    setSelectedType(type);
    setGenerateConfirmOpen(true);
  };

  const confirmGenerate = async () => {
    if (!extractedContent || !selectedType) return;
    
    setIsGenerating(true);
    setGenerateConfirmOpen(false);
    
    try {
      // TODO: Implement actual API call
      console.log(`Generating ${selectedType} article from URL content`);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      toast.success(`Đã bắt đầu tạo bài viết ${articleTypes.find(t => t.id === selectedType)?.name}!`);
      
      // Here you would navigate to ArticleWorkbench with generated content
      
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo bài viết');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép URL');
  };

  const handleSaveContent = () => {
    if (!extractedContent) return;
    
    const dataStr = JSON.stringify(extractedContent, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'extracted-content.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Đã lưu nội dung');
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

  const getCredibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplexityBadge = (level: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    const labels = {
      beginner: 'Cơ bản',
      intermediate: 'Trung bình',
      advanced: 'Nâng cao'
    };
    return { color: colors[level as keyof typeof colors], label: labels[level as keyof typeof labels] };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Viết bài từ URL</h1>
        <p className="text-slate-600 mt-1">
          Nhập URL bài viết để phân tích nội dung và tạo bài viết theo hướng mong muốn
        </p>
      </div>

      {/* URL Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Phân tích URL
          </CardTitle>
          <CardDescription>
            Nhập đường dẫn URL của bài viết cần phân tích và tạo bài viết mới
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="https://example.com/article-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pr-10"
                disabled={isAnalyzing}
              />
              {url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button 
              onClick={handleAnalyzeUrl}
              disabled={!url || isAnalyzing}
              className="min-w-[120px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Phân tích
                </>
              )}
            </Button>
          </div>
          
          {isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-blue-800 font-medium">Đang phân tích nội dung...</p>
                  <p className="text-blue-600 text-sm">Quá trình này có thể mất vài giây</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Content Display */}
      {extractedContent && (
        <div className="space-y-6">
          {/* Content Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{extractedContent.title}</CardTitle>
                  <CardDescription className="max-w-3xl">
                    {extractedContent.meta_description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveContent}>
                    <Download className="w-4 h-4 mr-2" />
                    Lưu
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(url, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Mở gốc
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Tác giả</p>
                  <p className="font-medium">{extractedContent.author}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Ngày xuất bản</p>
                  <p className="font-medium">{formatDate(extractedContent.published_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Thời gian đọc</p>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">{extractedContent.reading_time}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Độ tin cậy</p>
                  <p className={`font-bold ${getCredibilityColor(extractedContent.credibility_score)}`}>
                    {extractedContent.credibility_score}%
                  </p>
                </div>
              </div>

              {/* Keywords and Badges */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Từ khóa chính:</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedContent.keywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Độ phức tạp:</span>
                    <Badge className={getComplexityBadge(extractedContent.complexity_level).color}>
                      {getComplexityBadge(extractedContent.complexity_level).label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Cảm xúc:</span>
                    <Badge className={
                      extractedContent.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      extractedContent.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {extractedContent.sentiment === 'positive' ? 'Tích cực' :
                       extractedContent.sentiment === 'negative' ? 'Tiêu cực' : 'Trung tính'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div>
                <h4 className="font-medium mb-3">Nội dung bài viết:</h4>
                <div className="bg-white border rounded-lg p-4 max-h-80 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {extractedContent.content.split('\n\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-4 text-slate-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Images */}
              {extractedContent.images && extractedContent.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Hình ảnh trong bài:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {extractedContent.images.map((image: string, index: number) => (
                      <div key={index} className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Hình ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Article Generation Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Tạo bài viết mới
              </CardTitle>
              <CardDescription>
                Chọn hướng viết bài phù hợp với mục đích sử dụng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articleTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card key={type.id} className="border-2 border-slate-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${type.color.replace('hover:', '')} text-white`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{type.name}</h3>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {type.description}
                        </p>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Đặc điểm:</p>
                          <ul className="space-y-1">
                            {type.features.map((feature, index) => (
                              <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Button 
                          className={`w-full ${type.color}`}
                          onClick={() => handleGenerateArticle(type.id)}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Đang tạo bài...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Tạo {type.name}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Confirmation Modal */}
      <AlertDialog open={generateConfirmOpen} onOpenChange={setGenerateConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {selectedType && articleTypes.find(t => t.id === selectedType) && (
                <>
                  {React.createElement(articleTypes.find(t => t.id === selectedType)!.icon, { className: "w-5 h-5" })}
                  Xác nhận tạo {articleTypes.find(t => t.id === selectedType)?.name}
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Bạn có chắc chắn muốn tạo bài viết <strong>{articleTypes.find(t => t.id === selectedType)?.name}</strong> từ URL:
              </p>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">
                  {extractedContent?.title}
                </p>
                <p className="text-sm text-slate-600 break-all">
                  {url}
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Hướng viết bài:</strong>
                </p>
                <p className="text-sm text-blue-700">
                  {articleTypes.find(t => t.id === selectedType)?.description}
                </p>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Lưu ý:</strong> Quá trình tạo bài viết có thể mất vài phút.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmGenerate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Tạo bài viết
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};