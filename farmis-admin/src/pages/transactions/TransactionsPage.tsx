import { useMemo, useState } from 'react';
import {
  Check,
  ClipboardCheck,
  Clock,
  Download,
  Eye,
  Filter,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { Avatar, Button, Input, Select } from '@/components/common';
import { Pagination, StatCard } from '@/components/list';
import { cn } from '@/lib/cn';
import { formatDate, formatNumber, formatPeso } from '@/utils/format';
import type {
  ApprovalStatus,
  ApprovalTransaction,
  TransactionType,
} from '@/types';
import {
  APPROVED_THIS_MONTH,
  PENDING_APPROVALS,
  REJECTED_THIS_MONTH,
  TOTAL_TRANSACTIONS,
  TRANSACTIONS,
} from './transactions.data';

type StatusFilter = 'all' | ApprovalStatus;

const TYPE_STYLES: Record<TransactionType, string> = {
  'Assistance Distribution': 'bg-brand-50 text-brand-700',
  'Farmer Registration': 'bg-sky-50 text-sky-700',
  'Program Enrollment': 'bg-violet-50 text-violet-700',
  'Crop Record': 'bg-emerald-50 text-emerald-700',
  'Document Verification': 'bg-amber-50 text-amber-700',
};

const STATUS_STYLES: Record<
  ApprovalStatus,
  { pill: string; dot: string; label: string }
> = {
  pending: {
    pill: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  under_review: {
    pill: 'bg-sky-50 text-sky-700',
    dot: 'bg-sky-500',
    label: 'Under Review',
  },
  approved: {
    pill: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Approved',
  },
  rejected: {
    pill: 'bg-red-50 text-red-700',
    dot: 'bg-red-500',
    label: 'Rejected',
  },
};

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function TransactionsPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [statusTab, setStatusTab] = useState<StatusFilter>('all');
  const [barangay, setBarangay] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRANSACTIONS.filter((row) => {
      if (statusTab !== 'all' && row.status !== statusTab) return false;
      if (typeFilter !== 'all' && row.type !== typeFilter) return false;
      if (barangay !== 'all' && row.barangay !== barangay) return false;
      if (!q) return true;
      return (
        row.transactionCode.toLowerCase().includes(q) ||
        row.farmerName.toLowerCase().includes(q) ||
        row.subject.toLowerCase().includes(q) ||
        row.barangay.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q)
      );
    });
  }, [query, typeFilter, statusTab, barangay]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink-800">
              TRANSACTIONS & APPROVALS
            </h1>
            <p className="mt-0.5 text-sm text-ink-400">
              Review and approve farmer registrations, assistance requests, and
              registry updates
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending Approvals"
          value={formatNumber(PENDING_APPROVALS)}
          hint="Awaiting action"
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Approved This Month"
          value={formatNumber(APPROVED_THIS_MONTH)}
          hint="May 2025"
          icon={Check}
          tone="emerald"
        />
        <StatCard
          label="Rejected This Month"
          value={formatNumber(REJECTED_THIS_MONTH)}
          hint="May 2025"
          icon={XCircle}
          tone="sky"
        />
        <StatCard
          label="Total Transactions"
          value={formatNumber(TOTAL_TRANSACTIONS)}
          hint="All time"
          icon={ClipboardCheck}
          tone="brand"
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4">
          <div className="flex flex-wrap gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusTab(tab.value);
                  setPage(1);
                }}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  statusTab === tab.value
                    ? 'bg-brand-500 text-white'
                    : 'text-ink-500 hover:bg-ink-50',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <Input
                placeholder="Search by transaction ID, farmer, or subject..."
                leadingIcon={<Search className="h-4 w-4" />}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-full sm:w-48">
                <Select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as 'all' | TransactionType);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Transaction Types' },
                    {
                      value: 'Assistance Distribution',
                      label: 'Assistance Distribution',
                    },
                    {
                      value: 'Farmer Registration',
                      label: 'Farmer Registration',
                    },
                    {
                      value: 'Program Enrollment',
                      label: 'Program Enrollment',
                    },
                    { value: 'Crop Record', label: 'Crop Record' },
                    {
                      value: 'Document Verification',
                      label: 'Document Verification',
                    },
                  ]}
                />
              </div>

              <div className="w-full sm:w-40">
                <Select
                  value={barangay}
                  onChange={(e) => {
                    setBarangay(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Barangays' },
                    { value: 'San Isidro', label: 'San Isidro' },
                    { value: 'San Roque', label: 'San Roque' },
                    { value: 'Poblacion', label: 'Poblacion' },
                    { value: 'Mabini', label: 'Mabini' },
                  ]}
                />
              </div>

              <Button variant="secondary" size="md">
                <Filter className="h-4 w-4" />
                Filter
              </Button>

              <Button variant="secondary" size="md">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Transaction ID</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Farmer</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Barangay</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {paginated.map((row) => (
                <TransactionRow key={row.id} row={row} />
              ))}
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-ink-400"
                  >
                    No transactions match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={TOTAL_TRANSACTIONS}
          itemCount={paginated.length}
          entityLabel="transactions"
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </>
  );
}

function TransactionRow({ row }: { row: ApprovalTransaction }) {
  const statusStyle = STATUS_STYLES[row.status];
  const canApprove =
    row.status === 'pending' || row.status === 'under_review';

  return (
    <tr className="hover:bg-ink-50/60">
      <td className="px-4 py-3">
        <span className="font-medium text-brand-600">{row.transactionCode}</span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[row.type]}`}
        >
          {row.type}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={row.farmerName} size={32} colorful />
          <span className="font-medium text-ink-800">{row.farmerName}</span>
        </div>
      </td>
      <td className="max-w-xs px-4 py-3">
        <div className="font-medium text-ink-800">{row.subject}</div>
        <div className="line-clamp-1 text-xs text-ink-400">{row.details}</div>
      </td>
      <td className="px-4 py-3 text-ink-700">
        {row.amountPeso != null ? formatPeso(row.amountPeso) : '—'}
      </td>
      <td className="px-4 py-3 text-ink-500">{row.barangay}</td>
      <td className="px-4 py-3">
        <div className="text-ink-700">{formatDate(row.submittedAt)}</div>
        <div className="text-xs text-ink-400">by {row.submittedBy}</div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.pill}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          {canApprove ? (
            <>
              <Button
                size="sm"
                className="h-8 bg-emerald-600 px-2.5 hover:bg-emerald-700"
                aria-label={`Approve ${row.transactionCode}`}
              >
                <Check className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Approve</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 border-red-200 px-2.5 text-red-600 hover:bg-red-50"
                aria-label={`Reject ${row.transactionCode}`}
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reject</span>
              </Button>
            </>
          ) : null}
          <button
            type="button"
            className="rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            aria-label={`View ${row.transactionCode}`}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
