import type { SystemUser, SystemUserRole } from '@/types';

export const TOTAL_USERS = 28;
export const ACTIVE_USERS = 24;
export const INACTIVE_USERS = 4;
export const SYSTEM_ROLE_COUNT = 6;

export const SYSTEM_ROLES: readonly {
  value: SystemUserRole;
  label: string;
}[] = [
  { value: 'municipal-agriculturist', label: 'Municipal Agriculturist' },
  { value: 'barangay-official', label: 'Barangay Official' },
  { value: 'encoder', label: 'Encoder' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'data-verifier', label: 'Data Verifier' },
  { value: 'agriculture-officer', label: 'Agriculture Officer' },
] as const;

export const SYSTEM_USERS: SystemUser[] = [
  {
    id: '1',
    userCode: 'USR-001',
    name: 'Maria Santos',
    username: 'maria.santos',
    email: 'maria.santos@municipality.gov.ph',
    role: 'municipal-agriculturist',
    status: 'active',
    lastLoginAt: '2025-05-10T09:30:00',
    createdAt: '2024-08-15',
  },
  {
    id: '2',
    userCode: 'USR-002',
    name: 'Roberto Mendoza',
    username: 'roberto.mendoza',
    email: 'roberto.mendoza@barangay.gov.ph',
    role: 'barangay-official',
    status: 'active',
    lastLoginAt: '2025-05-22T08:15:00',
    createdAt: '2024-09-01',
  },
  {
    id: '3',
    userCode: 'USR-003',
    name: 'Jenny Cruz',
    username: 'jenny.cruz',
    email: 'jenny.cruz@municipality.gov.ph',
    role: 'encoder',
    status: 'active',
    lastLoginAt: '2025-05-21T14:45:00',
    createdAt: '2024-10-12',
  },
  {
    id: '4',
    userCode: 'USR-004',
    name: 'Carlos Rivera',
    username: 'carlos.rivera',
    email: 'carlos.rivera@municipality.gov.ph',
    role: 'agriculture-officer',
    status: 'active',
    lastLoginAt: '2025-05-20T11:20:00',
    createdAt: '2024-11-05',
  },
  {
    id: '5',
    userCode: 'USR-005',
    name: 'Elena Torres',
    username: 'elena.torres',
    email: 'elena.torres@barangay.gov.ph',
    role: 'data-verifier',
    status: 'active',
    lastLoginAt: '2025-05-19T16:00:00',
    createdAt: '2025-01-08',
  },
  {
    id: '6',
    userCode: 'USR-006',
    name: 'Mark Anthony Lim',
    username: 'mark.lim',
    email: 'mark.lim@municipality.gov.ph',
    role: 'viewer',
    status: 'active',
    lastLoginAt: '2025-05-18T10:05:00',
    createdAt: '2025-02-14',
  },
  {
    id: '7',
    userCode: 'USR-007',
    name: 'Patricia Gomez',
    username: 'patricia.gomez',
    email: 'patricia.gomez@barangay.gov.ph',
    role: 'barangay-official',
    status: 'inactive',
    lastLoginAt: '2025-04-02T09:00:00',
    createdAt: '2024-07-20',
  },
  {
    id: '8',
    userCode: 'USR-008',
    name: 'Ramon Villanueva',
    username: 'ramon.villanueva',
    email: 'ramon.villanueva@municipality.gov.ph',
    role: 'encoder',
    status: 'inactive',
    lastLoginAt: '2025-03-15T13:30:00',
    createdAt: '2024-12-01',
  },
];

export function getRoleLabel(role: SystemUserRole): string {
  return SYSTEM_ROLES.find((r) => r.value === role)?.label ?? role;
}
