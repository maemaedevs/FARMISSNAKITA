import type { AssistanceProgram } from '@/types';

export const TOTAL_PROGRAMS = 12;
export const ACTIVE_PROGRAMS = 9;
export const INACTIVE_PROGRAMS = 3;
export const PROGRAMS_THIS_YEAR = 4;

export const PROGRAMS: AssistanceProgram[] = [
  {
    id: '1',
    programCode: 'PRG-001',
    name: 'Seed & Fertilizer Program',
    tagline: 'Subsidized seeds and fertilizer for smallholders',
    programType: 'Input Support',
    description:
      'Provides certified seeds and organic fertilizer packages to registered farmers during planting season.',
    targetBeneficiaries: 150,
    fundingSource: 'Barangay Funds',
    status: 'active',
    addedAt: '2025-01-10',
    icon: 'sprout',
  },
  {
    id: '2',
    programCode: 'PRG-002',
    name: 'Rice Seed Subsidy',
    tagline: 'Inbred and hybrid rice seed assistance',
    programType: 'Input Support',
    description:
      'Distributes quality inbred rice seeds to increase yield and food security in the barangay.',
    targetBeneficiaries: 200,
    fundingSource: 'Municipal Funds',
    status: 'active',
    addedAt: '2025-01-15',
    icon: 'gift',
  },
  {
    id: '3',
    programCode: 'PRG-003',
    name: 'Livestock Support',
    tagline: 'Feeds and veterinary aid for livestock raisers',
    programType: 'Livestock',
    description:
      'Supports backyard livestock farmers with feeds, deworming, and basic veterinary services.',
    targetBeneficiaries: 80,
    fundingSource: 'DA Grant',
    status: 'active',
    addedAt: '2025-02-01',
    icon: 'beef',
  },
  {
    id: '4',
    programCode: 'PRG-004',
    name: 'Corn Production Aid',
    tagline: 'Hybrid corn seed and technical assistance',
    programType: 'Production Support',
    description:
      'Helps corn farmers access hybrid seeds and field training on modern production practices.',
    targetBeneficiaries: 120,
    fundingSource: 'Municipal Funds',
    status: 'active',
    addedAt: '2025-02-18',
    icon: 'wheat',
  },
  {
    id: '5',
    programCode: 'PRG-005',
    name: 'Irrigation Infrastructure',
    tagline: 'Communal irrigation canal improvement',
    programType: 'Infrastructure',
    description:
      'Funds repair and maintenance of communal irrigation systems serving multiple sitios.',
    targetBeneficiaries: 300,
    fundingSource: 'DA Grant',
    status: 'inactive',
    addedAt: '2024-11-20',
    icon: 'building',
  },
  {
    id: '6',
    programCode: 'PRG-006',
    name: 'Vegetable Seeds Program',
    tagline: 'High-value vegetable seed starter kits',
    programType: 'Input Support',
    description:
      'Starter kits for leafy vegetables and high-value crops for household and market production.',
    targetBeneficiaries: 95,
    fundingSource: 'Barangay Funds',
    status: 'active',
    addedAt: '2025-03-05',
    icon: 'sprout',
  },
  {
    id: '7',
    programCode: 'PRG-007',
    name: 'Animal Feed Assistance',
    tagline: 'Emergency feed support during dry season',
    programType: 'Livestock',
    description:
      'Emergency distribution of animal feeds when pasture and forage are limited.',
    targetBeneficiaries: 60,
    fundingSource: 'Barangay Funds',
    status: 'active',
    addedAt: '2025-03-22',
    icon: 'beef',
  },
  {
    id: '8',
    programCode: 'PRG-008',
    name: 'Farm Mechanization',
    tagline: 'Shared equipment and hand tractor access',
    programType: 'Production Support',
    description:
      'Provides access to shared farm equipment and hand tractors for land preparation.',
    targetBeneficiaries: 110,
    fundingSource: 'Municipal Funds',
    status: 'inactive',
    addedAt: '2024-10-08',
    icon: 'tractor',
  },
];
