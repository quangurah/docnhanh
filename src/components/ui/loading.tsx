import React from 'react';
import { cn } from './utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Đang tải...', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="relative">
        <div className={cn(
          "animate-spin rounded-full border-4 border-slate-200 border-t-primary",
          sizeClasses[size]
        )}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
      {text && (
        <p className="text-sm text-muted-foreground mt-4">{text}</p>
      )}
    </div>
  );
};