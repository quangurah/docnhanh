import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Activity,
  Globe,
  Database
} from 'lucide-react';

interface ScanProgressProps {
  scanId: string;
  scanType: 'news' | 'social';
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface ScanStatus {
  id: string;
  status: 'starting' | 'running' | 'completed' | 'failed' | 'timeout';
  progress: number;
  currentStep: string;
  articlesFound: number;
  errors: number;
  startTime: Date;
  estimatedTime: number;
  sources: string[];
  currentSource?: string;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ 
  scanId, 
  scanType, 
  onComplete, 
  onError 
}) => {
  const [scanStatus, setScanStatus] = useState<ScanStatus>({
    id: scanId,
    status: 'starting',
    progress: 0,
    currentStep: 'Đang khởi tạo...',
    articlesFound: 0,
    errors: 0,
    startTime: new Date(),
    estimatedTime: scanType === 'news' ? 120 : 90, // seconds
    sources: scanType === 'news' 
      ? ['VnExpress', 'Dân Trí', 'Tuổi Trẻ'] 
      : ['Facebook', 'Instagram', 'Twitter'],
  });

  const [isPolling, setIsPolling] = useState(true);

  // Simulate scan progress
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      setScanStatus(prev => {
        const newProgress = Math.min(prev.progress + Math.random() * 10, 100);
        const newArticles = prev.articlesFound + Math.floor(Math.random() * 3);
        const newErrors = prev.errors + (Math.random() < 0.1 ? 1 : 0);
        
        let newStatus = prev.status;
        let newStep = prev.currentStep;
        let newCurrentSource = prev.currentSource;

        // Simulate different stages
        if (newProgress < 20) {
          newStep = 'Đang kết nối với server...';
          newCurrentSource = prev.sources[0];
        } else if (newProgress < 40) {
          newStep = 'Đang quét nguồn tin...';
          newCurrentSource = prev.sources[1];
        } else if (newProgress < 70) {
          newStep = 'Đang xử lý dữ liệu...';
          newCurrentSource = prev.sources[2];
        } else if (newProgress < 95) {
          newStep = 'Đang lưu kết quả...';
        } else if (newProgress >= 100) {
          newStep = 'Hoàn thành!';
          newStatus = 'completed';
          setIsPolling(false);
          onComplete?.();
        }

        // Simulate timeout (5% chance)
        if (Math.random() < 0.05 && newProgress < 50) {
          newStatus = 'timeout';
          newStep = 'Kết nối timeout - đang thử lại...';
          setIsPolling(false);
          onError?.('Connection timeout after 30 seconds');
        }

        // Simulate error (2% chance)
        if (Math.random() < 0.02 && newProgress > 20) {
          newStatus = 'failed';
          newStep = 'Có lỗi xảy ra trong quá trình quét';
          setIsPolling(false);
          onError?.('Lỗi kết nối API');
        }

        return {
          ...prev,
          progress: newProgress,
          articlesFound: newArticles,
          errors: newErrors,
          status: newStatus,
          currentStep: newStep,
          currentSource: newCurrentSource,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPolling, onComplete, onError]);

  const getStatusIcon = () => {
    switch (scanStatus.status) {
      case 'starting':
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'timeout':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (scanStatus.status) {
      case 'starting':
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'timeout':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (scanStatus.status) {
      case 'starting':
        return 'Đang khởi động';
      case 'running':
        return 'Đang chạy';
      case 'completed':
        return 'Hoàn thành';
      case 'failed':
        return 'Thất bại';
      case 'timeout':
        return 'Timeout';
      default:
        return 'Không xác định';
    }
  };

  const formatElapsedTime = () => {
    const elapsed = Math.floor((Date.now() - scanStatus.startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    setScanStatus(prev => ({
      ...prev,
      status: 'starting',
      progress: 0,
      currentStep: 'Đang thử lại...',
      errors: 0,
    }));
    setIsPolling(true);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold">
              Quét {scanType === 'news' ? 'Báo chí' : 'Mạng xã hội'}
            </h3>
            <p className="text-sm text-gray-600">ID: {scanId}</p>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Tiến độ</span>
            <span className="text-sm text-gray-600">{Math.round(scanStatus.progress)}%</span>
          </div>
          <Progress value={scanStatus.progress} className="h-2" />
        </div>

        {/* Current Step */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Trạng thái hiện tại</span>
          </div>
          <p className="text-sm text-gray-700">{scanStatus.currentStep}</p>
          {scanStatus.currentSource && (
            <p className="text-xs text-gray-500 mt-1">
              Đang quét: {scanStatus.currentSource}
            </p>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-lg font-bold text-blue-600">
                {scanStatus.articlesFound}
              </span>
            </div>
            <p className="text-xs text-gray-600">Bài viết tìm thấy</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Globe className="w-4 h-4 text-green-600" />
              <span className="text-lg font-bold text-green-600">
                {scanStatus.sources.length}
              </span>
            </div>
            <p className="text-xs text-gray-600">Nguồn tin</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-lg font-bold text-orange-600">
                {formatElapsedTime()}
              </span>
            </div>
            <p className="text-xs text-gray-600">Thời gian</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-lg font-bold text-red-600">
                {scanStatus.errors}
              </span>
            </div>
            <p className="text-xs text-gray-600">Lỗi</p>
          </div>
        </div>

        {/* Error Handling */}
        {(scanStatus.status === 'failed' || scanStatus.status === 'timeout') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                {scanStatus.status === 'timeout' ? 'Kết nối timeout' : 'Có lỗi xảy ra'}
              </span>
            </div>
            <p className="text-sm text-red-700 mb-3">
              {scanStatus.status === 'timeout' 
                ? 'Kết nối đến VnExpress bị timeout sau 30 giây. Hệ thống đang thử lại...'
                : 'Có lỗi xảy ra trong quá trình quét. Vui lòng thử lại.'
              }
            </p>
            <Button 
              onClick={handleRetry}
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          </div>
        )}

        {/* Success Message */}
        {scanStatus.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Quét hoàn thành thành công!
              </span>
            </div>
            <p className="text-sm text-green-700">
              Đã tìm thấy {scanStatus.articlesFound} bài viết từ {scanStatus.sources.length} nguồn tin.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};