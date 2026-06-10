import { useMemo, useState } from 'react';
import {
  Beef,
  Building2,
  Calendar,
  CalendarRange,
  CheckCircle2,
  Download,
  Filter,
  Gift,
  HandHeart,
  MoreVertical,
  Plus,
  Search,
  Sprout,
  Tractor,
  Users,
  Wheat,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Input, Select } from '@/components/common';
import { Pagination, StatCard } from '@/components/list';
import { formatDate, formatNumber, formatPeso } from '@/utils/format';
import type {
  AssistanceDistribution,
  DistributionStatus,
  DistributionsResponse,
  ProgramsResponse,
} from '@/types';
import { api } from '@/services/api';
import { AddDistributionModal } from './AddDistributionModal';
import { ViewDistributionModal } from './ViewDistributionModal';

const PROGRAM_ICONS: Record<string, LucideIcon> = {
  gift: Gift,
  sprout: Sprout,
  wheat: Wheat,
  beef: Beef,
  building: Building2,
  tractor: Tractor,
  feeds: Gift,
  seeds: Sprout,
  livestock: Beef,
};

const BARANGAY_OPTIONS = [
  { value: 'all', label: 'All Barangays' },
  { value: 'San Isidro', label: 'San Isidro' },
  { value: 'San Roque', label: 'San Roque' },
  { value: 'Poblacion', label: 'Poblacion' },
  { value: 'Mabini', label: 'Mabini' },
];

const STATUS_STYLES: Record<
  DistributionStatus,
  { pill: string; dot: string; label: string }
