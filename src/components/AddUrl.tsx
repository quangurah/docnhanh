import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Link, 
  Trash2, 
  ExternalLink,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UrlEntry {
  id: string;
  url: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
  added_at: string;
  added_by: string;
}

export const AddUrl: React.FC = () => {
  const { user } = useAuth();
  const [urls, setUrls] = useState<UrlEntry[]>([
    {
      id: '1',
      url: 'https://vnexpress.net/rss/tin-moi-nhat.rss',
      description: 'VNExpress - Tin mới nhất',
      category: 'news',
      status: 'active',
      added_at: '2025-01-08T09:00:00Z',
      added_by: 'admin'
    },
    {
      id: '2',
      url: 'https://tuoitre.vn/rss/tin-moi-nhat.rss',
      description: 'Tuổi Trẻ - RSS Feed',
      category: 'news',
      status: 'active',
      added_at: '2025-01-07T14:30:00Z',
      added_by: 'writer'
    }
  ]);
  
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('news');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has permission to add URLs
  const canAddUrl = user && (user.role === 'Admin' || user.role === 'Writer');

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddUrl = async () => {
    if (!canAddUrl) {
      toast.error('Bạn không có quyền thực hiện thao tác này');
      return;
    }

    if (!newUrl.trim()) {
      toast.error('Vui lòng nhập URL');
      return;
    }

    if (!validateUrl(newUrl)) {
      toast.error('URL không hợp lệ');
      return;
    }

    if (!newDescription.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return;
    }

    // Check if URL already exists
    if (urls.some(url => url.url === newUrl)) {
      toast.error('URL này đã tồn tại trong danh sách');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEntry: UrlEntry = {
        id: Date.now().toString(),
        url: newUrl,
        description: newDescription,
        category: newCategory,
        status: 'active',
        added_at: new Date().toISOString(),
        added_by: user.username
      };
      
      setUrls(prev => [newEntry, ...prev]);
      
      // Reset form
      setNewUrl('');
      setNewDescription('');
      setNewCategory('news');
      
      toast.success('Đã thêm URL thành công');
    } catch (error) {
      toast.error('Không thể thêm URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUrl = async (id: string) => {
    if (!canAddUrl) {
      toast.error('Bạn không có quyền thực hiện thao tác này');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setUrls(prev => prev.filter(url => url.id !== id));
      toast.success('Đã xóa URL');
    } catch (error) {
      toast.error('Không thể xóa URL');
    }
  };

  const toggleUrlStatus = async (id: string) => {
    if (!canAddUrl) {
      toast.error('Bạn không có quyền thực hiện thao tác này');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setUrls(prev => prev.map(url => 
        url.id === id 
          ? { ...url, status: url.status === 'active' ? 'inactive' : 'active' }
          : url
      ));
      toast.success('Đã cập nhật trạng thái URL');
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="default" className="bg-green-600">Hoạt động</Badge>
      : <Badge variant="secondary">Tạm dừng</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Thêm URL</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý các nguồn URL để quét nội dung
        </p>
      </div>

      {!canAddUrl && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Bạn chỉ có quyền xem danh sách URL. Chỉ Admin và Writer mới có thể thêm hoặc xóa URL.
          </AlertDescription>
        </Alert>
      )}

      {canAddUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Thêm URL mới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/rss"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">Tin tức</SelectItem>
                    <SelectItem value="tech">Công nghệ</SelectItem>
                    <SelectItem value="business">Kinh doanh</SelectItem>
                    <SelectItem value="sports">Thể thao</SelectItem>
                    <SelectItem value="entertainment">Giải trí</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả về nguồn URL này..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button 
              onClick={handleAddUrl} 
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? 'Đang thêm...' : 'Thêm URL'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="w-5 h-5 mr-2" />
            Danh sách URL ({urls.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {urls.length === 0 ? (
            <div className="text-center py-8">
              <Link className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có URL nào được thêm</p>
            </div>
          ) : (
            <div className="space-y-4">
              {urls.map((url) => (
                <div key={url.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <a 
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline flex items-center"
                        >
                          {url.description}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                        {getStatusBadge(url.status)}
                        <Badge variant="outline">{url.category}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 break-all">
                        {url.url}
                      </p>
                      
                      <div className="flex items-center text-xs text-muted-foreground space-x-4">
                        <span>Thêm bởi: {url.added_by}</span>
                        <span>Ngày thêm: {new Date(url.added_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                    
                    {canAddUrl && (
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUrlStatus(url.id)}
                        >
                          {url.status === 'active' ? (
                            <>
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Tạm dừng
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Kích hoạt
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveUrl(url.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Lưu ý:</strong> URL được thêm vào đây sẽ được sử dụng trong các tác vụ quét tiếp theo. 
          Hãy đảm bảo các URL này đều hoạt động và có nội dung phù hợp.
        </AlertDescription>
      </Alert>
    </div>
  );
};