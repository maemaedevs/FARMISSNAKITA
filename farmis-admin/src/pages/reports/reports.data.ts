import type { ProgramType } from '@/types';

export const REPORT_KPIS = {
  totalBeneficiaries: { value: 1240, delta: 12.5, positive: true },
  totalPrograms: { value: 12, delta: 2, positive: true, isCount: true },
  totalFunding: { value: 2_450_000, delta: 8.3, positive: true },
  totalDistributions: { value: 18, delta: 3, positive: true, isCount: true },
} as const;

export const COMPARE_PERIOD = 'Dec 01 – Dec 31, 2024';
export const DATE_RANGE_LABEL = 'Jan 01, 2025 – May 10, 2025';

export const PROGRAMS_BY_STATUS = [
  { name: 'Active', value: 9, color: '#22C55E' },
  { name: 'Inactive', value: 3, color: '#F59E0B' },
];

export const BENEFICIARIES_BY_TYPE = [
  { name: 'Production Support', value: 41.9, color: '#0EA5E9' },
  { name: 'Input Support', value: 22.6, color: '#22C55E' },
  { name: 'Livestock', value: 16.1, color: '#F59E0B' },
  { name: 'Infrastructure', value: 12.9, color: '#8B5CF6' },
  { name: 'Training & Support', value: 6.5, color: '#EC4899' },
];

export const FUNDING_SOURCES = [
  { name: 'Barangay Funds', value: 35.9, color: '#22C55E' },
  { name: 'Municipal Funds', value: 30.6, color: '#0EA5E9' },
  { name: 'DA Grant', value: 21.2, color: '#8B5CF6' },
  { name: 'NGO Partnership', value: 8.2, color: '#F59E0B' },
  { name: 'Others', value: 4.1, color: '#94A3B8' },
];

export interface ProgramPerformanceRow {
  id: string;
  programCode: string;
  name: string;
  icon: 'gift' | 'sprout' | 'wheat' | 'beef' | 'building' | 'tractor';
  programType: ProgramType | 'Training & Support';
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  fundingAllocated: number;
  amountUtilized: number;
  status: 'active' | 'inactive';
  progressPercent: number;
}

export const PROGRAM_PERFORMANCE: ProgramPerformanceRow[] = [
  {
    id: '1',
    programCode: 'PRG-001',
    name: 'Seed & Fertilizer Program',
    icon: 'sprout',
    programType: 'Input Support',
    targetBeneficiaries: 150,
    actualBeneficiaries: 145,
    fundingAllocated: 375_000,
    amountUtilized: 364_000,
    status: 'active',
    progressPercent: 97,
  },
  {
    id: '2',
    programCode: 'PRG-002',
    name: 'Rice Seed Subsidy',
    icon: 'gift',
    programType: 'Input Support',
    targetBeneficiaries: 200,
    actualBeneficiaries: 188,
    fundingAllocated: 450_000,
    amountUtilized: 423_000,
    status: 'active',
    progressPercent: 94,
  },
  {
    id: '3',
    programCode: 'PRG-003',
    name: 'Livestock Support',
    icon: 'beef',
    programType: 'Livestock',
    targetBeneficiaries: 80,
    actualBeneficiaries: 74,
    fundingAllocated: 320_000,
    amountUtilized: 298_000,
    status: 'active',
    progressPercent: 92,
  },
  {
    id: '4',
    programCode: 'PRG-004',
    name: 'Corn Production Aid',
    icon: 'wheat',
    programType: 'Production Support',
    targetBeneficiaries: 120,
    actualBeneficiaries: 107,
    fundingAllocated: 280_000,
    amountUtilized: 249_000,
    status: 'active',
    progressPercent: 89,
  },
  {
    id: '5',
    programCode: 'PRG-005',
    name: 'Irrigation Infrastructure',
    icon: 'building',
    programType: 'Infrastructure',
    targetBeneficiaries: 300,
    actualBeneficiaries: 225,
    fundingAllocated: 600_000,
    amountUtilized: 450_000,
    status: 'inactive',
    progressPercent: 75,
  },
  {
    id: '6',
    programCode: 'PRG-006',
    name: 'Vegetable Seeds Program',
    icon: 'sprout',
    programType: 'Input Support',
    targetBeneficiaries: 95,
    actualBeneficiaries: 91,
    fundingAllocated: 190_000,
    amountUtilized: 182_000,
    status: 'active',
    progressPercent: 96,
  },
  {
    id: '7',
    programCode: 'PRG-007',
    name: 'Animal Feed Assistance',
    icon: 'beef',
    programType: 'Livestock',
    targetBeneficiaries: 60,
    actualBeneficiaries: 58,
    fundingAllocated: 168_000,
    amountUtilized: 162_000,
    status: 'active',
    progressPercent: 97,
  },
  {
    id: '8',
    programCode: 'PRG-008',
    name: 'Farm Mechanization',
    icon: 'tractor',
    programType: 'Production Support',
    targetBeneficiaries: 110,
    actualBeneficiaries: 98,
    fundingAllocated: 410_000,
    amountUtilized: 385_000,
    status: 'inactive',
    progressPercent: 88,
  },
  {
    id: '9',
    programCode: 'PRG-009',
    name: 'Farmer Training Series',
    icon: 'gift',
    programType: 'Training & Support',
    targetBeneficiaries: 80,
    actualBeneficiaries: 72,
    fundingAllocated: 120_000,
    amountUtilized: 108_000,
    status: 'active',
    progressPercent: 90,
  },
  {
    id: '10',
    programCode: 'PRG-010',
    name: 'Organic Farming Transition',
    icon: 'sprout',
    programType: 'Production Support',
    targetBeneficiaries: 65,
    actualBeneficiaries: 60,
    fundingAllocated: 195_000,
    amountUtilized: 180_000,
    status: 'active',
    progressPercent: 92,
  },
  {
    id: '11',
    programCode: 'PRG-011',
    name: 'Post-Harvest Facilities',
    icon: 'building',
    programType: 'Infrastructure',
    targetBeneficiaries: 150,
    actualBeneficiaries: 120,
    fundingAllocated: 520_000,
    amountUtilized: 416_000,
    status: 'active',
    progressPercent: 80,
  },
  {
    id: '12',
    programCode: 'PRG-012',
    name: 'Youth Agri-Entrepreneurship',
    icon: 'wheat',
    programType: 'Training & Support',
    targetBeneficiaries: 40,
    actualBeneficiaries: 38,
    fundingAllocated: 85_000,
    amountUtilized: 80_750,
    status: 'active',
    progressPercent: 95,
  },
];

export const TOTAL_PROGRAM_ROWS = PROGRAM_PERFORMANCE.length;
