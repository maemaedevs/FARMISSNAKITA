import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
} as const;

export function Card({
  title,
  description,
  action,
  padding = 'md',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]',
        PADDING[padding],
        className,
      )}
      {...rest}
    >
      {(title || description || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? (
              <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-ink-400">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
}
