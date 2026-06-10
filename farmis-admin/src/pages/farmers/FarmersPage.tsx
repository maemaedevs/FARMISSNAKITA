import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Input, Select } from '@/components/common';
import { formatDate, formatNumber } from '@/utils/format';
import type { Farmer, PaginatedResponse } from '@/types';
import { api } from '@/services/api';
import { Pagination, StatCard } from '@/components/list';
import { AddFarmerModal } from './AddFarmerModal';

interface FarmersResponse extends PaginatedResponse<Farmer> {}

export default function FarmersPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [barangay, setBarangay] = useState('all');
  const [program, setProgram] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data, isLoading } = useQuery<FarmersResponse>({
    queryKey: ['farmers', { page, pageSize, query, status, barangay }] as const,
    queryFn: async (): Promise<FarmersResponse> => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (query.trim()) params.set('query', query.trim());
      if (status !== 'all') params.set('status', status);
      if (barangay !== 'all') params.set('barangay', barangay);

      const res = await api.get<FarmersResponse>(
        `/admin/farmers?${params.toString()}`,
      );
      return res.data;
    },
  });

  const stats = useMemo(() => {
    const list = data?.data ?? [];
    const total = data?.total ?? 0;
    const active = list.filter((f) => f.status === 'active').length;
    const inactive = list.filter((f) => f.status === 'inactive').length;
    const newThisMonth = list.filter((f) => {
      const d = new Date(f.registeredAt);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return { total, active, inactive, newThisMonth };
  }, [data]);

  const farmers = data?.data ?? [];

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink-800">FARMERS LIST</h1>
            <p className="mt-0.5 text-sm text-ink-400">
              Manage and view all registered farmers
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button
            className="self-start sm:self-end"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add New Farmer
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="secondary" size="sm">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Farmers"
          value={formatNumber(stats.total)}
          hint="All time"
          icon={Users}
          tone="brand"
        />
        <StatCard
          label="Active Farmers"
          value={formatNumber(stats.active)}
          hint={stats.total ? `${((stats.active / stats.total) * 100).toFixed(1)}%` : '0%'}
          icon={UserCheck}
          tone="emerald"
        />
        <StatCard
          label="Inactive Farmers"
          value={formatNumber(stats.inactive)}
          hint={
            stats.total ? `${((stats.inactive / stats.total) * 100).toFixed(1)}%` : '0%'
          }
          icon={UserX}
          tone="amber"
        />
        <StatCard
          label="New This Month"
          value={formatNumber(stats.newThisMonth)}
          hint="This month"
          icon={UserPlus}
          tone="sky"
        />
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
        {/* Filter bar */}
        <div className="grid grid-cols-1 gap-3 border-b border-ink-100 p-4 md:grid-cols-[1fr_auto_auto_auto_auto]">
          <Input
            placeholder="Search by name, contact number, or farmer ID..."
            leadingIcon={<Search className="h-4 w-4" />}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />

          <div className="w-full md:w-44">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as 'all' | 'active' | 'inactive');
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>

          <div className="w-full md:w-44">
            <Select
              value={barangay}
              onChange={(e) => {
                setBarangay(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Barangays' },
                { value: 'San Isidro', label: 'San Isidro' },
                { value: 'San Roque', label: 'San Roque' },
                { value: 'Poblacion', label: 'Poblacion' },
                { value: 'Mabini', label: 'Mabini' },
              ]}
            />
          </div>

          <div className="w-full md:w-44">
            <Select
              value={program}
              onChange={(e) => {
                setProgram(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Programs' },
                { value: 'rsbsa', label: 'RSBSA' },
                { value: '4ps', label: '4Ps' },
              ]}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setQuery('');
              setStatus('all');
              setBarangay('all');
              setProgram('all');
              setPage(1);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-100 text-ink-500 transition hover:bg-ink-50 hover:text-ink-700"
            aria-label="Reset filters"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Farmer Name</th>
                <th className="px-4 py-3 font-semibold">Contact Number</th>
                <th className="px-4 py-3 font-semibold">Barangay</th>
                <th className="px-4 py-3 font-semibold">Farm Area (ha)</th>
                <th className="px-4 py-3 font-semibold">Primary Crops</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date Registered</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {farmers.map((farmer) => (
                <FarmerRow key={farmer.id} farmer={farmer} />
              ))}
              {!isLoading && farmers.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-ink-400"
                  >
                    No farmers match the current filters.
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
          itemCount={farmers.length}
          entityLabel="farmers"
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <AddFarmerModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  );
}

function FarmerRow({ farmer }: { farmer: Farmer }) {
  const isActive = farmer.status === 'active';
  return (
    <tr className="hover:bg-ink-50/60">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={farmer.name} size={32} colorful />
          <span className="font-medium text-ink-800">{farmer.farmerCode}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-ink-700">{farmer.name}</td>
      <td className="px-4 py-3 text-ink-500">{farmer.contactNumber}</td>
      <td className="px-4 py-3 text-ink-500">{farmer.barangay}</td>
      <td className="px-4 py-3 text-ink-700">{farmer.farmAreaHa.toFixed(2)}</td>
      <td className="px-4 py-3 text-ink-500">
        {farmer.primaryCrops.join(', ')}
      </td>
      <td className="px-4 py-3">
        <span
          className={
            isActive
              ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'
              : 'inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700'
          }
        >
          <span
            className={
              isActive
                ? 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                : 'h-1.5 w-1.5 rounded-full bg-red-500'
            }
          />
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-ink-500">{formatDate(farmer.registeredAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <Link
            to={`/farmers/${farmer.id}`}
            className="rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            aria-label={`View ${farmer.name}`}
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            aria-label={`More actions for ${farmer.name}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
