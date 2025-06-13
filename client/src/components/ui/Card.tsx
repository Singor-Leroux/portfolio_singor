import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverEffect?: boolean;
  variant?: 'default' | 'bordered' | 'elevated';
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  withBorder?: boolean;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  withBorder?: boolean;
}

const Card = ({
  children,
  className,
  hoverEffect = false,
  variant = 'default',
  ...props
}: CardProps) => {
  const baseClasses = 'rounded-lg overflow-hidden';
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 shadow-sm',
    bordered: 'border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
  };
  const hoverClasses = hoverEffect 
    ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5' 
    : '';
  
  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ 
  children, 
  className,
  withBorder = true,
  ...props 
}: CardHeaderProps) => (
  <div 
    className={cn(
      'px-6 py-4',
      withBorder && 'border-b border-gray-200 dark:border-gray-700',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CardBody = ({ 
  children, 
  className,
  padding = 'md',
  ...props 
}: CardBodyProps) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div 
      className={cn(paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardFooter = ({ 
  children, 
  className,
  withBorder = true,
  ...props 
}: CardFooterProps) => (
  <div 
    className={cn(
      'px-6 py-4 bg-gray-50 dark:bg-gray-800/50',
      withBorder && 'border-t border-gray-200 dark:border-gray-700',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export { Card, CardHeader, CardBody, CardFooter };
