import React from 'react';
import { Button } from './button';
import { cn } from './utils';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn("text-center py-12", className)}>
      {Icon && (
        <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      )}
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};