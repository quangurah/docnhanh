import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LoginForm } from './components/LoginForm';
import { ScanJobs } from './components/ScanJobs';
import { ArticleGeneration } from './components/ArticleGeneration';
import { UrlToArticle } from './components/UrlToArticle';
import { ArticleWriter } from './components/ArticleWriter';
import { ArticleWorkbench } from './components/ArticleWorkbench';
import { ActivityLog } from './components/ActivityLog';
import { UserManagement } from './components/UserManagement';
import { Configuration } from './components/Configuration';
import { UsageDashboard } from './components/UsageDashboard';
import { Toaster } from './components/ui/sonner';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('scan');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Đang khởi động DocNhanh</h2>
          <p className="text-slate-600">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const handleSelectArticle = (article: any) => {
    setSelectedArticle(article);
    setCurrentPage('write-article');
  };

  const handleBackToGenerate = () => {
    setSelectedArticle(null);
    setCurrentPage('generate');
  };

  const handleArticleGenerated = (generatedArticle: any, type: string) => {
    // Here you could store the generated article
    console.log('Generated article:', generatedArticle, 'Type:', type);
    setCurrentPage('articles'); // Navigate to ArticleWorkbench
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'scan':
        return <ScanJobs />;
      case 'generate':
        return <ArticleGeneration onSelectArticle={handleSelectArticle} />;
      case 'write-article':
        return (
          <ArticleWriter 
            selectedArticle={selectedArticle}
            onBack={handleBackToGenerate}
            onArticleGenerated={handleArticleGenerated}
          />
        );
      case 'url-to-article':
        return <UrlToArticle />;
      case 'articles':
        return <ArticleWorkbench />;
      case 'activity':
        return <ActivityLog />;
      case 'usage':
        return <UsageDashboard />;
      case 'users':
        return <UserManagement />;
      case 'config':
        return <Configuration />;
      default:
        return <ScanJobs />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <div className="size-full">
        <AppContent />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}