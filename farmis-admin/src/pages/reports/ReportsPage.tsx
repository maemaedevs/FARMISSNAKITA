import { useMemo, useState } from 'react';
import {
  Beef,
  Building2,
  CalendarRange,
  Download,
  FileText,
  Gift,
  HandCoins,
  Layers,
  Loader2,
  MoreVertical,
  Sprout,
  Tractor,
  Truck,
  Users,
  Wheat,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Select } from '@/components/common';
import { Pagination } from '@/components/list';
import { cn } from '@/lib/cn';
import { api } from '@/services/api';
import type { ProgramPerformanceRow, ReportsOverview } from '@/types';
import { formatNumber, formatPeso } from '@/utils/format';
import { DonutChartCard } from './DonutChartCard';
import { FieldReportsTab } from './FieldReportsTab';
import { KpiCard } from './KpiCard';

type ReportTab =
  | 'field-reports'
  | 'overview'
  | 'program-performance'
  | 'beneficiary-summary'
  | 'funding-summary'
  | 'distribution-summary';

const TABS: { id: ReportTab; label: string }[] = [
  { id: 'field-reports', label: 'Field Reports' },
  { id: 'overview', label: 'Overview' },
  { id: 'program-performance', label: 'Program Performance' },
  { id: 'beneficiary-summary', label: 'Beneficiary Summary' },
  { id: 'funding-summary', label: 'Funding Summary' },
  { id: 'distribution-summary', label: 'Distribution Summary' },
];

const TYPE_STYLES: Record<string, string> = {
  'Input Support': 'bg-emerald-50 text-emerald-700',
  'Production Support': 'bg-sky-50 text-sky-700',
  Livestock: 'bg-amber-50 text-amber-700',
  Infrastructure: 'bg-violet-50 text-violet-700',
  'Training & Support': 'bg-pink-50 text-pink-700',
};

const PROGRAM_ICONS: Record<ProgramPerformanceRow['icon'], LucideIcon> = {
  gift: Gift,
  sprout: Sprout,
  wheat: Wheat,
  beef: Beef,
  building: Building2,
  tractor: Tractor,
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('field-reports');
  const [programType, setProgramType] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data, isLoading, isError } = useQuery<ReportsOverview>({
    queryKey: ['reports', 'overview', { programType, page, pageSize }] as const,
    enabled: activeTab === 'overview',
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (programType !== 'all') params.set('programType', programType);
      const res = await api.get<ReportsOverview>(
        `/admin/reports/overview?${params.toString()}`,
      );
      return res.data;
    },
  });

  const paginatedPrograms = useMemo(
    () => ({
      rows: data?.programPerformance ?? [],
      total: data?.programPerformanceTotal ?? 0,
    }),
    [data],
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink-800">REPORTS</h1>
            <p className="mt-0.5 text-sm text-ink-400">
              View and analyze program assistance, beneficiaries, and
              performance
            </p>
          </div>
        </div>

        <Button className="self-start sm:self-center">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition',
                activeTab === tab.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-ink-500 ring-1 ring-ink-100 hover:bg-ink-50',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 text-xs font-medium text-ink-600 transition hover:bg-ink-50"
            >
              <CalendarRange className="h-4 w-4 text-ink-400" />
              {data?.dateRangeLabel ?? 'Loading…'}
            </button>
            <div className="w-44">
              <Select
                value={programType}
                onChange={(e) => {
                  setProgramType(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Program Types' },
                  { value: 'Input Support', label: 'Input Support' },
                  { value: 'Production Support', label: 'Production Support' },
                  { value: 'Livestock', label: 'Livestock' },
                  { value: 'Infrastructure', label: 'Infrastructure' },
                  {
                    value: 'Training & Support',
                    label: 'Training & Support',
                  },
                ]}
              />
            </div>
          </div>
        ) : null}
      </div>

      {activeTab === 'field-reports' ? (
        <FieldReportsTab />
      ) : isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : isError || !data ? (
        <div className="rounded-[var(--radius-card)] border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700">
          Could not load reports. Check that the backend is running and try
          again.
        </div>
      ) : activeTab === 'overview' ? (
        <OverviewContent
          data={data}
          page={page}
          pageSize={pageSize}
          paginatedPrograms={paginatedPrograms}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      ) : (
        <TabPlaceholder tab={activeTab} />
      )}
    </>
  );
}

