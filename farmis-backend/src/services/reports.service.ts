import { prisma } from './prisma';
import { DEV_DISTRIBUTIONS, DEV_FARMERS, DEV_PROGRAMS } from './dev-data';

const CHART_COLORS = {
  active: '#22C55E',
  inactive: '#F59E0B',
  inputSupport: '#22C55E',
  productionSupport: '#0EA5E9',
  livestock: '#F59E0B',
  infrastructure: '#8B5CF6',
  training: '#EC4899',
  barangay: '#22C55E',
  municipal: '#0EA5E9',
  daGrant: '#8B5CF6',
  ngo: '#F59E0B',
  other: '#94A3B8',
} as const;

const PROGRAM_TYPE_COLORS: Record<string, string> = {
  'Input Support': CHART_COLORS.inputSupport,
  'Production Support': CHART_COLORS.productionSupport,
  Livestock: CHART_COLORS.livestock,
  Infrastructure: CHART_COLORS.infrastructure,
  'Training & Support': CHART_COLORS.training,
};

const FUNDING_SOURCE_COLORS: Record<string, string> = {
  'Barangay Funds': CHART_COLORS.barangay,
  'Municipal Funds': CHART_COLORS.municipal,
  'DA Grant': CHART_COLORS.daGrant,
  'NGO Partnership': CHART_COLORS.ngo,
  Others: CHART_COLORS.other,
};

export type ReportKpi = {
  value: number;
  delta: number;
  positive: boolean;
};

export type ReportChartSlice = {
  name: string;
  value: number;
  color: string;
};

export type ProgramPerformanceRow = {
  id: string;
  programCode: string;
  name: string;
  icon: string;
  programType: string;
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  fundingAllocated: number;
  amountUtilized: number;
  status: 'active' | 'inactive';
  progressPercent: number;
};

export type ReportsOverview = {
  dateRangeLabel: string;
  comparePeriod: string;
  kpis: {
    totalBeneficiaries: ReportKpi;
    totalPrograms: ReportKpi;
    totalFunding: ReportKpi;
    totalDistributions: ReportKpi;
  };
  programsByStatus: ReportChartSlice[];
  beneficiariesByType: ReportChartSlice[];
  fundingSources: ReportChartSlice[];
  programPerformance: ProgramPerformanceRow[];
  programPerformanceTotal: number;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formatDateRangeLabel(from: Date, to: Date) {
  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return `${from.toLocaleDateString('en-US', opts)} – ${to.toLocaleDateString('en-US', opts)}`;
}

function formatComparePeriod(date: Date) {
  const from = startOfMonth(date);
  const to = endOfMonth(date);
  return formatDateRangeLabel(from, to);
}

function pctChange(current: number, previous: number): ReportKpi {
  if (previous === 0) {
    return {
      value: current,
      delta: current > 0 ? 100 : 0,
      positive: current >= previous,
    };
  }
  const delta = ((current - previous) / previous) * 100;
  return {
    value: current,
    delta: Math.round(Math.abs(delta) * 10) / 10,
    positive: delta >= 0,
  };
}

function toPercentSlices(
  entries: Array<{ name: string; value: number; color: string }>,
): ReportChartSlice[] {
  const total = entries.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return entries.map((item) => ({ ...item, value: 0 }));
  }
  return entries.map((item) => ({
    name: item.name,
    color: item.color,
    value: Math.round((item.value / total) * 1000) / 10,
  }));
}

function fundingColor(source: string) {
  return FUNDING_SOURCE_COLORS[source] ?? CHART_COLORS.other;
}

function programTypeColor(programType: string) {
  return PROGRAM_TYPE_COLORS[programType] ?? CHART_COLORS.other;
}

type ProgramAgg = {
  id: string;
  programCode: string;
  name: string;
  icon: string;
  programType: string;
  targetBeneficiaries: number;
  fundingSource: string;
  status: string;
  actualBeneficiaries: number;
  fundingAllocated: number;
  amountUtilized: number;
};

function mapProgramPerformance(row: ProgramAgg): ProgramPerformanceRow {
  const progressPercent =
    row.targetBeneficiaries > 0
      ? Math.min(
          100,
          Math.round((row.actualBeneficiaries / row.targetBeneficiaries) * 100),
        )
      : 0;

  return {
    id: row.id,
    programCode: row.programCode,
    name: row.name,
    icon: row.icon,
    programType: row.programType,
    targetBeneficiaries: row.targetBeneficiaries,
    actualBeneficiaries: row.actualBeneficiaries,
    fundingAllocated: row.fundingAllocated,
    amountUtilized: row.amountUtilized,
    status: row.status === 'active' ? 'active' : 'inactive',
    progressPercent,
  };
}

