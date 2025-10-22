import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  ExternalLink, 
  Calendar, 
  User, 
  Tag, 
  Image as ImageIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { VnExpressArticle, ScrapingResult } from '../utils/vnexpressScraper';

interface VnExpressResultsProps {
  result: ScrapingResult;
  onClose?: () => void;
}

export const VnExpressResults: React.FC<VnExpressResultsProps> = ({ result, onClose }) => {
  const [selectedArticle, setSelectedArticle] = useState<VnExpressArticle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = () => {
    if (result.success) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (result.errors.length > 0) {
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = () => {
    if (result.success) {
      return 'Thành công';
    } else if (result.errors.length > 0) {
      return 'Có lỗi';
    } else {
      return 'Thất bại';
    }
  };

  const getStatusColor = () => {
    if (result.success) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (result.errors.length > 0) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getCurrentArticles = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return result.articles.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = () => {
    return Math.ceil(result.articles.length / itemsPerPage);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header với thống kê */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-bold">Kết quả quét VnExpress</h2>
              <p className="text-sm text-gray-600">
                Hoàn thành trong {Math.round(result.duration / 1000)} giây
              </p>
            </div>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{result.totalFound}</div>
              <div className="text-sm text-gray-600">Bài viết tìm thấy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{result.sources.length}</div>
              <div className="text-sm text-gray-600">Nguồn tin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{result.errors.length}</div>
              <div className="text-sm text-gray-600">Lỗi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(result.duration / 1000)}s
              </div>
              <div className="text-sm text-gray-600">Thời gian</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách lỗi nếu có */}
      {result.errors.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              Lỗi trong quá trình quét
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.errors.map((error, index) => (
                <div key={index} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danh sách bài viết */}
      {result.articles.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách bài viết ({result.articles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCurrentArticles().map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium text-sm line-clamp-2">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {truncateText(article.content)}
                          </p>
                          {article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {article.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {article.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{article.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <User className="w-3 h-3" />
                          {article.author || 'Không xác định'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.publishedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedArticle(article)}
                          >
                            Xem chi tiết
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(article.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {getTotalPages() > 1 && (
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                  Trang {currentPage} / {getTotalPages()}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
                    disabled={currentPage === getTotalPages()}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <XCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              Không tìm thấy bài viết nào từ VnExpress
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog chi tiết bài viết */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Chi tiết bài viết
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về bài viết từ VnExpress
            </DialogDescription>
          </DialogHeader>
          
          {selectedArticle && (
            <div className="space-y-4">
              {/* Header info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <Badge variant="outline">{selectedArticle.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tác giả</p>
                  <p className="font-medium">{selectedArticle.author || 'Không xác định'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thời gian</p>
                  <p className="font-medium">{formatDate(selectedArticle.publishedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tags</p>
                  <p className="font-medium">{selectedArticle.tags.length} tags</p>
                </div>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-lg font-bold mb-2">{selectedArticle.title}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedArticle.url, '_blank')}
                  className="mb-4"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Xem trên VnExpress
                </Button>
              </div>

              {/* Image */}
              {selectedArticle.imageUrl && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Hình ảnh
                  </p>
                  <img 
                    src={selectedArticle.imageUrl} 
                    alt={selectedArticle.title}
                    className="max-w-full h-auto rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <p className="text-sm font-medium mb-2">Nội dung</p>
                <div className="prose max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedArticle.content}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {selectedArticle.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags ({selectedArticle.tags.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
