import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  ExternalLink,
  Calendar,
  Clock,
  Newspaper,
  Share2,
  TrendingUp,
  MessageSquare,
  FileText,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Tag,
  User,
  Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
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
    features: ['Tối ưu từ khóa', 'Meta description', 'Cấu trúc H1-H6', 'Internal linking'],
    estimatedTime: '3-5 phút'
  },
  {
    id: 'opinion',
    name: 'Bài viết quan điểm',
    description: 'Phân tích sâu với quan điểm cá nhân và lập luận chặt chẽ',
    icon: MessageSquare,
    color: 'bg-blue-600 hover:bg-blue-700',
    features: ['Phân tích chuyên sâu', 'Quan điểm rõ ràng', 'Lập luận logic', 'Kết luận mạnh mẽ'],
    estimatedTime: '4-6 phút'
  },
  {
    id: 'news',
    name: 'Bài viết tin tức',
    description: 'Truyền đạt thông tin khách quan và chính xác',
    icon: FileText,
    color: 'bg-purple-600 hover:bg-purple-700',
    features: ['Thông tin chính xác', 'Cấu trúc 5W1H', 'Khách quan', 'Dễ hiểu'],
    estimatedTime: '2-4 phút'
  }
];

interface ArticleWriterProps {
  selectedArticle: any;
  onBack: () => void;
  onArticleGenerated: (article: any, type: string) => void;
}

export const ArticleWriter: React.FC<ArticleWriterProps> = ({ 
  selectedArticle, 
  onBack, 
  onArticleGenerated 
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!selectedArticle) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-slate-600">Không có bài viết nào được chọn</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const handleGenerateArticle = (type: string) => {
    setSelectedType(type);
    setGenerateConfirmOpen(true);
  };

  const confirmGenerate = async () => {
    if (!selectedArticle || !selectedType) return;
    
    setIsGenerating(true);
    setGenerateConfirmOpen(false);
    
    try {
      // TODO: Implement actual API call
      console.log(`Generating ${selectedType} article for:`, selectedArticle.title);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const generatedArticle = {
        id: `generated_${Date.now()}`,
        source_article_id: selectedArticle.id,
        type: selectedType,
        title: `[${articleTypes.find(t => t.id === selectedType)?.name}] ${selectedArticle.title}`,
        content: `Generated ${selectedType} content based on: ${selectedArticle.title}`,
        created_at: new Date().toISOString(),
        status: 'draft'
      };
      
      toast.success(`Đã tạo thành công bài viết ${articleTypes.find(t => t.id === selectedType)?.name}!`);
      
      // Call the callback to navigate to ArticleWorkbench
      onArticleGenerated(generatedArticle, selectedType);
      
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo bài viết');
    } finally {
      setIsGenerating(false);
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

  const getSourceTypeIcon = (sourceType: string) => {
    return sourceType === 'news' ? Newspaper : Share2;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Viết bài từ nguồn</h1>
            <p className="text-slate-600 mt-1">
              Chọn hướng viết bài phù hợp cho tin tức đã chọn
            </p>
          </div>
        </div>
        
        {isGenerating && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Đang tạo bài viết...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article Preview - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {React.createElement(getSourceTypeIcon(selectedArticle.source_type), { className: "w-4 h-4 text-slate-500" })}
                    <span className="text-sm text-slate-600">{selectedArticle.source}</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedArticle.scan_session_name}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl leading-tight">{selectedArticle.title}</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open(selectedArticle.url, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Xem gốc
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={selectedArticle.thumbnail} 
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Ngày xuất bản</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span className="text-sm font-medium">{formatDate(selectedArticle.published_at)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Thời gian đọc</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-sm font-medium">{selectedArticle.read_time}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Điểm tương tác</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-slate-500" />
                    <span className="text-sm font-medium">{selectedArticle.engagement_score}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Được quét lúc</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span className="text-sm font-medium">{formatDate(selectedArticle.extracted_at)}</span>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Từ khóa chính:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.keywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content Preview */}
              <div>
                <h4 className="font-medium mb-3">Nội dung bài viết:</h4>
                <div className="bg-white border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-slate-700 leading-relaxed">
                    {selectedArticle.content_preview}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Article Generation Options - Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Chọn hướng viết bài
              </CardTitle>
              <CardDescription>
                Chọn loại bài viết phù hợp với mục đích sử dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {articleTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card key={type.id} className="border-2 border-slate-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type.color.replace('hover:', '')} text-white`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{type.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{type.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {type.description}
                      </p>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-700">Đặc điểm chính:</p>
                        <ul className="space-y-1">
                          {type.features.slice(0, 2).map((feature, index) => (
                            <li key={index} className="text-xs text-slate-600 flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button 
                        className={`w-full ${type.color} text-white`}
                        onClick={() => handleGenerateArticle(type.id)}
                        disabled={isGenerating}
                        size="sm"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang tạo...
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
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tiến trình</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-slate-600">Đã chọn tin tức</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                <span className="text-slate-400">Chọn hướng viết bài</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                <span className="text-slate-400">Tạo bài viết</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                <span className="text-slate-400">Chỉnh sửa và hoàn thiện</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
                Bạn có chắc chắn muốn tạo bài viết <strong>{articleTypes.find(t => t.id === selectedType)?.name}</strong> từ tin tức:
              </p>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">
                  {selectedArticle?.title}
                </p>
                <p className="text-sm text-slate-600">
                  Nguồn: {selectedArticle?.source}
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Thời gian ước tính:</strong>
                </p>
                <p className="text-sm text-blue-700">
                  {articleTypes.find(t => t.id === selectedType)?.estimatedTime}
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
              Bắt đầu tạo bài
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};