export async function buildReportsOverview(options?: {
  programType?: string;
  page?: number;
  pageSize?: number;
}): Promise<ReportsOverview> {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const prevMonthStart = startOfMonth(
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
  );
  const prevMonthEnd = endOfMonth(
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
  );
  const currentMonthStart = startOfMonth(now);

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 12;
  const programTypeFilter =
    options?.programType && options.programType !== 'all'
      ? options.programType
      : undefined;

  const [programs, distributions, farmerCounts] = await Promise.all([
    prisma.assistanceProgram.findMany({
      orderBy: { addedAt: 'desc' },
      include: {
        distributions: {
          where: { status: { not: 'cancelled' } },
          select: {
            farmerId: true,
            amountPeso: true,
            status: true,
          },
        },
      },
    }),
    prisma.assistanceDistribution.findMany({
      where: { status: { not: 'cancelled' } },
      select: {
        amountPeso: true,
        status: true,
        distributedAt: true,
        farmerId: true,
        program: {
          select: { programType: true, fundingSource: true },
        },
      },
    }),
    Promise.all([
      prisma.farmer.count({ where: { status: 'active' } }),
      prisma.farmer.count({
        where: {
          status: 'active',
          registeredAt: { lt: currentMonthStart },
        },
      }),
      prisma.assistanceProgram.count(),
      prisma.assistanceProgram.count({
        where: { addedAt: { lt: currentMonthStart } },
      }),
      prisma.assistanceDistribution.count({
        where: { status: { not: 'cancelled' } },
      }),
      prisma.assistanceDistribution.count({
        where: {
          status: { not: 'cancelled' },
          createdAt: { lt: currentMonthStart },
        },
      }),
      prisma.assistanceDistribution.aggregate({
        where: { status: 'completed' },
        _sum: { amountPeso: true },
      }),
      prisma.assistanceDistribution.aggregate({
        where: {
          status: 'completed',
          distributedAt: { gte: prevMonthStart, lte: prevMonthEnd },
        },
        _sum: { amountPeso: true },
      }),
      prisma.assistanceDistribution.aggregate({
        where: {
          status: 'completed',
          distributedAt: { gte: currentMonthStart, lte: now },
        },
        _sum: { amountPeso: true },
      }),
    ]),
  ]);

  const [
    activeFarmers,
    activeFarmersBeforeMonth,
    totalPrograms,
    programsBeforeMonth,
    totalDistributions,
    distributionsBeforeMonth,
    totalFundingAgg,
    prevMonthFundingAgg,
    currentMonthFundingAgg,
  ] = farmerCounts;

  const totalFunding = totalFundingAgg._sum.amountPeso ?? 0;
  const prevMonthFunding = prevMonthFundingAgg._sum.amountPeso ?? 0;
  const currentMonthFunding = currentMonthFundingAgg._sum.amountPeso ?? 0;

  const activePrograms = programs.filter((p) => p.status === 'active').length;
  const inactivePrograms = programs.length - activePrograms;

  const beneficiariesByTypeMap = new Map<string, Set<string>>();
  for (const dist of distributions) {
    if (dist.status !== 'completed') continue;
    const type = dist.program.programType;
    const set = beneficiariesByTypeMap.get(type) ?? new Set<string>();
    set.add(dist.farmerId);
    beneficiariesByTypeMap.set(type, set);
  }

  const fundingSourceMap = new Map<string, number>();
  for (const dist of distributions) {
    if (dist.status !== 'completed') continue;
    const source = dist.program.fundingSource;
    fundingSourceMap.set(
      source,
      (fundingSourceMap.get(source) ?? 0) + dist.amountPeso,
    );
  }

  const programRows: ProgramAgg[] = programs.map((program) => {
    const completed = program.distributions.filter(
      (d) => d.status === 'completed',
    );
    const actualBeneficiaries = new Set(
      completed.map((d) => d.farmerId),
    ).size;
    const amountUtilized = completed.reduce((sum, d) => sum + d.amountPeso, 0);
    const fundingAllocated = program.distributions.reduce(
      (sum, d) => sum + d.amountPeso,
      0,
    );

    return {
      id: program.id,
      programCode: program.programCode,
      name: program.name,
      icon: program.icon,
      programType: program.programType,
      targetBeneficiaries: program.targetBeneficiaries,
      fundingSource: program.fundingSource,
      status: program.status,
      actualBeneficiaries,
      fundingAllocated: Math.max(fundingAllocated, amountUtilized),
      amountUtilized,
    };
  });

  const filteredPrograms = programTypeFilter
    ? programRows.filter((row) => row.programType === programTypeFilter)
    : programRows;

  const programPerformanceTotal = filteredPrograms.length;
  const skip = (page - 1) * pageSize;
  const paginatedPrograms = filteredPrograms
    .slice(skip, skip + pageSize)
    .map(mapProgramPerformance);

  return {
    dateRangeLabel: formatDateRangeLabel(yearStart, now),
    comparePeriod: formatComparePeriod(
      new Date(now.getFullYear(), now.getMonth() - 1, 1),
    ),
    kpis: {
      totalBeneficiaries: pctChange(activeFarmers, activeFarmersBeforeMonth),
      totalPrograms: pctChange(totalPrograms, programsBeforeMonth),
      totalFunding: {
        value: totalFunding,
        ...(() => {
          const change = pctChange(currentMonthFunding, prevMonthFunding);
          return { delta: change.delta, positive: change.positive };
        })(),
      },
      totalDistributions: pctChange(
        totalDistributions,
        distributionsBeforeMonth,
      ),
    },
    programsByStatus: [
      { name: 'Active', value: activePrograms, color: CHART_COLORS.active },
      {
        name: 'Inactive',
        value: inactivePrograms,
        color: CHART_COLORS.inactive,
      },
    ],
    beneficiariesByType: toPercentSlices(
      [...beneficiariesByTypeMap.entries()].map(([name, farmers]) => ({
        name,
        value: farmers.size,
        color: programTypeColor(name),
      })),
    ),
    fundingSources: toPercentSlices(
      [...fundingSourceMap.entries()].map(([name, value]) => ({
        name,
        value,
        color: fundingColor(name),
      })),
    ),
    programPerformance: paginatedPrograms,
    programPerformanceTotal,
  };
}

