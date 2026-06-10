import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AlertTriangle, Loader2, Search } from 'lucide-react';

import { Button, Input, Select } from '@/components/common';
import { Pagination } from '@/components/list';
import { api } from '@/services/api';
import type { SituationReport, SituationReportsResponse } from '@/types';
import { formatDate } from '@/utils/format';
import { resolveAssetUrl } from '@/utils/resolveAssetUrl';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
];

const INCIDENT_LABELS: Record<string, string> = {
  storm_typhoon: 'Storm/Typhoon',
  landslide: 'Landslide',
  flood: 'Flood',
  other: 'Others',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  reviewed: 'bg-sky-50 text-sky-700',
  resolved: 'bg-emerald-50 text-emerald-700',
};

export function FieldReportsTab() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const { data, isLoading, isError } = useQuery<SituationReportsResponse>({
    queryKey: ['situation-reports', { query, status, page, pageSize }] as const,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (query.trim()) params.set('query', query.trim());
      if (status !== 'all') params.set('status', status);
      const res = await api.get<SituationReportsResponse>(
        `/admin/situation-reports?${params.toString()}`,
      );
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status: nextStatus,
    }: {
      id: string;
      status: SituationReport['status'];
    }) => {
      const res = await api.patch<SituationReport>(
        `/admin/situation-reports/${id}`,
        { status: nextStatus },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['situation-reports'] });
    },
    onError: (err) => {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
      window.alert(message ?? 'Could not update the report status.');
    },
  });

  const reports = data?.data ?? [];
  const stats = data?.stats;
  const total = data?.total ?? 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[var(--radius-card)] border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700">
        Could not load field reports. Check that the backend is running and try
        again.
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatPill label="Pending" value={stats?.pending ?? 0} tone="amber" />
        <StatPill label="Reviewed" value={stats?.reviewed ?? 0} tone="sky" />
        <StatPill label="Resolved" value={stats?.resolved ?? 0} tone="emerald" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Input
            placeholder="Search by farmer, title, or report code..."
            leadingIcon={<Search className="h-4 w-4" />}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <AlertTriangle className="mx-auto h-10 w-10 text-brand-500" />
          <h2 className="mt-4 text-base font-semibold text-ink-800">
            No field reports yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
            When farmers submit situation reports from the mobile app, they will
            appear here with photos and details.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              updating={updateMutation.isPending}
              onStatusChange={(nextStatus) =>
                updateMutation.mutate({ id: report.id, status: nextStatus })
              }
            />
          ))}
        </div>
      )}

      {total > 0 ? (
        <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            itemCount={reports.length}
            entityLabel="reports"
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      ) : null}
    </>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'amber' | 'sky' | 'emerald';
}) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-100 bg-amber-50 text-amber-800'
      : tone === 'sky'
        ? 'border-sky-100 bg-sky-50 text-sky-800'
        : 'border-emerald-100 bg-emerald-50 text-emerald-800';

  return (
    <div
      className={`rounded-[var(--radius-card)] border px-4 py-3 shadow-[var(--shadow-soft)] ${toneClass}`}
    >
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function ReportCard({
  report,
  updating,
  onStatusChange,
}: {
  report: SituationReport;
  updating: boolean;
  onStatusChange: (status: SituationReport['status']) => void;
}) {
  const photos = [
    { label: 'Damage crops', url: report.photoCropUrl },
    { label: 'Landslide area', url: report.photoLandslideUrl },
    { label: 'Other damage', url: report.photoOtherUrl },
  ].filter((item) => item.url);

  const incidentLabel = report.incidentTypes
    .map((type) => INCIDENT_LABELS[type] ?? type)
    .join(', ');

  const documentUrl = resolveAssetUrl(report.documentUrl);

  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 bg-ink-100">
          {photos.map((photo) => {
            const src = resolveAssetUrl(photo.url);
            return src ? (
              <img
                key={photo.label}
                src={src}
                alt={photo.label}
                className="h-28 w-full object-cover"
              />
            ) : null;
          })}
        </div>
      ) : (
        <div className="grid h-28 place-items-center bg-ink-50 text-sm text-ink-400">
          No photos
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs text-ink-400">{report.reportCode}</div>
            <h3 className="font-semibold text-ink-800">{report.cropType}</h3>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[report.status] ?? 'bg-ink-100 text-ink-600'}`}
          >
            {report.status}
          </span>
        </div>

        <div className="text-sm text-ink-600">
          <div className="font-medium text-ink-800">{report.fullName}</div>
          <div className="text-xs text-ink-500">
            {report.farmerCode} · {report.contactNumber}
          </div>
          <div className="text-xs text-ink-500">{report.address}</div>
        </div>

        <div className="rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
          <div>
            <span className="font-medium text-ink-700">Incident:</span>{' '}
            {incidentLabel}
            {report.incidentOther ? ` (${report.incidentOther})` : ''}
          </div>
          <div>
            <span className="font-medium text-ink-700">When:</span>{' '}
            {formatDate(report.incidentAt)}
          </div>
          <div>
            <span className="font-medium text-ink-700">Location:</span>{' '}
            {report.sitioPurok}, {report.barangay}
          </div>
          <div>
            <span className="font-medium text-ink-700">Damage:</span>{' '}
            {report.estimatedAreaHa} ha · ₱
            {report.estimatedLossPeso.toLocaleString()}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-ink-600">
          {report.damageDescription}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-ink-500">
          {report.docProofOfLand ? (
            <span className="rounded-full bg-ink-100 px-2 py-0.5">
              Proof of land
            </span>
          ) : null}
          {report.docListOfCrops ? (
            <span className="rounded-full bg-ink-100 px-2 py-0.5">
              List of crops
            </span>
          ) : null}
          {report.docValidId ? (
            <span className="rounded-full bg-ink-100 px-2 py-0.5">Valid ID</span>
          ) : null}
          {report.docOther ? (
            <span className="rounded-full bg-ink-100 px-2 py-0.5">Other doc</span>
          ) : null}
        </div>

        {documentUrl ? (
          <a
            href={documentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-brand-600 underline"
          >
            {report.documentName ?? 'Attached document'}
          </a>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          {report.status !== 'reviewed' ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={updating}
              onClick={() => onStatusChange('reviewed')}
            >
              Mark reviewed
            </Button>
          ) : null}
          {report.status !== 'resolved' ? (
            <Button
              size="sm"
              disabled={updating}
              onClick={() => onStatusChange('resolved')}
            >
              Mark resolved
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
