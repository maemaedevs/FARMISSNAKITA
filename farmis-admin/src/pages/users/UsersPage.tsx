import { useMemo, useState } from 'react';
import {
  Download,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserCog,
  Users,
  UserX,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Input, Select } from '@/components/common';
import { Pagination, StatCard } from '@/components/list';
import { formatDateTime, formatNumber } from '@/utils/format';
import type {
  PaginatedResponse,
  SystemUser,
  SystemUserRole,
  SystemUserStatus,
} from '@/types';
import { api } from '@/services/api';
import { SYSTEM_ROLES, getRoleLabel } from './users.data';

interface SystemUsersResponse extends PaginatedResponse<SystemUser> {}

const ROLE_STYLES: Record<SystemUserRole, string> = {
  'municipal-agriculturist': 'bg-sky-50 text-sky-700',
  'barangay-official': 'bg-emerald-50 text-emerald-700',
  encoder: 'bg-amber-50 text-amber-700',
  viewer: 'bg-cyan-50 text-cyan-700',
  'data-verifier': 'bg-violet-50 text-violet-700',
  'agriculture-officer': 'bg-teal-50 text-teal-700',
};

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | SystemUserRole>('all');
  const [status, setStatus] = useState<'all' | SystemUserStatus>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery<SystemUsersResponse>({
    queryKey: ['system-users', { page, pageSize, query, roleFilter, status }] as const,
    queryFn: async (): Promise<SystemUsersResponse> => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (query.trim()) params.set('query', query.trim());
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (status !== 'all') params.set('status', status);

      const res = await api.get<SystemUsersResponse>(`/admin/users?${params.toString()}`);
      return res.data;
    },
  });

  const users = data?.data ?? [];

  const stats = useMemo(() => {
    const list = users;
    const total = data?.total ?? 0;
    const active = list.filter((u) => u.status === 'active').length;
    const inactive = list.filter((u) => u.status === 'inactive').length;
    const roleCount = new Set(list.map((u) => u.role)).size;
    return { total, active, inactive, roleCount };
  }, [data, users]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink-800">USER MANAGEMENT</h1>
            <p className="mt-0.5 text-sm text-ink-400">
              Manage system users and their roles and permissions
            </p>
          </div>
        </div>

        <Button className="self-start sm:self-center">
          <Plus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={formatNumber(stats.total)}
          hint="Across all roles"
          icon={Users}
          tone="brand"
        />
        <StatCard
          label="Active Users"
          value={formatNumber(stats.active)}
          hint="Currently active"
          icon={UserCheck}
          tone="emerald"
        />
        <StatCard
          label="Inactive Users"
          value={formatNumber(stats.inactive)}
          hint="Not active"
          icon={UserX}
          tone="amber"
        />
        <StatCard
          label="Roles"
          value={formatNumber(stats.roleCount)}
          hint="System roles"
          icon={Shield}
          tone="violet"
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <Input
              placeholder="Search by name, email, or username..."
              leadingIcon={<Search className="h-4 w-4" />}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-48">
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as 'all' | SystemUserRole);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Roles' },
                  ...SYSTEM_ROLES.map((r) => ({
                    value: r.value,
                    label: r.label,
                  })),
                ]}
              />
            </div>

            <div className="w-full sm:w-36">
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as 'all' | SystemUserStatus);
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
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last Login</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
              {!isLoading && users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-ink-400"
                  >
                    No users match the current filters.
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
          itemCount={users.length}
          entityLabel="users"
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </>
  );
}

function UserRow({ user }: { user: SystemUser }) {
  const isActive = user.status === 'active';

  return (
    <tr className="hover:bg-ink-50/60">
      <td className="px-4 py-3">
        <span className="font-medium text-brand-600">{user.userCode}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size={36} colorful />
          <div>
            <div className="font-medium text-ink-800">{user.name}</div>
            <div className="text-xs text-ink-400">@{user.username}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[user.role]}`}
        >
          {getRoleLabel(user.role)}
        </span>
      </td>
      <td className="px-4 py-3 text-ink-500">{user.email}</td>
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
      <td className="px-4 py-3 text-ink-500">
        {formatDateTime(user.lastLoginAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <Button variant="secondary" size="sm" className="h-8 px-3">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <button
            type="button"
            className="rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            aria-label={`More actions for ${user.name}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
