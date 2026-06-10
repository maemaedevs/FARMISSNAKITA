import type { LucideIcon } from 'lucide-react';
import { Card, PageHeader } from '@/components/common';

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
}

export function PlaceholderPage({
  title,
  subtitle,
  icon: Icon,
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <Card padding="lg">
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon className="h-7 w-7" />
          </div>
          <h2 className="text-base font-semibold text-ink-800">
            {title} is coming soon
          </h2>
          <p className="max-w-sm text-sm text-ink-400">
            This section is wired up but does not have data or interactions yet.
            Hook it up to your backend once the endpoints are ready.
          </p>
        </div>
      </Card>
    </>
  );
}
