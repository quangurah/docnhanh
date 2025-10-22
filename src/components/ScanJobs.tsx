import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ScanProgress } from './ScanProgress';
import { VnExpressResults } from './VnExpressResults';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Input } from './ui/input';
import { 
  Search, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Eye,
  Calendar,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Share2,
  TrendingUp,
  Activity,
  Target,
  Users,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts';

// Mock data for dashboard
const todayStats = {
  totalArticles: 1247,
  newsArticles: 892,
  socialArticles: 355,
  activeSources: 24,
  sentimentData: [
    { name: 'Tích cực', value: 45, color: '#10b981' },
    { name: 'Trung tính', value: 38, color: '#6b7280' },
    { name: 'Tiêu cực', value: 17, color: '#ef4444' }
  ],
  hourlyData: [
    { hour: '00:00', news: 12, social: 5 },
    { hour: '01:00', news: 8, social: 3 },
    { hour: '02:00', news: 6, social: 2 },
    { hour: '03:00', news: 4, social: 1 },
    { hour: '04:00', news: 7, social: 2 },
    { hour: '05:00', news: 15, social: 8 },
    { hour: '06:00', news: 45, social: 12 },
    { hour: '07:00', news: 78, social: 25 },
    { hour: '08:00', news: 112, social: 38 },
    { hour: '09:00', news: 95, social: 42 },
    { hour: '10:00', news: 87, social: 35 },
    { hour: '11:00', news: 76, social: 28 },
    { hour: '12:00', news: 82, social: 31 },
    { hour: '13:00', news: 68, social: 24 },
    { hour: '14:00', news: 72, social: 29 },
    { hour: '15:00', news: 65, social: 22 },
    { hour: '16:00', news: 58, social: 18 },
    { hour: '17:00', news: 42, social: 15 },
    { hour: '18:00', news: 35, social: 12 },
    { hour: '19:00', news: 28, social: 9 },
    { hour: '20:00', news: 22, social: 7 },
    { hour: '21:00', news: 18, social: 5 },
    { hour: '22:00', news: 14, social: 4 },
    { hour: '23:00', news: 11, social: 3 }
  ],
  sourceTypeData: [
    { name: 'Báo chí', value: 892, color: '#2563eb' },
    { name: 'Mạng xã hội', value: 355, color: '#7c3aed' }
  ]
};

const mockJobs = {
  news: [
    {
      id: '1',
      name: 'Tin tức kinh tế hàng ngày',
      description: 'Quét tin tức kinh tế từ các báo uy tín',
      status: 'running',
      created_at: '2024-01-15T09:00:00Z',
      last_run: '2024-01-15T14:30:00Z',
      next_run: '2024-01-16T09:00:00Z',
      total_articles: 156,
      sources: ['VnExpress', 'Tuổi Trẻ', 'Thanh Niên']
    },
    {
      id: '2',
      name: 'Tin tức công nghệ',
      description: 'Theo dõi tin tức công nghệ mới nhất',
      status: 'stopped',
      created_at: '2024-01-10T08:00:00Z',
      last_run: '2024-01-14T16:00:00Z',
      next_run: null,
      total_articles: 89,
      sources: ['VnExpress Số hóa', 'ICTNews']
    }
  ],
  social: [
    {
      id: '3',
      name: 'Facebook Brand Monitoring',
      description: 'Theo dõi mentions thương hiệu trên Facebook',
      status: 'running',
      created_at: '2024-01-12T10:00:00Z',
      last_run: '2024-01-15T15:00:00Z',
      next_run: '2024-01-15T16:00:00Z',
      total_articles: 234,
      sources: ['Facebook Pages', 'Facebook Groups']
    },
    {
      id: '4',
      name: 'Instagram Hashtag Tracking',
      description: 'Theo dõi hashtag #marketing #digital',
      status: 'running',
      created_at: '2024-01-08T11:00:00Z',
      last_run: '2024-01-15T14:45:00Z',
      next_run: '2024-01-15T17:00:00Z',
      total_articles: 67,
      sources: ['Instagram Posts', 'Instagram Stories']
    }
  ]
};

const mockScanResults = [
  {
    id: '1',
    title: 'VN-Index tăng điểm trong phiên chiều',
    url: 'https://vnexpress.net/vn-index-tang-diem-trong-phien-chieu-4567890.html',
    source: 'VnExpress',
    published_at: '2024-01-15T14:30:00Z',
    content_preview: 'Chỉ số VN-Index đã tăng 0.8% trong phiên giao dịch chiều nay...',
    keywords: ['chứng khoán', 'VN-Index', 'tăng điểm'],
    sentiment: 'positive'
  },
  {
    id: '2',
    title: 'Lạm phát tháng 1 ước tính tăng 0.2%',
    url: 'https://tuoitre.vn/lam-phat-thang-1-uoc-tinh-tang-02-4567891.html',
    source: 'Tuổi Trẻ',
    published_at: '2024-01-15T13:15:00Z',
    content_preview: 'Tổng cục Thống kê vừa công bố chỉ số giá tiêu dùng tháng 1...',
    keywords: ['lạm phát', 'CPI', 'kinh tế'],
    sentiment: 'neutral'
  },
  {
    id: '3',
    title: 'Doanh nghiệp công nghệ tăng trưởng mạnh',
    url: 'https://thanhnien.vn/doanh-nghiep-cong-nghe-tang-truong-manh-4567892.html',
    source: 'Thanh Niên',
    published_at: '2024-01-15T12:00:00Z',
    content_preview: 'Các doanh nghiệp công nghệ Việt Nam ghi nhận tăng trưởng...',
    keywords: ['công nghệ', 'doanh nghiệp', 'tăng trưởng'],
    sentiment: 'positive'
  }
];

export const ScanJobs: React.FC = () => {
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailPage, setDetailPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('news');
  const [scanConfirmOpen, setScanConfirmOpen] = useState(false);
  const [scanType, setScanType] = useState<'news' | 'social'>('news');
  const [chartsExpanded, setChartsExpanded] = useState(true);
  const [activeScan, setActiveScan] = useState<{id: string, type: 'news' | 'social'} | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  
  const itemsPerPage = 5;
  const detailItemsPerPage = 10;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200';
      case 'stopped': return 'bg-red-100 text-red-800 border-red-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Đang chạy';
      case 'stopped': return 'Đã dừng';
      case 'paused': return 'Tạm dừng';
      default: return 'Không xác định';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'Tích cực';
      case 'negative': return 'Tiêu cực';
      case 'neutral': return 'Trung tính';
      default: return 'Không xác định';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const filterJobs = (jobs: any[]) => {
    return jobs.filter(job => {
      const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const getCurrentJobs = () => {
    const jobs = activeTab === 'news' ? mockJobs.news : mockJobs.social;
    const filtered = filterJobs(jobs);
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = () => {
    const jobs = activeTab === 'news' ? mockJobs.news : mockJobs.social;
    const filtered = filterJobs(jobs);
    return Math.ceil(filtered.length / itemsPerPage);
  };

  const getCurrentResults = () => {
    const startIndex = (detailPage - 1) * detailItemsPerPage;
    return mockScanResults.slice(startIndex, startIndex + detailItemsPerPage);
  };

  const getDetailTotalPages = () => {
    return Math.ceil(mockScanResults.length / detailItemsPerPage);
  };

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setDetailPage(1);
    setDialogOpen(true);
  };

  const handleStartScan = (type: 'news' | 'social') => {
    setScanType(type);
    setScanConfirmOpen(true);
  };

  const confirmStartScan = async () => {
    try {
      console.log(`Starting ${scanType} scan...`);
      
      // Import API client
      const { ApiClient, handleApiError } = await import('../utils/apiConfig');
      
      // Check API health first
      const isHealthy = await ApiClient.checkHealth();
      if (!isHealthy) {
        toast.error('API server không khả dụng. Vui lòng thử lại sau.');
        setScanConfirmOpen(false);
        return;
      }
      
      // Start scan based on type
      if (scanType === 'news') {
        // Import VnExpress scraper
        const { VnExpressScraper } = await import('../utils/vnexpressScraper');
        
        // Start VnExpress scraping with enhanced timeout
        const result = await VnExpressScraper.scrapeVnExpress({
          categories: ['kinh-doanh', 'the-gioi', 'the-thao', 'giai-tri'],
          maxArticles: 50,
          keywords: ['AI', 'công nghệ', 'startup', 'đầu tư'],
          timeout: 120000 // 2 phút
        });
        
        // Lưu kết quả để hiển thị
        setScanResult(result);
        
        if (result.success) {
          toast.success(`Đã quét thành công ${result.totalFound} bài viết từ VnExpress!`);
        } else {
          toast.warning(`Quét hoàn thành với ${result.errors.length} lỗi. Tìm thấy ${result.totalFound} bài viết.`);
        }
      } else {
        // Social media scan
        toast.success('Đã bắt đầu quét mạng xã hội thành công!');
      }
      
      setScanConfirmOpen(false);
      
      // Start progress tracking
      const scanId = `scan_${Date.now()}`;
      setActiveScan({ id: scanId, type: scanType });
      
    } catch (error) {
      console.error('Scan start error:', error);
      const errorMessage = handleApiError(error);
      toast.error(`Lỗi khi bắt đầu quét: ${errorMessage}`);
    }
  };

  const canManage = user?.role === 'Admin' || user?.role === 'Writer';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Tác vụ Quét</h1>
          <p className="text-slate-600 mt-1">
            Theo dõi và quản lý các tác vụ quét tin tức và mạng xã hội
          </p>
        </div>
        {canManage && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Tạo tác vụ mới
          </Button>
        )}
      </div>

      {/* Scan Results */}
      {scanResult && (
        <div className="mb-6">
          <VnExpressResults 
            result={scanResult} 
            onClose={() => setScanResult(null)}
          />
        </div>
      )}

      {/* Active Scan Progress */}
      {activeScan && !scanResult && (
        <div className="mb-6">
          <ScanProgress
            scanId={activeScan.id}
            scanType={activeScan.type}
            onComplete={() => {
              setActiveScan(null);
              toast.success('Quét hoàn thành thành công!');
              // Refresh data here
            }}
            onError={(error) => {
              toast.error(`Lỗi quét: ${error}`);
              // Keep scan active for retry
            }}
          />
        </div>
      )}

      {/* Quick Start Scan Buttons */}
      {canManage && !activeScan && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Bắt đầu quét nhanh</h2>
            <p className="text-slate-600">Khởi động tác vụ quét tin tức hoặc mạng xã hội ngay lập tức</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* News Scan Button */}
            <div className="group">
              <button
                onClick={() => handleStartScan('news')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                          text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 
                          transition-all duration-200 border-2 border-blue-500 hover:border-blue-400"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white/20 rounded-full">
                    <Newspaper className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Quét Báo chí</h3>
                    <p className="text-blue-100 text-sm">
                      Bắt đầu quét tin tức từ các báo điện tử uy tín
                    </p>
                  </div>
                  <div className="flex items-center text-blue-200 text-sm">
                    <Play className="w-4 h-4 mr-2" />
                    Bắt đầu ngay
                  </div>
                </div>
              </button>
            </div>

            {/* Social Media Scan Button */}
            <div className="group">
              <button
                onClick={() => handleStartScan('social')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 
                          text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 
                          transition-all duration-200 border-2 border-purple-500 hover:border-purple-400"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white/20 rounded-full">
                    <Share2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Quét Mạng xã hội</h3>
                    <p className="text-purple-100 text-sm">
                      Thu thập dữ liệu từ Facebook, Instagram, Twitter
                    </p>
                  </div>
                  <div className="flex items-center text-purple-200 text-sm">
                    <Play className="w-4 h-4 mr-2" />
                    Bắt đầu ngay
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">892</p>
              <p className="text-sm text-slate-600">Tin báo chí hôm nay</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">355</p>
              <p className="text-sm text-slate-600">Tin MXH hôm nay</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">24</p>
              <p className="text-sm text-slate-600">Nguồn hoạt động</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">1,247</p>
              <p className="text-sm text-slate-600">Tổng tin hôm nay</p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Stats */}
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Tổng tin đã quét hôm nay</p>
                  <p className="text-2xl font-bold text-slate-900">{todayStats.totalArticles.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Tin báo chí</p>
                  <p className="text-2xl font-bold text-slate-900">{todayStats.newsArticles.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Newspaper className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Tin mạng xã hội</p>
                  <p className="text-2xl font-bold text-slate-900">{todayStats.socialArticles.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Share2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Nguồn tin hoạt động</p>
                  <p className="text-2xl font-bold text-slate-900">{todayStats.activeSources}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section Header */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Biểu đồ thống kê</h3>
              <p className="text-sm text-slate-600">Phân tích dữ liệu quét chi tiết</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChartsExpanded(!chartsExpanded)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            {chartsExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Mở rộng
              </>
            )}
          </Button>
        </div>

        {/* Charts */}
        {chartsExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-5 duration-300">
          {/* Hourly Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Xu hướng quét theo giờ
              </CardTitle>
              <CardDescription>
                Số lượng tin tức được quét theo từng giờ trong ngày
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={todayStats.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => value.slice(0, 2)}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="news" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="Báo chí"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="social" 
                      stroke="#7c3aed" 
                      strokeWidth={2}
                      name="Mạng xã hội"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Source Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Phân bố theo loại nguồn
              </CardTitle>
              <CardDescription>
                Tỷ lệ tin tức từ báo chí và mạng xã hội
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={todayStats.sourceTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {todayStats.sourceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {todayStats.sourceTypeData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-slate-600">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Phân tích cảm xúc
              </CardTitle>
              <CardDescription>
                Tỷ lệ sentiment của các tin tức đã quét
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={todayStats.sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {todayStats.sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value}%`, 'Tỷ lệ']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {todayStats.sentimentData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-slate-600">
                      {entry.name}: {entry.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                So sánh nguồn tin
              </CardTitle>
              <CardDescription>
                Biểu đồ so sánh số lượng tin từ báo chí và mạng xã hội
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Báo chí', value: todayStats.newsArticles, color: '#2563eb' },
                    { name: 'Mạng xã hội', value: todayStats.socialArticles, color: '#7c3aed' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm tác vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="running">Đang chạy</SelectItem>
            <SelectItem value="stopped">Đã dừng</SelectItem>
            <SelectItem value="paused">Tạm dừng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for scan types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            Quét Báo chí
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Quét Mạng xã hội
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-4">
          {getCurrentJobs().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Newspaper className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-slate-500 text-center">
                  Không tìm thấy tác vụ quét báo chí nào
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {getCurrentJobs().map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {job.name}
                          <Badge className={getStatusColor(job.status)}>
                            {getStatusText(job.status)}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {job.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(job)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem chi tiết
                        </Button>
                        {canManage && (
                          <>
                            {job.status === 'running' ? (
                              <Button variant="outline" size="sm">
                                <Pause className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Tổng bài viết</p>
                        <p className="font-semibold text-blue-600">{job.total_articles}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Nguồn tin</p>
                        <p className="font-semibold">{job.sources.length} nguồn</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Tạo lúc</p>
                        <p className="font-semibold">{formatDate(job.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Chạy lần cuối</p>
                        <p className="font-semibold">
                          {job.last_run ? formatDate(job.last_run) : 'Chưa chạy'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          {getCurrentJobs().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Share2 className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-slate-500 text-center">
                  Không tìm thấy tác vụ quét mạng xã hội nào
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {getCurrentJobs().map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {job.name}
                          <Badge className={getStatusColor(job.status)}>
                            {getStatusText(job.status)}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {job.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(job)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem chi tiết
                        </Button>
                        {canManage && (
                          <>
                            {job.status === 'running' ? (
                              <Button variant="outline" size="sm">
                                <Pause className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Tổng bài viết</p>
                        <p className="font-semibold text-blue-600">{job.total_articles}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Nguồn tin</p>
                        <p className="font-semibold">{job.sources.length} nguồn</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Tạo lúc</p>
                        <p className="font-semibold">{formatDate(job.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Chạy lần cuối</p>
                        <p className="font-semibold">
                          {job.last_run ? formatDate(job.last_run) : 'Chưa chạy'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {getTotalPages() > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-600">
            Trang {currentPage} / {getTotalPages()}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
              disabled={currentPage === getTotalPages()}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Job Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Chi tiết tác vụ quét: {selectedJob?.name}
            </DialogTitle>
            <DialogDescription>
              Danh sách kết quả quét từ tác vụ "{selectedJob?.name}"
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-4">
              {/* Job Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-500">Trạng thái</p>
                  <Badge className={getStatusColor(selectedJob.status)}>
                    {getStatusText(selectedJob.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tổng bài viết</p>
                  <p className="font-semibold text-blue-600">{selectedJob.total_articles}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Nguồn tin</p>
                  <p className="font-semibold">{selectedJob.sources.join(', ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Lần cuối chạy</p>
                  <p className="font-semibold text-sm">
                    {selectedJob.last_run ? formatDate(selectedJob.last_run) : 'Chưa chạy'}
                  </p>
                </div>
              </div>

              {/* Results Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Nguồn</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentResults().map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{result.title}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {result.content_preview}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.keywords.map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{result.source}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{formatDate(result.published_at)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSentimentColor(result.sentiment)}>
                            {getSentimentText(result.sentiment)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(result.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Results Pagination */}
              {getDetailTotalPages() > 1 && (
                <div className="flex justify-between items-center pt-4">
                  <p className="text-sm text-slate-600">
                    Trang {detailPage} / {getDetailTotalPages()} 
                    ({mockScanResults.length} kết quả)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailPage(prev => Math.max(1, prev - 1))}
                      disabled={detailPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailPage(prev => Math.min(getDetailTotalPages(), prev + 1))}
                      disabled={detailPage === getDetailTotalPages()}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scan Confirmation Dialog */}
      <AlertDialog open={scanConfirmOpen} onOpenChange={setScanConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {scanType === 'news' ? (
                <>
                  <Newspaper className="w-5 h-5 text-blue-600" />
                  Xác nhận quét báo chí
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5 text-purple-600" />
                  Xác nhận quét mạng xã hội
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Bạn có chắc chắn muốn bắt đầu tác vụ quét {scanType === 'news' ? 'báo chí' : 'mạng xã hội'} ngay bây giờ?
              </p>
              
              {scanType === 'news' ? (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Quét báo chí sẽ bao gồm:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-1 ml-4 space-y-1">
                    <li>• VnExpress, Tuổi Trẻ, Thanh Niên</li>
                    <li>• Các báo kinh tế, công nghệ</li>
                    <li>• Ước tính: 200-300 bài viết/giờ</li>
                  </ul>
                </div>
              ) : (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800">
                    <strong>Quét mạng xã hội sẽ bao gồm:</strong>
                  </p>
                  <ul className="text-sm text-purple-700 mt-1 ml-4 space-y-1">
                    <li>• Facebook Pages & Groups</li>
                    <li>• Instagram Posts & Stories</li>
                    <li>• Ước tính: 100-150 posts/giờ</li>
                  </ul>
                </div>
              )}

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Lưu ý:</strong> Tác vụ quét sẽ chạy liên tục cho đến khi bạn dừng lại.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStartScan}
              className={scanType === 'news' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-purple-600 hover:bg-purple-700'
              }
            >
              <Play className="w-4 h-4 mr-2" />
              Bắt đầu quét
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};