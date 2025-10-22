import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner@2.0.3';
import { 
  Search, 
  Calendar as CalendarIcon,
  RefreshCw, 
  Download,
  Filter,
  Clock,
  User,
  Settings,
  FileText,
  Scan,
  Eye,
  Save,
  Send,
  LogIn,
  LogOut,
  UserPlus,
  Trash2,
  Edit3,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Target,
  Sparkles
} from 'lucide-react';
import { Loading } from './ui/loading';
import { EmptyState } from './ui/empty-state';

interface Activity {
  id: string;
  timestamp: string;
  user_id: string;
  username: string;
  user_role: 'Admin' | 'Writer' | 'View';
  action_type: 'login' | 'logout' | 'scan_create' | 'scan_complete' | 'article_generate' | 'article_edit' | 'article_publish' | 'article_save' | 'config_change' | 'user_create' | 'user_delete' | 'ai_enhance' | 'system_error';
  action_description: string;
  target_type?: 'scan_job' | 'article' | 'user' | 'config' | 'system';
  target_id?: string;
  target_name?: string;
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    duration?: number;
    status?: 'success' | 'error' | 'warning';
    error_message?: string;
    changes?: Record<string, any>;
  };
}

const activityTypes = [
  { value: 'all', label: 'Tất cả hoạt động' },
  { value: 'login', label: 'Đăng nhập' },
  { value: 'logout', label: 'Đăng xuất' },
  { value: 'scan_create', label: 'Tạo job quét' },
  { value: 'scan_complete', label: 'Hoàn thành quét' },
  { value: 'article_generate', label: 'Tạo bài viết' },
  { value: 'article_edit', label: 'Chỉnh sửa bài viết' },
  { value: 'article_publish', label: 'Xuất bản bài viết' },
  { value: 'article_save', label: 'Lưu bài viết' },
  { value: 'ai_enhance', label: 'AI cải thiện' },
  { value: 'config_change', label: 'Thay đổi cấu hình' },
  { value: 'user_create', label: 'Tạo người dùng' },
  { value: 'user_delete', label: 'Xóa người dùng' },
  { value: 'system_error', label: 'Lỗi hệ thống' }
];

const getActivityIcon = (actionType: string) => {
  const iconMap = {
    login: LogIn,
    logout: LogOut,
    scan_create: Scan,
    scan_complete: CheckCircle,
    article_generate: FileText,
    article_edit: Edit3,
    article_publish: Globe,
    article_save: Save,
    ai_enhance: Sparkles,
    config_change: Settings,
    user_create: UserPlus,
    user_delete: Trash2,
    system_error: AlertCircle
  };
  return iconMap[actionType as keyof typeof iconMap] || Info;
};

const getActivityColor = (actionType: string, status?: string) => {
  if (status === 'error') return 'text-red-600 bg-red-50';
  if (status === 'warning') return 'text-yellow-600 bg-yellow-50';
  
  const colorMap = {
    login: 'text-green-600 bg-green-50',
    logout: 'text-gray-600 bg-gray-50',
    scan_create: 'text-blue-600 bg-blue-50',
    scan_complete: 'text-green-600 bg-green-50',
    article_generate: 'text-purple-600 bg-purple-50',
    article_edit: 'text-orange-600 bg-orange-50',
    article_publish: 'text-green-600 bg-green-50',
    article_save: 'text-blue-600 bg-blue-50',
    ai_enhance: 'text-indigo-600 bg-indigo-50',
    config_change: 'text-yellow-600 bg-yellow-50',
    user_create: 'text-green-600 bg-green-50',
    user_delete: 'text-red-600 bg-red-50',
    system_error: 'text-red-600 bg-red-50'
  };
  return colorMap[actionType as keyof typeof colorMap] || 'text-gray-600 bg-gray-50';
};

