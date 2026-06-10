// Used to keep the admin UI contract usable when Postgres isn't set up yet.
// Once you run Prisma migrations, these are no longer used.

export type DevFarmer = {
  id: string;
  farmerCode: string;
  registryId: string;
  name: string;
  contactNumber: string;
  email: string;
  barangay: string;
  farmAreaHa: number;
  primaryCrops: string[];
  status: 'active' | 'inactive';
  registeredAt: string;

  // FarmerDetail fields
  address: string;
  age: number;
  gender: string;
  civilStatus: string;
  birthday: string;
  placeOfBirth: string;
  nationality: string;
  occupation: string;
  education: string;
  householdSize: number;
  primaryIncome: string;
  farmingExperienceYears: number;
  mainCrop: string;
  otherCrops: string;
  livestock: string;
  farmingType: string;
  farmSizeHa: number;
  landLocation: string;
  coordinates: string;
  landType: string;
  titleNo: string;
  verifiedBy: string;
  verifiedAt: string;
  notes: string;
  landDocuments: Array<{
    id: string;
    title: string;
    status: 'verified' | 'pending';
    uploadedAt: string;
  }>;
};

export const DEV_FARMERS: DevFarmer[] = [
  {
    id: 'far_0001',
    farmerCode: 'FARM-0001',
    registryId: 'REG-2025-0001',
    name: 'Juan Dela Cruz',
    contactNumber: '09171234567',
    email: 'juan.dela.cruz@farmis.local',
    barangay: 'San Isidro',
    farmAreaHa: 1.75,
    primaryCrops: ['Corn', 'Rice'],
    status: 'active',
    registeredAt: '2025-05-20T08:00:00.000Z',

    address: 'San Isidro, Example Province',
    age: 45,
    gender: 'Male',
    civilStatus: 'Married',
    birthday: '1981-05-12',
    placeOfBirth: 'Example City',
    nationality: 'Filipino',
    occupation: 'Farmer',
    education: 'High School',
    householdSize: 5,
    primaryIncome: 'Farming',
    farmingExperienceYears: 18,
    mainCrop: 'Corn',
    otherCrops: 'Rice',
    livestock: 'Chicken',
    farmingType: 'Mixed Farming',
    farmSizeHa: 1.75,
    landLocation: 'Brgy San Isidro',
    coordinates: '14.5892, 121.0428',
    landType: 'Irrigated',
    titleNo: 'TCT-123456',
    verifiedBy: 'Farmis Verifier',
    verifiedAt: '2025-06-01T08:00:00.000Z',
    notes: 'Sample seed data.',
    landDocuments: [
      {
        id: 'doc_0001',
        title: 'Land Title',
        status: 'verified',
        uploadedAt: '2025-05-22T10:00:00.000Z',
      },
      {
        id: 'doc_0002',
        title: 'Valid ID',
        status: 'pending',
        uploadedAt: '2025-05-23T10:00:00.000Z',
      },
    ],
  },
];

export type DevSystemUser = {
  id: string;
  userCode: string;
  name: string;
  username: string;
  email: string;
  role:
    | 'municipal-agriculturist'
    | 'barangay-official'
    | 'encoder'
    | 'viewer'
    | 'data-verifier'
    | 'agriculture-officer';
  status: 'active' | 'inactive';
  lastLoginAt: string;
  createdAt: string;
};

export const DEV_SYSTEM_USERS: DevSystemUser[] = [
  {
    id: 'sys_0001',
    userCode: 'USR-0001',
    name: 'Mun. Agri Officer',
    username: 'munagri',
    email: 'agri@farmis.local',
    role: 'municipal-agriculturist',
    status: 'active',
    lastLoginAt: '2025-06-01T08:00:00.000Z',
    createdAt: '2025-05-01T08:00:00.000Z',
  },
  {
    id: 'sys_0002',
    userCode: 'USR-0002',
    name: 'Brgy. Official',
    username: 'barangay',
    email: 'brgy@farmis.local',
    role: 'barangay-official',
    status: 'active',
    lastLoginAt: '2025-05-20T08:00:00.000Z',
    createdAt: '2025-05-02T08:00:00.000Z',
  },
];

export const DEV_PROGRAMS: Array<{
  id: string;
  programCode: string;
  name: string;
  tagline: string;
  programType: 'Input Support' | 'Production Support' | 'Livestock' | 'Infrastructure';
  description: string;
  targetBeneficiaries: number;
  fundingSource: string;
  status: 'active' | 'inactive';
  addedAt: string;
  icon: 'gift' | 'sprout' | 'wheat' | 'beef' | 'building' | 'tractor';
}> = [
  {
    id: 'prg_0001',
    programCode: 'PRG-INPUT-001',
    name: 'Input Support',
    tagline: 'Seeds & fertilizers for active growers',
    programType: 'Input Support',
    description: 'Provides quality inputs to help farmers increase yield.',
    targetBeneficiaries: 120,
    fundingSource: 'Agriculture Office Fund',
    status: 'active',
    addedAt: '2025-05-15T08:00:00.000Z',
    icon: 'sprout',
  },
  {
    id: 'prg_0002',
    programCode: 'PRG-PROD-001',
    name: 'Production Support',
    tagline: 'Training and production assistance',
    programType: 'Production Support',
    description:
      'Assistance focused on improving production methods.',
    targetBeneficiaries: 90,
    fundingSource: 'Municipal Development Fund',
    status: 'active',
    addedAt: '2025-05-18T08:00:00.000Z',
    icon: 'wheat',
  },
];

