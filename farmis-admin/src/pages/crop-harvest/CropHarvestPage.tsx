import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Download,
  Filter,
  Leaf,
  MoreVertical,
  Plus,
  Search,
  Sprout,
  Wheat,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Input, Select } from '@/components/common';
import { Pagination, StatCard } from '@/components/list';
import { formatDate, formatNumber } from '@/utils/format';
import type { CropRecord, CropRecordStatus, CropRecordsResponse } from '@/types';
import { api } from '@/services/api';
import { AddCropRecordModal } from './AddCropRecordModal';

const BARANGAY_OPTIONS = [
  { value: 'all', label: 'All Barangays' },
  { value: 'San Isidro', label: 'San Isidro' },
  { value: 'San Roque', label: 'San Roque' },
  { value: 'Poblacion', label: 'Poblacion' },
  { value: 'Mabini', label: 'Mabini' },
];

const CROP_TYPE_OPTIONS = [
  { value: 'all', label: 'All Crop Types' },
  { value: 'Grain', label: 'Grain' },
  { value: 'Fruit', label: 'Fruit' },
  { value: 'Vegetable', label: 'Vegetable' },
  { value: 'Legume', label: 'Legume' },
  { value: 'Root Crop', label: 'Root Crop' },
];

export default function CropHarvestPage() {
  const [query, setQuery] = useState('');
  const [barangay, setBarangay] = useState('all');
  const [cropType, setCropType] = useState('all');
  const [status, setStatus] = useState<'all' | CropRecordStatus>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<CropRecordsResponse>({
    queryKey: [
      'crop-records',
      { page, pageSize, query, barangay, cropType, status },
    ] as const,
    queryFn: async (): Promise<CropRecordsResponse> => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (query.trim()) params.set('query', query.trim());
      if (barangay !== 'all') params.set('barangay', barangay);
      if (cropType !== 'all') params.set('cropType', cropType);
      if (status !== 'all') params.set('status', status);

      const res = await api.get<CropRecordsResponse>(
        `/admin/crop-records?${params.toString()}`,
      );
      return res.data;
    },
  });

  const records = data?.data ?? [];
  const stats = data?.stats;
  const total = data?.total ?? 0;

  const monthHint = useMemo(
    () =>
      new Date().toLocaleString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [],
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink-800">
              CROP & HARVEST
            </h1>
            <p className="mt-0.5 text-sm text-ink-400">
              Manage and monitor crop planting and harvest records
            </p>
          </div>
        </div>

        <Button className="self-start sm:self-center" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Crop Record
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Crop Records"
          value={formatNumber(stats?.total ?? 0)}
          hint="All Time"
          icon={Leaf}
          tone="brand"
        />
        <StatCard
          label="Active Crops"
          value={formatNumber(stats?.active ?? 0)}
          hint="Currently Growing"
          icon={Sprout}
          tone="sky"
        />
        <StatCard
          label="Harvested"
          value={formatNumber(stats?.harvested ?? 0)}
          hint="Completed Harvest"
          icon={Wheat}
          tone="amber"
        />
        <StatCard
          label="This Month"
          value={formatNumber(stats?.thisMonth ?? 0)}
          hint={monthHint}
          icon={Calendar}
          tone="violet"
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <Input
              placeholder="Search by crop name, farmer, or barangay..."
              leadingIcon={<Search className="h-4 w-4" />}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-40">
              <Select
                value={barangay}
                onChange={(e) => {
                  setBarangay(e.target.value);
                  setPage(1);
                }}
                options={BARANGAY_OPTIONS}
              />
            </div>

            <div className="w-full sm:w-40">
              <Select
                value={cropType}
                onChange={(e) => {
                  setCropType(e.target.value);
                  setPage(1);
                }}
                options={CROP_TYPE_OPTIONS}
              />
            </div>

            <div className="w-full sm:w-36">
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as 'all' | CropRecordStatus);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'growing', label: 'Growing' },
                  { value: 'harvested', label: 'Harvested' },
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
                <th className="px-4 py-3 font-semibold">Farmer Name</th>
                <th className="px-4 py-3 font-semibold">Crop Name</th>
                <th className="px-4 py-3 font-semibold">Crop Type</th>
                <th className="px-4 py-3 font-semibold">Farm Area</th>
                <th className="px-4 py-3 font-semibold">Planting Date</th>
                <th className="px-4 py-3 font-semibold">Expected Harvest</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-ink-400">
                    Loading crop records…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-red-600">
                    Could not load crop records. Check that the backend is running.
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((record) => (
                  <CropRecordRow key={record.id} record={record} />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-ink-400"
                  >
                    No crop records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          itemCount={records.length}
          entityLabel="crop records"
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <AddCropRecordModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  );
}

function CropRecordRow({ record }: { record: CropRecord }) {
  const isGrowing = record.status === 'growing';

  return (
    <tr className="hover:bg-ink-50/60">
      <td className="px-4 py-3">
        <span className="font-medium text-brand-600">{record.cropCode}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={record.farmerName} size={32} colorful />
          <div className="min-w-0">
            <div className="font-medium text-ink-800">{record.farmerName}</div>
            <div className="text-xs text-ink-400">{record.barangay}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-medium text-ink-800">{record.cropName}</td>
      <td className="px-4 py-3 text-ink-500">{record.cropType}</td>
      <td className="px-4 py-3 text-ink-700">
        {record.farmAreaHa.toFixed(2)} hectares
      </td>
      <td className="px-4 py-3 text-ink-500">
        {formatDate(record.plantingDate)}
      </td>
      <td className="px-4 py-3 text-ink-500">
        {formatDate(record.expectedHarvestDate)}
      </td>
      <td className="px-4 py-3">
        <span
          className={
            isGrowing
              ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'
              : 'inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700'
          }
        >
          <span
            className={
              isGrowing
                ? 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                : 'h-1.5 w-1.5 rounded-full bg-sky-500'
            }
          />
          {isGrowing ? 'Growing' : 'Harvested'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <Link
            to={`/farmers/${record.farmerId}`}
            className="inline-flex h-8 items-center rounded-lg border border-ink-100 bg-white px-3 text-xs font-medium text-ink-800 transition hover:bg-ink-50"
          >
            View
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            aria-label={`More actions for ${record.cropCode}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
