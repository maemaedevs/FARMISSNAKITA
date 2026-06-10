import type { FarmerDetail } from '@/types';
import { FARMERS } from './farmers.data';

const JUAN_DETAIL: FarmerDetail = {
  id: '1',
  farmerCode: 'FARM-0001',
  registryId: 'FRM-2025-000124',
  name: 'Juan Dela Cruz',
  contactNumber: '0917 123 4567',
  email: 'juan.delacruz@email.com',
  address: 'Purok 3, San Isidro, Municipality of Farmville, Province',
  barangay: 'San Isidro',
  farmAreaHa: 2.45,
  primaryCrops: ['Rice', 'Corn'],
  status: 'active',
  registeredAt: '2025-01-15',
  age: 52,
  gender: 'Male',
  civilStatus: 'Married',
  birthday: 'March 12, 1973',
  placeOfBirth: 'San Isidro, Farmville',
  nationality: 'Filipino',
  occupation: 'Farmer',
  education: 'High School Graduate',
  householdSize: 5,
  primaryIncome: 'Farming',
  farmingExperienceYears: 25,
  mainCrop: 'Rice',
  otherCrops: 'Corn, Vegetables',
  livestock: 'Chicken, Carabao',
  farmingType: 'Smallholder',
  farmSizeHa: 2.45,
  landLocation: 'Sitio Maligaya, San Isidro',
  coordinates: '14.5892° N, 121.0428° E',
  landType: 'Owned',
  titleNo: 'TCT-12458-2020',
  verifiedBy: 'Maria Santos (Municipal Agriculturist)',
  verifiedAt: 'Jan 18, 2025 · 10:32 AM',
  notes:
    'Active farmer. Compliant with land documents. Recommended for upcoming seed distribution program.',
  landDocuments: [
    {
      id: 'd1',
      title: 'Land Title',
      status: 'verified',
      uploadedAt: '2025-01-12',
    },
    {
      id: 'd2',
      title: 'Tax Declaration',
      status: 'verified',
      uploadedAt: '2025-01-12',
    },
    {
      id: 'd3',
      title: 'Land ID / Sketch',
      status: 'verified',
      uploadedAt: '2025-01-14',
    },
    {
      id: 'd4',
      title: 'Barangay Clearance',
      status: 'verified',
      uploadedAt: '2025-01-15',
    },
  ],
};

function buildDetailFromList(id: string): FarmerDetail | null {
  const base = FARMERS.find((f) => f.id === id);
  if (!base) return null;
  if (id === '1') return JUAN_DETAIL;
  return {
    ...base,
    registryId: `FRM-2025-${base.farmerCode.replace('FARM-', '')}`,
    email: `${base.name.split(' ')[0].toLowerCase()}@email.com`,
    address: `Purok 1, ${base.barangay}, Municipality of Farmville`,
    age: 45,
    gender: 'Male',
    civilStatus: 'Married',
    birthday: '—',
    placeOfBirth: base.barangay,
    nationality: 'Filipino',
    occupation: 'Farmer',
    education: 'Elementary Graduate',
    householdSize: 4,
    primaryIncome: 'Farming',
    farmingExperienceYears: 15,
    mainCrop: base.primaryCrops[0] ?? 'Rice',
    otherCrops: base.primaryCrops.slice(1).join(', ') || '—',
    livestock: '—',
    farmingType: 'Smallholder',
    farmSizeHa: base.farmAreaHa,
    landLocation: base.barangay,
    coordinates: '—',
    landType: 'Owned',
    titleNo: '—',
    verifiedBy: 'Barangay Official',
    verifiedAt: formatShortDate(base.registeredAt),
    notes: 'Profile generated from registry listing.',
    landDocuments: [],
  };
}

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export function getFarmerDetail(id: string): FarmerDetail | null {
  return buildDetailFromList(id);
}
