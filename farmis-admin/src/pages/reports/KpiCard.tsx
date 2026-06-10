import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tone = 'brand' | 'emerald' | 'amber' | 'sky' | 'violet';

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
  positive: boolean;
  comparePeriod: string;
  icon: LucideIcon;
  tone: Tone;
}

const TONES: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  sky: 'bg-sky-50 text-sky-700',
  violet: 'bg-violet-50 text-violet-700',
};

export function KpiCard({
  label,
  value,
  delta,
  positive,
  comparePeriod,
  icon: Icon,
  tone,
}: KpiCardProps) {
  const up = positive;
  return (
    <div className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
            TONES[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-0.5 text-xs font-semibold',
            up ? 'text-emerald-600' : 'text-red-600',
          )}
        >
          {up ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {up ? '+' : ''}
          {delta}%
        </div>
      </div>
      <div className="mt-3 text-xs font-medium text-ink-400">{label}</div>
      <div className="mt-0.5 text-xl font-semibold text-ink-800">{value}</div>
      <div className="mt-1 text-[10px] text-ink-400">vs {comparePeriod}</div>
    </div>
  );
}
