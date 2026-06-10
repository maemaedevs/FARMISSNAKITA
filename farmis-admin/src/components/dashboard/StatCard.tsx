import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/common';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
}

export function StatCard({ label, value, delta, icon: Icon }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-ink-400">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-ink-800">
            {value}
          </div>
          {typeof delta === 'number' ? (
            <div
              className={cn(
                'mt-2 inline-flex items-center gap-1 text-xs font-medium',
                positive ? 'text-brand-700' : 'text-red-600',
              )}
            >
              {positive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {positive ? '+' : ''}
              {delta}% vs last week
            </div>
          ) : null}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
