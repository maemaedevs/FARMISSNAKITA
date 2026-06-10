import { Leaf } from 'lucide-react';
import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  compact?: boolean;
  tone?: 'light' | 'dark';
}

export function Logo({ className, compact = false, tone = 'light' }: LogoProps) {
  const titleClass =
    tone === 'dark' ? 'text-white' : 'text-brand-700';
  const subtitleClass =
    tone === 'dark' ? 'text-ink-200' : 'text-ink-400';

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <Leaf
        className={cn(
          'shrink-0',
          compact ? 'h-5 w-5' : 'h-6 w-6',
          tone === 'dark' ? 'text-brand-300' : 'text-brand-500',
        )}
        strokeWidth={2.2}
      />
      {!compact && (
        <div className="min-w-0 leading-tight">
          <div
            className={cn(
              'truncate text-[11px] font-bold tracking-wide',
              titleClass,
            )}
          >
            AGRICULTURAL REGISTRY
          </div>
          <div
            className={cn(
              'truncate text-[9px] font-medium uppercase tracking-[0.14em]',
              subtitleClass,
            )}
          >
            Admin Portal
          </div>
        </div>
      )}
    </div>
  );
}
