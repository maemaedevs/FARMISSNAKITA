import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tone = 'brand' | 'emerald' | 'amber' | 'sky' | 'violet';

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
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

export function StatCard({ label, value, hint, icon: Icon, tone }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-ink-100 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div
        className={cn(
          'grid h-12 w-12 shrink-0 place-items-center rounded-xl',
          TONES[tone],
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-ink-400">{label}</div>
        <div className="mt-0.5 text-2xl font-semibold leading-tight text-ink-800">
          {value}
        </div>
        <div className="mt-0.5 text-[11px] text-ink-400">{hint}</div>
      </div>
    </div>
  );
}
