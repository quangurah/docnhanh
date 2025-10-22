import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  Save, 
  RefreshCw, 
  Settings, 
  Key, 
  BarChart3, 
  Globe, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Zap,
  Activity,
  TrendingUp,
  Download
} from 'lucide-react';

interface APIUsage {
  service: string;
  current_usage: number;
  monthly_limit: number;
  cost_current: number;
  cost_limit: number;
  last_used: string;
  status: 'active' | 'warning' | 'over_limit';
}

interface UsageLog {
  timestamp: string;
  service: string;
  operation: string;
  tokens_used: number;
  cost: number;
  success: boolean;
}

export const Configuration: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('api-keys');

  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    apify_token: '',
    openai_token: '',
    gemini_token: ''
  });
  const [showKeys, setShowKeys] = useState({
    apify_token: false,
    openai_token: false,
    gemini_token: false
  });

  // Usage data state
  const [usageData, setUsageData] = useState<APIUsage[]>([]);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');

  // AI Prompts state
  const [aiPrompts, setAiPrompts] = useState({
    seo_article: '',
    opinion_article: '',
    news_article: ''
  });

  // Sources configuration state
  const [sourceConfig, setSourceConfig] = useState({
    websites: '',
    social: '',
    keywords: ''
  });

  useEffect(() => {
    fetchConfiguration();
    fetchUsageData();
  }, []);

  const fetchConfiguration = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      const mockConfig = {
        api_keys: {
          apify_token: 'apify_api_*****************************abc123',
          openai_token: 'sk-*****************************def456',
          gemini_token: 'AI*****************************ghi789'
        },
        ai_prompts: {
          seo_article: 'Bạn là một chuyên gia SEO và content marketing chuyên nghiệp. Hãy viết một bài viết tối ưu SEO dựa trên tin tức được cung cấp...',
          opinion_article: 'Bạn là một nhà báo có kinh nghiệm và chuyên gia phân tích. Hãy viết một bài viết quan điểm chuyên sâu dựa trên tin tức...',
          news_article: 'Bạn là một phóng viên chuyên nghiệp. Hãy viết lại tin tức một cách khách quan và chính xác...'
        },
        sources: {
          websites: 'https://vnexpress.net\nhttps://dantri.com.vn\nhttps://tuoitre.vn\nhttps://thanhnien.vn',
          social: 'https://facebook.com/vnexpress\nhttps://facebook.com/dantridotcomvn',
          keywords: 'AI, công nghệ, startup, đầu tư, blockchain, fintech'
        }
      };

      setApiKeys(mockConfig.api_keys);
      setAiPrompts(mockConfig.ai_prompts);
      setSourceConfig(mockConfig.sources);
    } catch (error) {
      toast.error('Lỗi khi tải cấu hình');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsageData = async () => {
    try {
      // Mock usage data
      const mockUsageData: APIUsage[] = [
        {
          service: 'OpenAI GPT-4',
          current_usage: 75000,
          monthly_limit: 100000,
          cost_current: 37.50,
          cost_limit: 50.00,
          last_used: '2025-10-08T20:30:00.000Z',
          status: 'active'
        },
        {
          service: 'Google Gemini Pro',
          current_usage: 45000,
          monthly_limit: 80000,
          cost_current: 22.50,
          cost_limit: 40.00,
          last_used: '2025-10-08T19:45:00.000Z',
          status: 'active'
        },
        {
          service: 'Apify Facebook Scraper',
          current_usage: 2800,
          monthly_limit: 3000,
          cost_current: 28.00,
          cost_limit: 30.00,
          last_used: '2025-10-08T18:15:00.000Z',
          status: 'warning'
        }
      ];

      const mockUsageLogs: UsageLog[] = [
        {
          timestamp: '2025-10-08T20:30:15.123Z',
          service: 'OpenAI GPT-4',
          operation: 'Article Generation (SEO)',
          tokens_used: 3500,
          cost: 0.175,
          success: true
        },
        {
          timestamp: '2025-10-08T20:28:45.456Z',
          service: 'Google Gemini Pro',
          operation: 'Content Enhancement',
          tokens_used: 2200,
          cost: 0.055,
          success: true
        },
        {
          timestamp: '2025-10-08T19:45:30.789Z',
          service: 'Apify Facebook Scraper',
          operation: 'Social Media Scan',
          tokens_used: 150,
          cost: 1.50,
          success: true
        },
        {
          timestamp: '2025-10-08T19:30:22.012Z',
          service: 'OpenAI GPT-4',
          operation: 'Article Generation (Opinion)',
          tokens_used: 4200,
          cost: 0.210,
          success: false
        }
      ];

      setUsageData(mockUsageData);
      setUsageLogs(mockUsageLogs);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu sử dụng');
    }
  };

  const saveApiKeys = async () => {
    try {
      // Mock API call
      toast.success('Đã lưu API tokens thành công');
    } catch (error) {
      toast.error('Lỗi khi lưu API tokens');
    }
  };

  const saveAiPrompts = async () => {
    try {
      // Mock API call
      toast.success('Đã lưu AI prompts thành công');
    } catch (error) {
      toast.error('Lỗi khi lưu AI prompts');
    }
  };

  const saveSourceConfig = async () => {
    try {
      // Mock API call
      toast.success('Đã lưu cấu hình nguồn thành công');
    } catch (error) {
      toast.error('Lỗi khi lưu cấu hình nguồn');
    }
  };

  const exportUsageLogs = () => {
    const csvContent = [
      ['Thời gian', 'Dịch vụ', 'Thao tác', 'Tokens sử dụng', 'Chi phí', 'Trạng thái'],
      ...usageLogs.map(log => [
        new Date(log.timestamp).toLocaleString('vi-VN'),
        log.service,
        log.operation,
        log.tokens_used.toString(),
        `$${log.cost.toFixed(3)}`,
        log.success ? 'Thành công' : 'Thất bại'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usage_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const toggleKeyVisibility = (keyType: keyof typeof showKeys) => {
    setShowKeys(prev => ({
      ...prev,
      [keyType]: !prev[keyType]
    }));
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'over_limit': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'over_limit': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Check if user is admin
  if (user?.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-muted-foreground">Chỉ quản trị viên mới có thể truy cập trang cấu hình.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Cấu hình hệ thống</h1>
        <p className="text-slate-600 mt-1">
          Quản lý API tokens, cấu hình AI và theo dõi usage
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Usage & Billing
          </TabsTrigger>
          <TabsTrigger value="ai-prompts" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI Prompts
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Nguồn tin
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Quản lý API Tokens
              </CardTitle>
              <CardDescription>
                Cấu hình các token API cho các dịch vụ bên ngoài
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Apify Token */}
              <div className="space-y-2">
                <Label htmlFor="apify-token">Apify Token (Facebook Scraping)</Label>
                <div className="flex gap-2">
                  <Input
                    id="apify-token"
                    type={showKeys.apify_token ? "text" : "password"}
                    value={showKeys.apify_token ? apiKeys.apify_token : maskApiKey(apiKeys.apify_token)}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, apify_token: e.target.value }))}
                    placeholder="Nhập Apify API token"
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleKeyVisibility('apify_token')}
                  >
                    {showKeys.apify_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Token cho Apify Facebook scraper. Lấy từ{' '}
                  <a href="https://console.apify.com/account/integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Apify Console
                  </a>
                </p>
              </div>

              {/* OpenAI Token */}
              <div className="space-y-2">
                <Label htmlFor="openai-token">OpenAI API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="openai-token"
                    type={showKeys.openai_token ? "text" : "password"}
                    value={showKeys.openai_token ? apiKeys.openai_token : maskApiKey(apiKeys.openai_token)}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, openai_token: e.target.value }))}
                    placeholder="Nhập OpenAI API key"
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleKeyVisibility('openai_token')}
                  >
                    {showKeys.openai_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  API key cho OpenAI GPT models. Lấy từ{' '}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    OpenAI Platform
                  </a>
                </p>
              </div>

              {/* Gemini Token */}
              <div className="space-y-2">
                <Label htmlFor="gemini-token">Google Gemini API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="gemini-token"
                    type={showKeys.gemini_token ? "text" : "password"}
                    value={showKeys.gemini_token ? apiKeys.gemini_token : maskApiKey(apiKeys.gemini_token)}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, gemini_token: e.target.value }))}
                    placeholder="Nhập Gemini API key"
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleKeyVisibility('gemini_token')}
                  >
                    {showKeys.gemini_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  API key cho Google Gemini AI. Lấy từ{' '}
                  <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Google AI Studio
                  </a>
                </p>
              </div>

              <Button onClick={saveApiKeys} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Lưu API Tokens
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage & Billing Tab */}
        <TabsContent value="usage" className="space-y-6">
          {/* Usage Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {usageData.map((usage, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{usage.service}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(usage.status)}>
                      {getStatusIcon(usage.status)}
                      <span className="ml-1 capitalize">{usage.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sử dụng</span>
                      <span>{usage.current_usage.toLocaleString()} / {usage.monthly_limit.toLocaleString()}</span>
                    </div>
                    <Progress value={(usage.current_usage / usage.monthly_limit) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Chi phí</span>
                      <span>${usage.cost_current.toFixed(2)} / ${usage.cost_limit.toFixed(2)}</span>
                    </div>
                    <Progress value={(usage.cost_current / usage.cost_limit) * 100} className="h-2" />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Sử dụng lần cuối: {new Date(usage.last_used).toLocaleString('vi-VN')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Usage Logs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Lịch sử sử dụng API
                  </CardTitle>
                  <CardDescription>
                    Chi tiết các lần gọi API và chi phí phát sinh
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={exportUsageLogs}>
                    <Download className="w-4 h-4 mr-2" />
                    Xuất CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchUsageData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Làm mới
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Thao tác</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Chi phí</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell>{log.service}</TableCell>
                      <TableCell>{log.operation}</TableCell>
                      <TableCell className="text-right font-mono">
                        {log.tokens_used.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${log.cost.toFixed(3)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.success ? "default" : "destructive"} className="text-xs">
                          {log.success ? 'Thành công' : 'Thất bại'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Prompts Tab */}
        <TabsContent value="ai-prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Cấu hình AI Prompts
              </CardTitle>
              <CardDescription>
                Tùy chỉnh prompts cho các loại bài viết khác nhau
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="seo-prompt">Prompt cho bài viết SEO</Label>
                <Textarea
                  id="seo-prompt"
                  value={aiPrompts.seo_article}
                  onChange={(e) => setAiPrompts(prev => ({ ...prev, seo_article: e.target.value }))}
                  rows={6}
                  placeholder="Nhập prompt cho bài viết SEO..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opinion-prompt">Prompt cho bài viết quan điểm</Label>
                <Textarea
                  id="opinion-prompt"
                  value={aiPrompts.opinion_article}
                  onChange={(e) => setAiPrompts(prev => ({ ...prev, opinion_article: e.target.value }))}
                  rows={6}
                  placeholder="Nhập prompt cho bài viết quan điểm..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="news-prompt">Prompt cho bài viết tin tức</Label>
                <Textarea
                  id="news-prompt"
                  value={aiPrompts.news_article}
                  onChange={(e) => setAiPrompts(prev => ({ ...prev, news_article: e.target.value }))}
                  rows={6}
                  placeholder="Nhập prompt cho bài viết tin tức..."
                />
              </div>

              <Button onClick={saveAiPrompts} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Lưu AI Prompts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Cấu hình nguồn tin
              </CardTitle>
              <CardDescription>
                Quản lý danh sách websites, mạng xã hội và từ khóa theo dõi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="websites">Danh sách websites</Label>
                <Textarea
                  id="websites"
                  value={sourceConfig.websites}
                  onChange={(e) => setSourceConfig(prev => ({ ...prev, websites: e.target.value }))}
                  rows={6}
                  placeholder="Mỗi URL một dòng..."
                />
                <p className="text-sm text-muted-foreground">
                  Danh sách các trang tin tức để quét nội dung, mỗi URL một dòng
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="social">Danh sách mạng xã hội</Label>
                <Textarea
                  id="social"
                  value={sourceConfig.social}
                  onChange={(e) => setSourceConfig(prev => ({ ...prev, social: e.target.value }))}
                  rows={4}
                  placeholder="Facebook pages, Twitter accounts..."
                />
                <p className="text-sm text-muted-foreground">
                  Danh sách các trang mạng xã hội để theo dõi
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Từ khóa theo dõi</Label>
                <Textarea
                  id="keywords"
                  value={sourceConfig.keywords}
                  onChange={(e) => setSourceConfig(prev => ({ ...prev, keywords: e.target.value }))}
                  rows={3}
                  placeholder="AI, công nghệ, startup..."
                />
                <p className="text-sm text-muted-foreground">
                  Các từ khóa quan trọng để lọc và ưu tiên nội dung
                </p>
              </div>

              <Button onClick={saveSourceConfig} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Lưu cấu hình nguồn
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};