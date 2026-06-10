/** Auth session role (login). Not used on the User Management page. */
export type AuthRole = 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AuthRole;
  avatarUrl?: string;
  createdAt: string;
}

/** Portal roles — no Admin or Super Admin. */
export type SystemUserRole =
  | 'municipal-agriculturist'
  | 'barangay-official'
  | 'encoder'
  | 'viewer'
  | 'data-verifier'
  | 'agriculture-officer';

export type SystemUserStatus = 'active' | 'inactive';

export interface SystemUser {
  id: string;
  userCode: string;
  name: string;
  username: string;
  email: string;
  role: SystemUserRole;
  status: SystemUserStatus;
  lastLoginAt: string;
  createdAt: string;
}

export type FarmerStatus = 'active' | 'inactive';

export interface Farmer {
  id: string;
  farmerCode: string;
  name: string;
  contactNumber: string;
  barangay: string;
  farmAreaHa: number;
  primaryCrops: string[];
  status: FarmerStatus;
  registeredAt: string;
}

export interface CreateFarmerInput {
  name: string;
  contactNumber: string;
  barangay: string;
  farmAreaHa: number;
  primaryCrops: string[];
  status: FarmerStatus;
  email?: string;
  birthday?: string;
  placeOfBirth?: string;
  nationality?: string;
  occupation?: string;
  education?: string;
  householdSize?: number;
  primaryIncome?: string;
}

export interface FarmerLandDocument {
  id: string;
  title: string;
  status: 'verified' | 'pending';
  fileUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  uploadedAt: string;
}

export interface FarmerDetail extends Farmer {
  registryId: string;
  email: string;
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
  landDocuments: FarmerLandDocument[];
  hasPassword?: boolean;
  avatarUrl?: string | null;
}

export interface AuthSession {
  token: string;
  user: User;
}

export type CropRecordStatus = 'growing' | 'harvested';

export interface CropRecord {
  id: string;
  cropCode: string;
  farmerId: string;
  farmerName: string;
  barangay: string;
  cropName: string;
  cropType: string;
  farmAreaHa: number;
  plantingDate: string;
  expectedHarvestDate: string;
  status: CropRecordStatus;
}

export interface CropRecordStats {
  total: number;
  active: number;
  harvested: number;
  thisMonth: number;
}

export interface CropRecordsResponse extends PaginatedResponse<CropRecord> {
  stats: CropRecordStats;
}

export interface CreateCropRecordInput {
  farmerId: string;
  cropName: string;
  cropType: string;
  farmAreaHa: number;
  plantingDate: string;
  expectedHarvestDate: string;
  status?: CropRecordStatus;
}

export type DistributionStatus = 'completed' | 'pending' | 'cancelled';

export interface AssistanceDistribution {
  id: string;
  distributionCode: string;
  programName: string;
  programIcon: string;
  farmerName: string;
  contactNumber: string;
  barangay: string;
  assistanceType: string;
  quantityLabel: string;
  amountPeso: number;
  distributedAt: string;
  status: DistributionStatus;
  distributedBy: string;
}

export interface DistributionStats {
  total: number;
  beneficiaries: number;
  totalAmount: number;
  thisMonth: number;
  completedThisYear: number;
}

export interface DistributionsResponse
  extends PaginatedResponse<AssistanceDistribution> {
  stats: DistributionStats;
}

export interface CreateDistributionInput {
  programId: string;
  /** Farmer id, or `all` to distribute to every active farmer. */
  farmerId: string | 'all';
  assistanceType: string;
  quantityLabel: string;
  amountPeso: number;
  distributedAt: string;
  status?: DistributionStatus;
  distributedBy: string;
}

export interface UpdateDistributionInput {
  status: DistributionStatus;
}

export type ProgramStatus = 'active' | 'inactive';

export type ProgramType =
  | 'Input Support'
  | 'Production Support'
  | 'Livestock'
  | 'Infrastructure';

export interface AssistanceProgram {
  id: string;
  programCode: string;
  name: string;
  tagline: string;
  programType: ProgramType;
  description: string;
  targetBeneficiaries: number;
  fundingSource: string;
  status: ProgramStatus;
  addedAt: string;
  icon: 'gift' | 'sprout' | 'wheat' | 'beef' | 'building' | 'tractor';
}

export interface ProgramStats {
  total: number;
  active: number;
  inactive: number;
  thisYear: number;
}

export interface ProgramsResponse extends PaginatedResponse<AssistanceProgram> {
  stats: ProgramStats;
}

export interface CreateProgramInput {
  name: string;
  tagline: string;
  programType: ProgramType;
  description: string;
  targetBeneficiaries: number;
  fundingSource: string;
  status?: ProgramStatus;
  icon?: AssistanceProgram['icon'];
}

export type TransactionType =
  | 'Assistance Distribution'
  | 'Farmer Registration'
  | 'Program Enrollment'
  | 'Crop Record'
  | 'Document Verification';

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'under_review';

export interface ApprovalTransaction {
  id: string;
  transactionCode: string;
  type: TransactionType;
  farmerName: string;
  barangay: string;
  subject: string;
  details: string;
  amountPeso?: number;
  submittedAt: string;
  submittedBy: string;
  status: ApprovalStatus;
}

export type DocumentCategory =
  | 'Land Title'
  | 'Tax Declaration'
  | 'Land ID / Sketch'
  | 'Barangay Clearance'
  | 'Valid ID'
  | 'RSBSA Form'
  | 'Farm Photo';

export type DocumentVerificationStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'needs_revision';

export interface DocumentSubmission {
  id: string;
  submissionCode: string;
  farmerId: string;
  farmerName: string;
  farmerRegistryId: string;
  barangay: string;
  documentType: DocumentCategory;
  linkedTo: string;
  fileName: string;
  submittedAt: string;
  submittedBy: string;
  status: DocumentVerificationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export type StockCategory =
  | 'Crops'
  | 'Fertilizers'
  | 'Equipment'
  | 'Seeds'
  | 'Pesticides'
  | 'Others';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface StockItem {
  id: string;
  stockCode: string;
  name: string;
  description: string;
  category: StockCategory;
  unit: string;
  quantity: number;
  unitValuePeso: number;
  status: StockStatus;
  updatedAt: string;
  icon: 'seed' | 'fertilizer' | 'equipment' | 'crop' | 'pesticide' | 'box';
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
