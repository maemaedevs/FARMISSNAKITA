import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Camera,
  Check,
  ClipboardList,
  Download,
  Eye,
  FileImage,
  FileText,
  Filter,
  IdCard,
  Map,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Avatar, Button, Input, Select } from '@/components/common';
import { Pagination, StatCard } from '@/components/list';
import { cn } from '@/lib/cn';
import { formatDate, formatNumber } from '@/utils/format';
import type {
  DocumentCategory,
  DocumentSubmission,
  DocumentVerificationStatus,
} from '@/types';
import {
  DOCUMENT_SUBMISSIONS,
  NEEDS_REVISION,
  PENDING_REVIEW,
  REJECTED_THIS_MONTH,
  TOTAL_SUBMISSIONS,
  VERIFIED_THIS_MONTH,
} from './document-verification.data';

type StatusFilter = 'all' | DocumentVerificationStatus;

const DOC_ICONS: Record<DocumentCategory, LucideIcon> = {
  'Land Title': FileText,
  'Tax Declaration': FileText,
  'Land ID / Sketch': Map,
  'Barangay Clearance': ShieldCheck,
  'Valid ID': IdCard,
  'RSBSA Form': ClipboardList,
  'Farm Photo': Camera,
};

const STATUS_STYLES: Record<
  DocumentVerificationStatus,
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
  verified: {
    pill: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Verified',
  },
  rejected: {
    pill: 'bg-red-50 text-red-700',
    dot: 'bg-red-500',
    label: 'Rejected',
  },
  needs_revision: {
    pill: 'bg-orange-50 text-orange-700',
    dot: 'bg-orange-500',
    label: 'Needs Revision',
  },
};

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'needs_revision', label: 'Needs Revision' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
];