> = {
  completed: {
    pill: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Completed',
  },
  pending: {
    pill: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  cancelled: {
    pill: 'bg-red-50 text-red-700',
    dot: 'bg-red-500',
    label: 'Cancelled',
  },
};

export default function DistributionsPage() {
  const [query, setQuery] = useState('');
  const [programId, setProgramId] = useState('all');
  const [barangay, setBarangay] = useState('all');
  const [status, setStatus] = useState<'all' | DistributionStatus>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewDistribution, setViewDistribution] =
    useState<AssistanceDistribution | null>(null);

  const { data: programsData } = useQuery({
    queryKey: ['programs', 'distribution-filters'] as const,
    queryFn: async () => {
      const res = await api.get<ProgramsResponse>(
        '/admin/programs?page=1&pageSize=100',
      );
      return res.data;
    },
  });

  const programOptions = useMemo(
    () => [
      { value: 'all', label: 'All Programs' },
      ...(programsData?.data ?? []).map((p) => ({
        value: p.id,
        label: p.name,
      })),
    ],
    [programsData],
  );

  const { data, isLoading } = useQuery<DistributionsResponse>({
    queryKey: [
      'distributions',
      { page, pageSize, query, programId, barangay, status },
    ] as const,
    queryFn: async (): Promise<DistributionsResponse> => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (query.trim()) params.set('query', query.trim());
      if (programId !== 'all') params.set('programId', programId);
      if (barangay !== 'all') params.set('barangay', barangay);
      if (status !== 'all') params.set('status', status);

      const res = await api.get<DistributionsResponse>(
        `/admin/distributions?${params.toString()}`,
      );
      return res.data;
    },
  });

  const distributions = data?.data ?? [];
  const stats = data?.stats;
  const total = data?.total ?? 0;

  const monthHint = useMemo(
    () =>
      new Date().toLocaleString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [],
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <HandHeart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink-800">
              ASSISTANCE PROGRAM DISTRIBUTIONS
            </h1>
            <p className="mt-0.5 text-sm text-ink-400">
              Manage and track distributions of assistance programs to farmers
            </p>
          </div>
        </div>

        <Button
          className="self-start sm:self-center"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Distribute Assistance
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Distributions"
          value={formatNumber(stats?.total ?? 0)}
          hint="All Time"
          icon={Gift}
          tone="brand"
        />
        <StatCard
          label="Total Beneficiaries"
          value={formatNumber(stats?.beneficiaries ?? 0)}
          hint="Farmers Assisted"
          icon={Users}
          tone="emerald"
        />
        <StatCard
          label="Total Amount Distributed"
          value={formatPeso(stats?.totalAmount ?? 0)}
          hint="All Time"
          icon={HandHeart}
          tone="sky"
        />
        <StatCard
          label="This Month"
          value={formatNumber(stats?.thisMonth ?? 0)}
          hint={monthHint}
          icon={Calendar}
          tone="violet"
        />
        <StatCard
          label="Completed"
          value={formatNumber(stats?.completedThisYear ?? 0)}
          hint="This Year"
          icon={CheckCircle2}
          tone="amber"
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            <Input
              placeholder="Search by program, farmer, or barangay..."
              leadingIcon={<Search className="h-4 w-4" />}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-44">
              <Select
                value={programId}
                onChange={(e) => {
                  setProgramId(e.target.value);
                  setPage(1);
                }}
                options={programOptions}
              />
            </div>

            <div className="w-full sm:w-40">
              <Select
                value={barangay}
                onChange={(e) => {
                  setBarangay(e.target.value);
                  setPage(1);
                }}
                options={BARANGAY_OPTIONS}
              />
            </div>

            <div className="w-full sm:w-36">
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as 'all' | DistributionStatus);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </div>

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 text-xs font-medium text-ink-600 transition hover:bg-ink-50"
            >
              <CalendarRange className="h-4 w-4 text-ink-400" />
              {monthHint}
            </button>

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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Program Name</th>
                <th className="px-4 py-3 font-semibold">Farmer / Beneficiary</th>
                <th className="px-4 py-3 font-semibold">Barangay</th>
                <th className="px-4 py-3 font-semibold">Assistance Type</th>
                <th className="px-4 py-3 font-semibold">Amount / Quantity</th>
                <th className="px-4 py-3 font-semibold">Date Distributed</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Distributed By</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {distributions.map((row) => (
                <DistributionRow
                  key={row.id}
                  row={row}
                  onView={() => setViewDistribution(row)}
                />
              ))}
              {!isLoading && distributions.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm text-ink-400"
                  >
                    No distributions match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          itemCount={distributions.length}
          entityLabel="distributions"
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <AddDistributionModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <ViewDistributionModal
        open={viewDistribution !== null}
        distribution={viewDistribution}
        onClose={() => setViewDistribution(null)}
      />
    </>
  );
}

function DistributionRow({
  row,
  onView,
}: {
  row: AssistanceDistribution;
  onView: () => void;
}) {
  const ProgramIcon = PROGRAM_ICONS[row.programIcon] ?? Gift;
  const statusStyle = STATUS_STYLES[row.status];

  return (
    <tr className="hover:bg-ink-50/60">
      <td className="px-4 py-3">
        <span className="font-medium text-brand-600">{row.distributionCode}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <ProgramIcon className="h-4 w-4" />
          </div>
          <span className="font-medium text-ink-800">{row.programName}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={row.farmerName} size={32} colorful />
          <div className="min-w-0">
            <div className="font-medium text-ink-800">{row.farmerName}</div>
            <div className="text-xs text-ink-400">{row.contactNumber}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-ink-500">{row.barangay}</td>
      <td className="px-4 py-3 text-ink-700">{row.assistanceType}</td>
      <td className="px-4 py-3">
        <div className="text-ink-700">{row.quantityLabel}</div>
        <div className="text-xs font-medium text-ink-500">
          {formatPeso(row.amountPeso)}
        </div>
      </td>
      <td className="px-4 py-3 text-ink-500">{formatDate(row.distributedAt)}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.pill}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </span>
      </td>
      <td className="px-4 py-3 text-ink-500">{row.distributedBy}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3"
            onClick={onView}
          >
            View
          </Button>
          <button
            type="button"
            className="rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            aria-label={`More actions for ${row.distributionCode}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
