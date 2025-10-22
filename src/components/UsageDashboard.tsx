import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Calendar,
  Download
} from 'lucide-react';

interface ServiceUsage {
  service: string;
  current: number;
  limit: number;
  cost: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: number;
}

interface ChartData {
  date: string;
  openai: number;
  gemini: number;
  apify: number;
  total: number;
}

export const UsageDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [usageData, setUsageData] = useState<ServiceUsage[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    fetchUsageData();
  }, [selectedPeriod]);

  const fetchUsageData = async () => {
    setIsLoading(true);
    try {
      // Mock data
      const mockUsageData: ServiceUsage[] = [
        {
          service: 'OpenAI GPT-4',
          current: 75000,
          limit: 100000,
          cost: 37.50,
          status: 'healthy',
          trend: 12.5
        },
        {
          service: 'Google Gemini',
          current: 45000,
          limit: 80000,
          cost: 22.50,
          status: 'healthy',
          trend: 5.2
        },
        {
          service: 'Apify Facebook',
          current: 2800,
          limit: 3000,
          cost: 28.00,
          status: 'warning',
          trend: 45.2
        }
      ];

      const mockChartData: ChartData[] = [
        { date: '01/10', openai: 2.4, gemini: 1.2, apify: 3.1, total: 6.7 },
        { date: '02/10', openai: 3.1, gemini: 1.8, apify: 2.9, total: 7.8 },
        { date: '03/10', openai: 2.8, gemini: 1.5, apify: 4.2, total: 8.5 },
        { date: '04/10', openai: 4.2, gemini: 2.1, apify: 3.8, total: 10.1 },
        { date: '05/10', openai: 3.6, gemini: 1.9, apify: 5.1, total: 10.6 },
        { date: '06/10', openai: 5.1, gemini: 2.4, apify: 4.5, total: 12.0 },
        { date: '07/10', openai: 4.8, gemini: 2.2, apify: 3.7, total: 10.7 }
      ];

      setUsageData(mockUsageData);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const totalCost = usageData.reduce((sum, service) => sum + service.cost, 0);
  const totalOperations = usageData.reduce((sum, service) => sum + service.current, 0);

  const pieData = usageData.map((service, index) => ({
    name: service.service,
    value: service.cost,
    color: ['#2563eb', '#10b981', '#f59e0b'][index]
  }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Usage Dashboard</h2>
          <p className="text-slate-600">Theo dõi sử dụng và chi phí API</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsageData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chi phí</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12.3% từ tuần trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng operations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOperations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8.7% từ tuần trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.1%</div>
            <p className="text-xs text-muted-foreground">
              +0.3% từ tuần trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/3</div>
            <p className="text-xs text-muted-foreground">
              Tất cả hoạt động tốt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Usage Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {usageData.map((service, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{service.service}</CardTitle>
                <Badge variant="outline" className={getStatusColor(service.status)}>
                  {getStatusIcon(service.status)}
                  <span className="ml-1 capitalize">{service.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Usage</span>
                  <span>{service.current.toLocaleString()} / {service.limit.toLocaleString()}</span>
                </div>
                <Progress value={(service.current / service.limit) * 100} className="h-2" />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">${service.cost.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Chi phí tháng này</p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center ${service.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {service.trend >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {service.trend >= 0 ? '+' : ''}{service.trend.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs tháng trước</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Chi phí theo thời gian</CardTitle>
            <CardDescription>
              Xu hướng chi phí 7 ngày qua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Chi phí']}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ chi phí</CardTitle>
            <CardDescription>
              Chi phí theo từng dịch vụ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Chi phí']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span>{entry.name}</span>
                  </div>
                  <span className="font-medium">${entry.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage chi tiết theo dịch vụ</CardTitle>
          <CardDescription>
            So sánh usage giữa các dịch vụ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Chi phí']}
                labelFormatter={(label) => `Ngày ${label}`}
              />
              <Area
                type="monotone"
                dataKey="openai"
                stackId="1"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="gemini"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="apify"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};