export function buildDevReportsOverview(options?: {
  programType?: string;
  page?: number;
  pageSize?: number;
}): ReportsOverview {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 12;
  const programTypeFilter =
    options?.programType && options.programType !== 'all'
      ? options.programType
      : undefined;

  const activeFarmers = DEV_FARMERS.filter((f) => f.status === 'active').length;
  const activePrograms = DEV_PROGRAMS.filter((p) => p.status === 'active').length;
  const inactivePrograms = DEV_PROGRAMS.length - activePrograms;

  const completedDists = DEV_DISTRIBUTIONS.filter(
    (d) => d.status === 'completed',
  );
  const totalFunding = completedDists.reduce((sum, d) => sum + d.amountPeso, 0);

  const beneficiariesByTypeMap = new Map<string, Set<string>>();
  for (const dist of completedDists) {
    const type = dist.programType ?? 'Input Support';
    const set = beneficiariesByTypeMap.get(type) ?? new Set<string>();
    set.add(dist.farmerId);
    beneficiariesByTypeMap.set(type, set);
  }

  const programRows: ProgramAgg[] = DEV_PROGRAMS.map((program) => {
    const related = DEV_DISTRIBUTIONS.filter(
      (d) => d.programId === program.id && d.status !== 'cancelled',
    );
    const completed = related.filter((d) => d.status === 'completed');
    const actualBeneficiaries = new Set(
      completed.map((d) => d.farmerId),
    ).size;
    const amountUtilized = completed.reduce((sum, d) => sum + d.amountPeso, 0);
    const fundingAllocated = related.reduce((sum, d) => sum + d.amountPeso, 0);

    return {
      id: program.id,
      programCode: program.programCode,
      name: program.name,
      icon: program.icon,
      programType: program.programType,
      targetBeneficiaries: program.targetBeneficiaries,
      fundingSource: program.fundingSource,
      status: program.status,
      actualBeneficiaries,
      fundingAllocated: Math.max(fundingAllocated, amountUtilized),
      amountUtilized,
    };
  });

  const filteredPrograms = programTypeFilter
    ? programRows.filter((row) => row.programType === programTypeFilter)
    : programRows;

  const programPerformanceTotal = filteredPrograms.length;
  const skip = (page - 1) * pageSize;

  const fundingSourceMap = new Map<string, number>();
  for (const program of DEV_PROGRAMS) {
    fundingSourceMap.set(
      program.fundingSource,
      (fundingSourceMap.get(program.fundingSource) ?? 0) +
        (completedDists.find((d) => d.programId === program.id)?.amountPeso ??
          0),
    );
  }

  return {
    dateRangeLabel: formatDateRangeLabel(yearStart, now),
    comparePeriod: formatComparePeriod(
      new Date(now.getFullYear(), now.getMonth() - 1, 1),
    ),
    kpis: {
      totalBeneficiaries: { value: activeFarmers, delta: 0, positive: true },
      totalPrograms: { value: DEV_PROGRAMS.length, delta: 0, positive: true },
      totalFunding: { value: totalFunding, delta: 0, positive: true },
      totalDistributions: {
        value: DEV_DISTRIBUTIONS.length,
        delta: 0,
        positive: true,
      },
    },
    programsByStatus: [
      { name: 'Active', value: activePrograms, color: CHART_COLORS.active },
      {
        name: 'Inactive',
        value: inactivePrograms,
        color: CHART_COLORS.inactive,
      },
    ],
    beneficiariesByType: toPercentSlices(
      [...beneficiariesByTypeMap.entries()].map(([name, farmers]) => ({
        name,
        value: farmers.size,
        color: programTypeColor(name),
      })),
    ),
    fundingSources: toPercentSlices(
      [...fundingSourceMap.entries()].map(([name, value]) => ({
        name,
        value,
        color: fundingColor(name),
      })),
    ),
    programPerformance: filteredPrograms
      .slice(skip, skip + pageSize)
      .map(mapProgramPerformance),
    programPerformanceTotal,
  };
}
