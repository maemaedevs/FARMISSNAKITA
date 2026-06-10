import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from '@/components/common';
import { cn } from '@/lib/cn';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  entityLabel: string;
  /** Rows rendered on the current page (defaults to page slice size). */
  itemCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function buildPages(current: number, totalPages: number): (number | '…')[] {
  const pages: (number | '…')[] = [];
  const window = 1;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= current - window && i <= current + window)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return pages;
}

export function Pagination({
  page,
  pageSize,
  total,
  entityLabel,
  itemCount,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end =
    itemCount != null
      ? start + itemCount - 1
      : Math.min(page * pageSize, total);
  const pages = buildPages(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-ink-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-ink-500">
        Showing {start} to {end} of {total.toLocaleString()} {entityLabel}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span>Rows per page:</span>
          <div className="w-20">
            <Select
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            options={[
              { value: '5', label: '5' },
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '50', label: '50' },
            ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <PageButton
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </PageButton>

          {pages.map((p, i) =>
            p === '…' ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-xs text-ink-400"
              >
                …
              </span>
            ) : (
              <PageButton
                key={p}
                active={p === page}
                onClick={() => onPageChange(p)}
              >
                {p}
              </PageButton>
            ),
          )}

          <PageButton
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </PageButton>
        </div>
      </div>
    </div>
  );
}

interface PageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function PageButton({
  active,
  className,
  children,
  ...rest
}: PageButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-transparent px-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
        active
          ? 'bg-brand-500 text-white'
          : 'text-ink-600 hover:border-ink-100 hover:bg-ink-50',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