function OverviewContent({
  data,
  page,
  pageSize,
  paginatedPrograms,
  onPageChange,
  onPageSizeChange,
}: {
  data: ReportsOverview;
  page: number;
  pageSize: number;
  paginatedPrograms: { rows: ProgramPerformanceRow[]; total: number };
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  const kpi = data.kpis;

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Beneficiaries"
          value={formatNumber(kpi.totalBeneficiaries.value)}
          delta={kpi.totalBeneficiaries.delta}
          positive={kpi.totalBeneficiaries.positive}
          comparePeriod={data.comparePeriod}
          icon={Users}
          tone="emerald"
        />
        <KpiCard
          label="Total Programs"
          value={formatNumber(kpi.totalPrograms.value)}
          delta={kpi.totalPrograms.delta}
          positive={kpi.totalPrograms.positive}
          comparePeriod={data.comparePeriod}
          icon={Layers}
          tone="sky"
        />
        <KpiCard
          label="Total Funding"
          value={formatPeso(kpi.totalFunding.value)}
          delta={kpi.totalFunding.delta}
          positive={kpi.totalFunding.positive}
          comparePeriod={data.comparePeriod}
          icon={HandCoins}
          tone="amber"
        />
        <KpiCard
          label="Total Distributions"
          value={formatNumber(kpi.totalDistributions.value)}
          delta={kpi.totalDistributions.delta}
          positive={kpi.totalDistributions.positive}
          comparePeriod={data.comparePeriod}
          icon={Truck}
          tone="violet"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DonutChartCard
          title="Programs by Status"
          data={data.programsByStatus}
          mode="count"
        />
        <DonutChartCard
          title="Beneficiaries by Program Type"
          data={data.beneficiariesByType}
          mode="percent"
        />
        <DonutChartCard
          title="Funding Source Breakdown"
          data={data.fundingSources}
          mode="percent"
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
        <div className="border-b border-ink-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-ink-800">
            Program Performance Summary
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Program Name</th>
                <th className="px-4 py-3 font-semibold">Program Type</th>
                <th className="px-4 py-3 font-semibold">
                  Target vs. Actual Beneficiaries
                </th>
                <th className="px-4 py-3 font-semibold">
                  Funding Allocated vs. Utilized
                </th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {paginatedPrograms.rows.map((row) => (
                <PerformanceRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={paginatedPrograms.total}
          itemCount={paginatedPrograms.rows.length}
          entityLabel="programs"
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </>
  );
}

function PerformanceRow({ row }: { row: ProgramPerformanceRow }) {
  const Icon = PROGRAM_ICONS[row.icon];
  const isActive = row.status === 'active';

  return (
    <tr className="hover:bg-ink-50/60">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs text-ink-400">{row.programCode}</div>
            <div className="font-medium text-ink-800">{row.name}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[row.programType] ?? 'bg-ink-100 text-ink-600'}`}
        >
          {row.programType}
        </span>
      </td>
      <td className="px-4 py-3 text-ink-700">
        <span className="font-medium">{row.targetBeneficiaries}</span>
        <span className="text-ink-400"> vs </span>
        <span className="font-medium text-brand-700">
          {row.actualBeneficiaries}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="text-ink-700">{formatPeso(row.fundingAllocated)}</div>
        <div className="text-xs text-ink-500">
          utilized {formatPeso(row.amountUtilized)}
        </div>
      </td>
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
      <td className="min-w-[120px] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${row.progressPercent}%` }}
            />
          </div>
          <span className="w-8 text-xs font-medium text-ink-600">
            {row.progressPercent}%
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          className="rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          aria-label={`Actions for ${row.name}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function TabPlaceholder({ tab }: { tab: ReportTab }) {
  const labels: Record<
    Exclude<ReportTab, 'overview' | 'field-reports'>,
    string
  > = {
    'program-performance': 'Program Performance',
    'beneficiary-summary': 'Beneficiary Summary',
    'funding-summary': 'Funding Summary',
    'distribution-summary': 'Distribution Summary',
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
      <FileText className="mx-auto h-10 w-10 text-brand-500" />
      <h2 className="mt-4 text-base font-semibold text-ink-800">
        {labels[tab as Exclude<ReportTab, 'overview' | 'field-reports'>]}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
        Detailed{' '}
        {labels[tab as Exclude<ReportTab, 'overview' | 'field-reports'>].toLowerCase()}{' '}
        charts and export options will be available here. Use the Overview tab
        for the full dashboard summary.
      </p>
    </div>
  );
}
