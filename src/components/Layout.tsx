import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { 
  Search, 
  FileText, 
  Settings, 
  LogOut,
  RotateCcw,
  Link,
  Activity,
  Users,
  Menu,
  X,
  BarChart3
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      id: 'scan',
      label: 'Quét',
      icon: Search,
      roles: ['Admin', 'Writer', 'View']
    },
    {
      id: 'generate',
      label: 'Viết từ tin đã quét',
      icon: RotateCcw,
      roles: ['Admin', 'Writer']
    },
    {
      id: 'url-to-article',
      label: 'Viết từ URL',
      icon: Link,
      roles: ['Admin', 'Writer']
    },
    {
      id: 'articles',
      label: 'Bài viết',
      icon: FileText,
      roles: ['Admin', 'Writer', 'View']
    },
    {
      id: 'activity',
      label: 'Hoạt động',
      icon: Activity,
      roles: ['Admin', 'Writer', 'View']
    },
    {
      id: 'usage',
      label: 'Usage & Billing',
      icon: BarChart3,
      roles: ['Admin']
    },
    {
      id: 'users',
      label: 'Người dùng',
      icon: Users,
      roles: ['Admin']
    },
    {
      id: 'config',
      label: 'Cấu hình',
      icon: Settings,
      roles: ['Admin']
    }
  ];

  const visibleMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleMenuClick = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <SidebarContent />
    </>
  );

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-700 flex-col shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-800">
          <h1 className="text-xl font-bold text-white">DocNhanh</h1>
          <p className="text-sm text-slate-300 mt-1">Hệ thống quản lý nội dung</p>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {visibleMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 font-medium ${
                  currentPage === item.id 
                    ? 'bg-blue-600 text-white shadow-md border-l-4 border-blue-400' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:shadow-md'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="mb-4 p-3 bg-slate-700 rounded-lg border border-slate-600">
            <p className="text-sm font-semibold text-white">
              {user?.full_name || user?.username}
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Vai trò: <span className="font-medium text-blue-300">{user?.role}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-slate-300 border-slate-600 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-700">
            <div>
              <h1 className="text-lg font-bold text-white">DocNhanh</h1>
              <p className="text-xs text-slate-300">Hệ thống quản lý nội dung</p>
            </div>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-slate-700">
            <div className="flex flex-col h-full">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900 border-b border-slate-700">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-lg font-bold text-white">DocNhanh</h1>
              <p className="text-xs text-slate-300">Hệ thống quản lý nội dung</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 lg:p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};