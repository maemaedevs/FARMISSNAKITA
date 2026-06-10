import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Eye, X } from 'lucide-react';

import { Avatar, Button, Select } from '@/components/common';
import { formatDate, formatPeso } from '@/utils/format';
import { api } from '@/services/api';
import type {
  AssistanceDistribution,
  DistributionStatus,
  UpdateDistributionInput,
} from '@/types';

interface ViewDistributionModalProps {
  open: boolean;
  distribution: AssistanceDistribution | null;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_LABELS: Record<DistributionStatus, string> = {
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function ViewDistributionModal({
  open,
  distribution,
  onClose,
}: ViewDistributionModalProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<DistributionStatus>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (distribution) {
      setStatus(distribution.status);
      setError(null);
    }
  }, [distribution]);

  const mutation = useMutation({
    mutationFn: async (input: UpdateDistributionInput) => {
      if (!distribution) throw new Error('No distribution selected');
      const res = await api.patch<AssistanceDistribution>(
        `/admin/distributions/${distribution.id}`,
        input,
      );
      return res.data;
    },
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['distributions'] });
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError) {
        const msg = (err.response?.data as { message?: string })?.message;
        setError(msg ?? 'Could not update status.');
        return;
      }
      setError('Could not update status.');
    },
  });

  if (!open || !distribution) return null;

  const statusChanged = status !== distribution.status;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    mutation.mutate({ status });
  }

  return createPortal(
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-800">
              Distribution Details
            </h2>
            <p className="text-sm font-medium text-brand-600">
              {distribution.distributionCode}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Program" value={distribution.programName} />
          <DetailField
            label="Assistance type"
            value={distribution.assistanceType}
          />
        </div>

        <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-500">
            Beneficiary
          </p>
          <div className="flex items-center gap-3">
            <Avatar name={distribution.farmerName} size={40} colorful />
            <div>
              <p className="font-medium text-ink-800">
                {distribution.farmerName}
              </p>
              <p className="text-sm text-ink-500">{distribution.contactNumber}</p>
              <p className="text-xs text-ink-400">{distribution.barangay}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Quantity" value={distribution.quantityLabel} />
          <DetailField label="Amount" value={formatPeso(distribution.amountPeso)} />
          <DetailField
            label="Date distributed"
            value={formatDate(distribution.distributedAt)}
          />
          <DetailField
            label="Distributed by"
            value={distribution.distributedBy}
          />
        </div>

        <div className="rounded-lg border border-ink-100 p-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-500">
              Status
            </span>
            <Select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as DistributionStatus)
              }
              options={STATUS_OPTIONS}
            />
          </label>
          {!statusChanged ? (
            <p className="mt-2 text-xs text-ink-400">
              Current status: {STATUS_LABELS[distribution.status]}
            </p>
          ) : (
            <p className="mt-2 text-xs text-brand-600">
              Changing from {STATUS_LABELS[distribution.status]} to{' '}
              {STATUS_LABELS[status]}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" disabled={mutation.isPending || !statusChanged}>
            {mutation.isPending ? 'Saving…' : 'Update status'}
          </Button>
        </div>
      </form>
    </ModalShell>,
    document.body,
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink-800">{value}</p>
    </div>
  );
}

function ModalShell({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink-900/40"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-card)] bg-white shadow-xl">
        {children}
      </div>
    </div>
  );
}
