import type { ReactNode } from 'react';

interface InfoRow {
  label: string;
  value: ReactNode;
}

interface InfoSectionProps {
  title: string;
  rows: InfoRow[];
}

export function InfoSection({ title, rows }: InfoSectionProps) {
  return (
    <section className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-4 shadow-[var(--shadow-soft)]">
      <h3 className="mb-3 text-sm font-semibold text-ink-800">{title}</h3>
      <dl className="space-y-2.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,140px)_1fr] gap-2 text-sm"
          >
            <dt className="text-ink-400">{row.label}</dt>
            <dd className="font-medium text-ink-800">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
