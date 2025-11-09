import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className,
}) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className={cn('border rounded-lg p-4', config.container, className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', config.iconColor)} />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={cn('text-sm font-medium', config.titleColor)}>
              {title}
            </h3>
          )}
          <div className={cn('text-sm', title ? 'mt-2' : '', config.textColor)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
