import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional title */
  title?: string;
  /** Optional footer */
  footer?: React.ReactNode;
  /** Optional className for inner content */
  className?: string;
}

export const Card = ({ title, footer, className = '', children }: CardProps) => (
  <div className={`bg-white dark:bg-white/5 border border-black/10 rounded-xl ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-black/5 dark:border-white/5">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    )}
    <div className="px-6 py-4">{children}</div>
    {footer && (
      <div className="px-6 py-4 border-t border-black/5 dark:border-white/5">{footer}</div>
    )}
  </div>
);

Card.displayName = 'Card';
