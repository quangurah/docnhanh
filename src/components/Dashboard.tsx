import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart3, Clock, FileText, CheckCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  // Mock data - in real implementation, fetch from APIs
  const stats = {
    runningJobs: 0,
    completedToday: 0,
    articlesDrafted: 0,
    articlesPublished: 0
  };

  const statCards = [
    {
      title: 'Running Jobs',
      value: stats.runningJobs,
      icon: Clock,
      description: 'Tác vụ đang chạy'
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: CheckCircle,
      description: 'Hoàn thành hôm nay'
    },
    {
      title: 'Articles Drafted',
      value: stats.articlesDrafted,
      icon: FileText,
      description: 'Bài viết nháp'
    },
    {
      title: 'Articles Published',
      value: stats.articlesPublished,
      icon: BarChart3,
      description: 'Bài viết đã xuất bản'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Tổng quan hệ thống DocNhanh
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Không có hoạt động nào gần đây</p>
                  <p className="text-xs text-muted-foreground">
                    Bắt đầu quét để xem hoạt động
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Tổng số bài viết</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tổng số tác vụ</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Nguồn tin đang theo dõi</span>
                <span className="font-medium">5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};