export const ActivityLog: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);

  const itemsPerPage = 15;

  // Mock data for demonstration
  const mockActivities: Activity[] = [
    {
      id: 'act_001',
      timestamp: '2025-10-08T09:30:00.123Z',
      user_id: 'user_lehien',
      username: 'lehien',
      user_role: 'Writer',
      action_type: 'article_publish',
      action_description: 'Đã xuất bản bài viết "Công nghệ AI đang thay đổi ngành giáo dục"',
      target_type: 'article',
      target_id: 'article-1',
      target_name: 'Công nghệ AI đang thay đổi ngành giáo dục như thế nào?',
      metadata: {
        ip_address: '192.168.1.100',
        status: 'success'
      }
    },
    {
      id: 'act_002',
      timestamp: '2025-10-08T09:15:00.456Z',
      user_id: 'user_lehien',
      username: 'lehien',
      user_role: 'Writer',
      action_type: 'ai_enhance',
      action_description: 'Đã sử dụng AI để cải thiện SEO cho bài viết',
      target_type: 'article',
      target_id: 'article-1',
      target_name: 'Công nghệ AI đang thay đổi ngành giáo dục như thế nào?',
      metadata: {
        ip_address: '192.168.1.100',
        status: 'success',
        duration: 2500
      }
    },
    {
      id: 'act_003',
      timestamp: '2025-10-08T08:45:00.789Z',
      user_id: 'user_phantd',
      username: 'phantd',
      user_role: 'Admin',
      action_type: 'scan_complete',
      action_description: 'Hoàn thành quét tin tức từ 5 nguồn với 12 bài viết mới',
      target_type: 'scan_job',
      target_id: '2025-10-08_084500_news',
      target_name: 'Quét tin tức sáng 08/10/2025',
      metadata: {
        ip_address: '192.168.1.101',
        status: 'success',
        duration: 180000
      }
    },
    {
      id: 'act_004',
      timestamp: '2025-10-08T08:30:00.123Z',
      user_id: 'user_lehien',
      username: 'lehien',
      user_role: 'Writer',
      action_type: 'login',
      action_description: 'Đăng nhập vào hệ thống',
      metadata: {
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0',
        status: 'success'
      }
    },
    {
      id: 'act_005',
      timestamp: '2025-10-08T08:00:00.456Z',
      user_id: 'user_phantd',
      username: 'phantd',
      user_role: 'Admin',
      action_type: 'scan_create',
      action_description: 'Tạo job quét tin tức tự động cho 5 nguồn',
      target_type: 'scan_job',
      target_id: '2025-10-08_084500_news',
      target_name: 'Quét tin tức sáng 08/10/2025',
      metadata: {
        ip_address: '192.168.1.101',
        status: 'success'
      }
    },
    {
      id: 'act_006',
      timestamp: '2025-10-07T18:30:00.789Z',
      user_id: 'user_lehien',
      username: 'lehien',
      user_role: 'Writer',
      action_type: 'article_generate',
      action_description: 'Tạo bài viết SEO từ tin tức về startup công nghệ',
      target_type: 'article',
      target_id: 'article-3',
      target_name: 'Startup Việt gọi vốn thành công 10 triệu USD',
      metadata: {
        ip_address: '192.168.1.100',
        status: 'success',
        duration: 4200
      }
    },
    {
      id: 'act_007',
      timestamp: '2025-10-07T17:45:00.123Z',
      user_id: 'user_phantd',
      username: 'phantd',
      user_role: 'Admin',
      action_type: 'config_change',
      action_description: 'Cập nhật cấu hình prompt AI cho bài viết quan điểm',
      target_type: 'config',
      target_id: 'ai_prompts',
      target_name: 'AI Writing Prompts',
      metadata: {
        ip_address: '192.168.1.101',
        status: 'success',
        changes: {
          opinion_prompt: 'Updated template for opinion articles'
        }
      }
    },
    {
      id: 'act_008',
      timestamp: '2025-10-07T16:20:00.456Z',
      user_id: 'user_viewonly',
      username: 'viewonly',
      user_role: 'View',
      action_type: 'login',
      action_description: 'Đăng nhập vào hệ thống',
      metadata: {
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/537.36',
        status: 'success'
      }
    },
    {
      id: 'act_009',
      timestamp: '2025-10-07T15:00:00.789Z',
      user_id: 'system',
      username: 'System',
      user_role: 'Admin',
      action_type: 'system_error',
      action_description: 'Lỗi kết nối API khi quét tin từ nguồn VnExpress',
      target_type: 'system',
      metadata: {
        status: 'error',
        error_message: 'Connection timeout after 30 seconds'
      }
    },
    {
      id: 'act_010',
      timestamp: '2025-10-07T14:30:00.123Z',
      user_id: 'user_phantd',
      username: 'phantd',
      user_role: 'Admin',
      action_type: 'user_create',
      action_description: 'Tạo tài khoản mới cho Writer "newwriter"',
      target_type: 'user',
      target_id: 'user_newwriter',
      target_name: 'newwriter',
      metadata: {
        ip_address: '192.168.1.101',
        status: 'success'
      }
    }
  ];

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      // In real implementation: GET /api/v1/activities
      setTimeout(() => {
        // Filter activities based on user role
        let filteredActivities = mockActivities;
        
        if (user?.role !== 'Admin') {
          // Non-admin users only see their own activities (and system activities for context)
          filteredActivities = mockActivities.filter(activity => 
            activity.username === user?.username || activity.user_id === 'system'
          );
        }
        
        setActivities(filteredActivities);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error('Không thể tải lịch sử hoạt động');
      setIsLoading(false);
    }
  };

  const exportActivities = async () => {
    try {
      // In real implementation: POST /api/v1/activities/export
      const filteredData = getFilteredActivities();
      const csvContent = [
        ['Thời gian', 'Người dùng', 'Vai trò', 'Hoạt động', 'Mô tả', 'Trạng thái'].join(','),
        ...filteredData.map(activity => [
          formatDate(activity.timestamp),
          activity.username,
          activity.user_role,
          activityTypes.find(t => t.value === activity.action_type)?.label || activity.action_type,
          activity.action_description,
          activity.metadata?.status || 'success'
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Đã xuất file CSV thành công');
    } catch (error) {
      toast.error('Không thể xuất dữ liệu');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (milliseconds: number) => {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
    return `${(milliseconds / 60000).toFixed(1)}m`;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffMs = now.getTime() - activityDate.getTime();
    
    if (diffMs < 60000) return 'Vừa xong';
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} phút trước`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)} giờ trước`;
    return `${Math.floor(diffMs / 86400000)} ngày trước`;
  };

  const getFilteredActivities = () => {
    return activities.filter(activity => {
      const matchesSearch = 
        activity.action_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.target_name && activity.target_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = activityTypeFilter === 'all' || activity.action_type === activityTypeFilter;
      const matchesUser = userFilter === 'all' || activity.username === userFilter;
      
      const activityDate = new Date(activity.timestamp);
      const matchesDateRange = 
        (!dateRange.from || activityDate >= dateRange.from) &&
        (!dateRange.to || activityDate <= dateRange.to);
      
      return matchesSearch && matchesType && matchesUser && matchesDateRange;
    });
  };

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(activities.map(a => a.username)))
    .filter(username => user?.role === 'Admin' || username === user?.username || username === 'System');

  const filteredActivities = getFilteredActivities();
  const paginatedActivities = filteredActivities.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lịch sử hoạt động</h1>
          <p className="text-slate-600 mt-1">
            {user?.role === 'Admin' 
              ? 'Theo dõi tất cả hoạt động của hệ thống và người dùng'
              : 'Theo dõi hoạt động cá nhân của bạn'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredActivities.length} hoạt động
          </Badge>
          <Button
            variant="outline"
            onClick={exportActivities}
            disabled={filteredActivities.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất CSV
          </Button>
          <Button
            variant="outline"
            onClick={fetchActivities}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm hoạt động..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Activity Type Filter */}
            <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Loại hoạt động" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* User Filter */}
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Người dùng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả người dùng</SelectItem>
                {uniqueUsers.map((username) => (
                  <SelectItem key={username} value={username}>
                    {username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      `${dateRange.from.toLocaleDateString('vi-VN')} - ${dateRange.to.toLocaleDateString('vi-VN')}`
                    ) : (
                      dateRange.from.toLocaleDateString('vi-VN')
                    )
                  ) : (
                    'Chọn ngày'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || {})}
                  numberOfMonths={2}
                />
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateRange({});
                      setShowCalendar(false);
                    }}
                    className="w-full"
                  >
                    Xóa bộ lọc ngày
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timeline hoạt động
          </CardTitle>
          <CardDescription>
            Hiển thị {paginatedActivities.length} trên tổng {filteredActivities.length} hoạt động
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải lịch sử hoạt động...</p>
              </div>
            </div>
          ) : paginatedActivities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Không có hoạt động nào
              </h3>
              <p className="text-muted-foreground">
                Không tìm thấy hoạt động nào phù hợp với bộ lọc hiện tại
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline Container */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                
                {/* Activities */}
                <div className="space-y-6">
                  {paginatedActivities.map((activity, index) => {
                    const Icon = getActivityIcon(activity.action_type);
                    const colorClass = getActivityColor(activity.action_type, activity.metadata?.status);
                    
                    return (
                      <div key={activity.id} className="relative flex items-start gap-4">
                        {/* Timeline Dot */}
                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        {/* Activity Content */}
                        <div className="flex-1 min-w-0">
                          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-slate-900">
                                    {activity.action_description}
                                  </h4>
                                  {activity.metadata?.status && activity.metadata.status !== 'success' && (
                                    <Badge 
                                      variant={activity.metadata.status === 'error' ? 'destructive' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {activity.metadata.status === 'error' ? 'Lỗi' : 'Cảnh báo'}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span className="font-medium">{activity.username}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {activity.user_role}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDate(activity.timestamp)}</span>
                                  </div>
                                  
                                  <span className="text-slate-500">
                                    {getTimeAgo(activity.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Target Information */}
                            {activity.target_name && (
                              <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                                <span className="text-slate-600">Đối tượng: </span>
                                <span className="font-medium text-slate-900">{activity.target_name}</span>
                                {activity.target_id && (
                                  <span className="text-slate-500 ml-2">({activity.target_id})</span>
                                )}
                              </div>
                            )}
                            
                            {/* Metadata */}
                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                              {activity.metadata?.ip_address && (
                                <span>IP: {activity.metadata.ip_address}</span>
                              )}
                              {activity.metadata?.duration && (
                                <span>Thời gian: {formatDuration(activity.metadata.duration)}</span>
                              )}
                              {activity.metadata?.error_message && (
                                <span className="text-red-600">Lỗi: {activity.metadata.error_message}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center pt-6 border-t">
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
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(0, currentPage - 2) + i;
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
    </div>
  );
};