export const DEV_DISTRIBUTIONS: Array<{
  id: string;
  distributionCode: string;
  programId: string;
  programName: string;
  programTagline?: string;
  programType?: string;
  programIcon: string;
  farmerId: string;
  farmerName: string;
  contactNumber: string;
  barangay: string;
  assistanceType: string;
  quantityLabel: string;
  amountPeso: number;
  distributedAt: string;
  status: 'completed' | 'pending' | 'cancelled';
  distributedBy: string;
}> = [
  {
    id: 'dist_0001',
    distributionCode: 'DIST-0001',
    programId: 'prg_0001',
    programName: 'Input Support',
    programTagline: 'Seeds & fertilizers for active growers',
    programType: 'Input Support',
    programIcon: 'sprout',
    farmerId: 'far_0001',
    farmerName: 'Juan Dela Cruz',
    contactNumber: '09171234567',
    barangay: 'San Isidro',
    assistanceType: 'Fertilizer',
    quantityLabel: '5 bags (50kg)',
    amountPeso: 2500,
    distributedAt: '2025-05-05T08:00:00.000Z',
    status: 'completed',
    distributedBy: 'Agriculture Officer',
  },
  {
    id: 'dist_0002',
    distributionCode: 'DIST-0002',
    programId: 'prg_0002',
    programName: 'Production Support',
    programTagline: 'Training and production assistance',
    programType: 'Production Support',
    programIcon: 'wheat',
    farmerId: 'far_0001',
    farmerName: 'Juan Dela Cruz',
    contactNumber: '09171234567',
    barangay: 'San Isidro',
    assistanceType: 'Training materials',
    quantityLabel: '1 kit',
    amountPeso: 1200,
    distributedAt: '2025-05-18T08:00:00.000Z',
    status: 'pending',
    distributedBy: 'Barangay Official',
  },
];

export const DEV_SITUATION_REPORTS: Array<{
  id: string;
  reportCode: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  fullName: string;
  contactNumber: string;
  address: string;
  incidentTypes: string[];
  incidentOther: string | null;
  incidentAt: string;
  sitioPurok: string;
  barangay: string;
  mapLatitude: number | null;
  mapLongitude: number | null;
  cropType: string;
  estimatedAreaHa: number;
  estimatedLossPeso: number;
  damageDescription: string;
  photoCropUrl: string | null;
  photoLandslideUrl: string | null;
  photoOtherUrl: string | null;
  docProofOfLand: boolean;
  docListOfCrops: boolean;
  docValidId: boolean;
  docOther: boolean;
  documentUrl: string | null;
  documentName: string | null;
  declared: boolean;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
}> = [
  {
    id: 'sit_0001',
    reportCode: 'RPT-0001',
    status: 'pending',
    createdAt: new Date().toISOString(),
    fullName: DEV_FARMERS[0]?.name ?? 'Juan Dela Cruz',
    contactNumber: DEV_FARMERS[0]?.contactNumber ?? '09171234567',
    address: DEV_FARMERS[0]?.address ?? 'San Isidro, Example Province',
    incidentTypes: ['flood'],
    incidentOther: null,
    incidentAt: new Date().toISOString(),
    sitioPurok: 'Purok 3',
    barangay: 'San Isidro',
    mapLatitude: null,
    mapLongitude: null,
    cropType: 'Rice',
    estimatedAreaHa: 1.5,
    estimatedLossPeso: 5000,
    damageDescription: 'Flood water reached knee level and submerged rice plots.',
    photoCropUrl: '/uploads/situation-reports/sample-crop.jpg',
    photoLandslideUrl: null,
    photoOtherUrl: null,
    docProofOfLand: true,
    docListOfCrops: true,
    docValidId: false,
    docOther: false,
    documentUrl: null,
    documentName: null,
    declared: true,
    title: 'Rice damage report',
    description: 'Flood water reached knee level and submerged rice plots.',
    category: 'flood',
    imageUrl: '/uploads/situation-reports/sample-crop.jpg',
    farmerId: DEV_FARMERS[0]?.id ?? 'far_0001',
    farmerName: DEV_FARMERS[0]?.name ?? 'Juan Dela Cruz',
    farmerCode: DEV_FARMERS[0]?.farmerCode ?? 'FARM-0001',
  },
];

