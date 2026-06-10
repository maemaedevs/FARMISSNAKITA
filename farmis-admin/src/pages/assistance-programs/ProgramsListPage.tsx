import { useState } from 'react';
import {
  Beef,
  Building2,
  Download,
  Filter,
  Gift,
  HandHeart,
  MoreVertical,
  PauseCircle,
  Pencil,
  Plus,
  Rocket,
  Search,
  Sprout,
  Tractor,
  Wheat,
  Calendar,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, Select } from '@/components/common';
import { Pagination, StatCard } from '@/components/list';
import { formatDate, formatNumber } from '@/utils/format';
import type {
  AssistanceProgram,
  ProgramStatus,
  ProgramType,
  ProgramsResponse,
} from '@/types';
import { api } from '@/services/api';
import { AddProgramModal } from './AddProgramModal';

const PROGRAM_ICONS: Record<AssistanceProgram['icon'], LucideIcon> = {
  gift: Gift,
  sprout: Sprout,
  wheat: Wheat,
  beef: Beef,
  building: Building2,
  tractor: Tractor,
};

const TYPE_STYLES: Record<ProgramType, string> = {
  'Input Support': 'bg-emerald-50 text-emerald-700',
  'Production Support': 'bg-sky-50 text-sky-700',
  Livestock: 'bg-amber-50 text-amber-700',
  Infrastructure: 'bg-violet-50 text-violet-700',
};

export default function ProgramsListPage() {
  const [query, setQuery] = useState('');
  const [programType, setProgramType] = useState<'all' | ProgramType>('all');
  const [status, setStatus] = useState<'all' | ProgramStatus>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data, isLoading } = useQuery<ProgramsResponse>({
    queryKey: ['programs', { page, pageSize, query, programType, status }] as const,
    queryFn: async (): Promise<ProgramsResponse> => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (query.trim()) params.set('query', query.trim());
      if (programType !== 'all') params.set('programType', programType);
      if (status !== 'all') params.set('status', status);

      const res = await api.get<ProgramsResponse>(`/admin/programs?${params.toString()}`);
      return res.data;
    },
  });

  const programs = data?.data ?? [];
  const stats = data?.stats;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <HandHeart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink-800">PROGRAMS LIST</h1>
            <p className="mt-0.5 text-sm text-ink-400">
              Manage assistance programs offered to farmers
            </p>
          </div>
        </div>

        <Button
          className="self-start sm:self-center"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Program
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Programs"
          value={formatNumber(stats?.total ?? 0)}
          hint="All Time"
          icon={Gift}
          tone="brand"
        />
        <StatCard
          label="Active Programs"
          value={formatNumber(stats?.active ?? 0)}
          hint="Currently Running"
          icon={Rocket}
          tone="sky"
        />
        <StatCard
          label="Inactive Programs"
          value={formatNumber(stats?.inactive ?? 0)}
          hint="Paused or Ended"
          icon={PauseCircle}
          tone="amber"
        />
        <StatCard
          label="This Year Added"
          value={formatNumber(stats?.thisYear ?? 0)}
          hint="Current year"
          icon={Calendar}
          tone="violet"
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <Input
              placeholder="Search by program name or type..."
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
                value={programType}
                onChange={(e) => {
                  setProgramType(e.target.value as 'all' | ProgramType);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Program Types' },
                  { value: 'Input Support', label: 'Input Support' },
                  { value: 'Production Support', label: 'Production Support' },
                  { value: 'Livestock', label: 'Livestock' },
                  { value: 'Infrastructure', label: 'Infrastructure' },
                ]}
              />
            </div>

            <div className="w-full sm:w-36">
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as 'all' | ProgramStatus);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Program Name</th>
                <th className="px-4 py-3 font-semibold">Program Type</th>
                <th className="min-w-[200px] px-4 py-3 font-semibold">
                  Description
                </th>
                <th className="px-4 py-3 font-semibold">Target Beneficiaries</th>
                <th className="px-4 py-3 font-semibold">Funding Source</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date Added</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {programs.map((row) => (
                <ProgramRow key={row.id} row={row} />
              ))}
              {!isLoading && programs.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-ink-400"
                  >
                    No programs match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={data?.total ?? 0}
          itemCount={programs.length}
          entityLabel="programs"
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <AddProgramModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  );
}

function ProgramRow({ row }: { row: AssistanceProgram }) {
  const Icon = PROGRAM_ICONS[row.icon];
  const isActive = row.status === 'active';

  return (
    <tr className="hover:bg-ink-50/60">
      <td className="px-4 py-3 font-medium text-ink-700">{row.programCode}</td>
      <td className="px-4 py-3">
        <div className="flex items-start gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-ink-800">{row.name}</div>
            <div className="text-xs text-ink-400">{row.tagline}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[row.programType]}`}
        >
          {row.programType}
        </span>
      </td>
      <td className="max-w-xs px-4 py-3 text-ink-500">
        <p className="line-clamp-2">{row.description}</p>
      </td>
      <td className="px-4 py-3 text-ink-700">
        {formatNumber(row.targetBeneficiaries)} Farmers
      </td>
      <td className="px-4 py-3 text-ink-500">{row.fundingSource}</td>
      <td className="px-4 py-3">
        <span
          className={
            isActive
              ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'
              : 'inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700'
          }
        >
          <span
            className={
              isActive
                ? 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                : 'h-1.5 w-1.5 rounded-full bg-amber-500'
            }
          />
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-ink-500">{formatDate(row.addedAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <Button variant="secondary" size="sm" className="h-8 px-3">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <button
            type="button"
            className="rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            aria-label={`More actions for ${row.name}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