export default function DocumentVerificationPage() {
  const [query, setQuery] = useState('');
  const [docType, setDocType] = useState<'all' | DocumentCategory>('all');
  const [statusTab, setStatusTab] = useState<StatusFilter>('all');
  const [barangay, setBarangay] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOCUMENT_SUBMISSIONS.filter((row) => {
      if (statusTab !== 'all' && row.status !== statusTab) return false;
      if (docType !== 'all' && row.documentType !== docType) return false;
      if (barangay !== 'all' && row.barangay !== barangay) return false;
      if (!q) return true;
      return (
        row.submissionCode.toLowerCase().includes(q) ||
        row.farmerName.toLowerCase().includes(q) ||
        row.farmerRegistryId.toLowerCase().includes(q) ||
        row.documentType.toLowerCase().includes(q) ||
        row.fileName.toLowerCase().includes(q) ||
        row.barangay.toLowerCase().includes(q)
      );
    });
  }, [query, docType, statusTab, barangay]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink-800">
              DOCUMENT VERIFICATION
            </h1>
            <p className="mt-0.5 text-sm text-ink-400">
              Review land titles, IDs, clearances, and supporting files submitted
              by farmers before registry and program approval
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending Review"
          value={formatNumber(PENDING_REVIEW)}
          hint="Awaiting verification"
          icon={FileText}
          tone="amber"
        />
        <StatCard
          label="Verified This Month"
          value={formatNumber(VERIFIED_THIS_MONTH)}
          hint="May 2025"
          icon={Check}
          tone="emerald"
        />
        <StatCard
          label="Rejected"
          value={formatNumber(REJECTED_THIS_MONTH)}
          hint="This month"
          icon={XCircle}
          tone="sky"
        />
        <StatCard
          label="Needs Revision"
          value={formatNumber(NEEDS_REVISION)}
          hint="Resubmission required"
          icon={AlertCircle}
          tone="violet"
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
                placeholder="Search by submission ID, farmer, file name, or barangay..."
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
                  value={docType}
                  onChange={(e) => {
                    setDocType(e.target.value as 'all' | DocumentCategory);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Document Types' },
                    { value: 'Land Title', label: 'Land Title' },
                    { value: 'Tax Declaration', label: 'Tax Declaration' },
                    { value: 'Land ID / Sketch', label: 'Land ID / Sketch' },
                    {
                      value: 'Barangay Clearance',
                      label: 'Barangay Clearance',
                    },
                    { value: 'Valid ID', label: 'Valid ID' },
                    { value: 'RSBSA Form', label: 'RSBSA Form' },
                    { value: 'Farm Photo', label: 'Farm Photo' },
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
                <th className="px-4 py-3 font-semibold">Submission ID</th>
                <th className="px-4 py-3 font-semibold">Document</th>
                <th className="px-4 py-3 font-semibold">Farmer</th>
                <th className="px-4 py-3 font-semibold">Barangay</th>
                <th className="px-4 py-3 font-semibold">Linked To</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Review</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {paginated.map((row) => (
                <SubmissionRow key={row.id} row={row} />
              ))}
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-ink-400"
                  >
                    No document submissions match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={TOTAL_SUBMISSIONS}
          itemCount={paginated.length}
          entityLabel="submissions"
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

function SubmissionRow({ row }: { row: DocumentSubmission }) {
  const DocIcon = DOC_ICONS[row.documentType];
  const statusStyle = STATUS_STYLES[row.status];
  const canReview =
    row.status === 'pending' ||
    row.status === 'under_review' ||
    row.status === 'needs_revision';

  return (
    <tr className="hover:bg-ink-50/60">
      <td className="px-4 py-3">
        <span className="font-medium text-brand-600">{row.submissionCode}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-600">
            <DocIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-ink-800">{row.documentType}</div>
            <div className="flex items-center gap-1 truncate text-xs text-ink-400">
              <FileImage className="h-3 w-3 shrink-0" />
              {row.fileName}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={row.farmerName} size={32} colorful />
          <div className="min-w-0">
            <Link
              to={`/farmers/${row.farmerId}`}
              className="font-medium text-ink-800 hover:text-brand-600"
            >
              {row.farmerName}
            </Link>
            <div className="text-xs text-ink-400">{row.farmerRegistryId}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-ink-500">{row.barangay}</td>
      <td className="px-4 py-3 text-ink-600">{row.linkedTo}</td>
      <td className="px-4 py-3">
        <div className="text-ink-700">{formatDate(row.submittedAt)}</div>
        <div className="text-xs text-ink-400">{row.submittedBy}</div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.pill}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </span>
        {row.rejectionReason ? (
          <div className="mt-1 max-w-[200px] text-[10px] leading-snug text-red-600">
            {row.rejectionReason}
          </div>
        ) : null}
      </td>
      <td className="px-4 py-3 text-ink-500">
        {row.reviewedBy ? (
          <>
            <div className="text-xs text-ink-700">{row.reviewedBy}</div>
            {row.reviewedAt ? (
              <div className="text-[10px] text-ink-400">
                {formatDate(row.reviewedAt)}
              </div>
            ) : null}
          </>
        ) : (
          <span className="text-xs text-ink-300">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-1">
          {canReview ? (
            <>
              <Button
                size="sm"
                className="h-8 bg-emerald-600 px-2 hover:bg-emerald-700"
                aria-label={`Verify ${row.submissionCode}`}
              >
                <Check className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Verify</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 border-amber-200 px-2 text-amber-700 hover:bg-amber-50"
                aria-label={`Request revision for ${row.submissionCode}`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Revise</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 border-red-200 px-2 text-red-600 hover:bg-red-50"
                aria-label={`Reject ${row.submissionCode}`}
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reject</span>
              </Button>
            </>
          ) : null}
          <Link
            to={`/farmers/${row.farmerId}`}
            className="inline-flex h-8 items-center rounded-md border border-ink-100 px-2.5 text-xs font-medium text-ink-600 transition hover:bg-ink-50"
            aria-label={`View farmer ${row.farmerName}`}
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
