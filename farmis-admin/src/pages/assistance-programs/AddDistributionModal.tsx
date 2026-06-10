import { useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Gift, X } from 'lucide-react';

import { Button, Input, Select } from '@/components/common';
import { api } from '@/services/api';
import type {
  AssistanceProgram,
  CreateDistributionInput,
  Farmer,
  PaginatedResponse,
  ProgramsResponse,
} from '@/types';

interface AddDistributionModalProps {
  open: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface FormState {
  programId: string;
  farmerId: string;
  assistanceType: string;
  quantityLabel: string;
  amountPeso: string;
  distributedAt: string;
  status: 'completed' | 'pending' | 'cancelled';
  distributedBy: string;
}

const EMPTY_FORM: FormState = {
  programId: '',
  farmerId: '',
  assistanceType: '',
  quantityLabel: '',
  amountPeso: '',
  distributedAt: new Date().toISOString().slice(0, 10),
  status: 'pending',
  distributedBy: '',
};

export function AddDistributionModal({
  open,
  onClose,
}: AddDistributionModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const { data: programsData, isLoading: programsLoading } = useQuery({
    queryKey: ['programs', 'distribution-picker'] as const,
    queryFn: async () => {
      const res = await api.get<ProgramsResponse>(
        '/admin/programs?page=1&pageSize=100&status=active',
      );
      return res.data;
    },
    enabled: open,
  });

  const { data: farmersData, isLoading: farmersLoading } = useQuery({
    queryKey: ['farmers', 'distribution-picker'] as const,
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Farmer>>(
        '/admin/farmers?page=1&pageSize=100&status=active',
      );
      return res.data;
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async (input: CreateDistributionInput) => {
      const res = await api.post('/admin/distributions', input);
      return res.data;
    },
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['distributions'] });
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError) {
        const msg = (err.response?.data as { message?: string })?.message;
        setError(msg ?? 'Could not create distribution.');
        return;
      }
      setError('Could not create distribution.');
    },
  });

  if (!open) return null;

  const programOptions = [
    { value: '', label: programsLoading ? 'Loading programs…' : 'Select program…' },
    ...(programsData?.data ?? []).map((p: AssistanceProgram) => ({
      value: p.id,
      label: p.name,
    })),
  ];

  const activeFarmerCount = farmersData?.total ?? 0;

  const farmerOptions = [
    { value: '', label: farmersLoading ? 'Loading farmers…' : 'Select farmer…' },
    {
      value: 'all',
      label: farmersLoading
        ? 'All farmers…'
        : `All farmers (${activeFarmerCount} active)`,
    },
    ...(farmersData?.data ?? []).map((f: Farmer) => ({
      value: f.id,
      label: `${f.name} (${f.barangay})`,
    })),
  ];

  const isAllFarmers = form.farmerId === 'all';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.programId || !form.farmerId) {
      setError('Select a program and farmer (or all farmers).');
      return;
    }

    const amount = Number(form.amountPeso);
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Enter a valid amount.');
      return;
    }

    mutation.mutate({
      programId: form.programId,
      farmerId: form.farmerId,
      assistanceType: form.assistanceType.trim(),
      quantityLabel: form.quantityLabel.trim(),
      amountPeso: amount,
      distributedAt: form.distributedAt,
      status: form.status,
      distributedBy: form.distributedBy.trim(),
    });
  }

  return createPortal(
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-800">
              Distribute Assistance
            </h2>
            <p className="text-sm text-ink-400">
              Record assistance for one farmer or all active farmers under a
              program.
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

      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Program">
            <Select
              value={form.programId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, programId: e.target.value }))
              }
              options={programOptions}
            />
          </Field>
          <Field label="Farmer / Beneficiary">
            <Select
              value={form.farmerId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, farmerId: e.target.value }))
              }
              options={farmerOptions}
            />
            {isAllFarmers && activeFarmerCount > 0 ? (
              <p className="mt-1.5 text-xs text-ink-400">
                Creates one distribution record for each of the{' '}
                {activeFarmerCount} active farmers listed.
              </p>
            ) : null}
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Assistance type">
            <Input
              value={form.assistanceType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  assistanceType: e.target.value,
                }))
              }
              placeholder="e.g. Fertilizer"
            />
          </Field>
          <Field label="Quantity">
            <Input
              value={form.quantityLabel}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  quantityLabel: e.target.value,
                }))
              }
              placeholder="e.g. 5 bags (50kg)"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Amount (PHP)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.amountPeso}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amountPeso: e.target.value }))
              }
            />
          </Field>
          <Field label="Date distributed">
            <Input
              type="date"
              value={form.distributedAt}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  distributedAt: e.target.value,
                }))
              }
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value as FormState['status'],
                }))
              }
              options={STATUS_OPTIONS}
            />
          </Field>
        </div>

        <Field label="Distributed by">
          <Input
            value={form.distributedBy}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, distributedBy: e.target.value }))
            }
            placeholder="e.g. Agriculture Officer"
          />
        </Field>

        <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? 'Saving…'
              : isAllFarmers
                ? `Distribute to all (${activeFarmerCount})`
                : 'Save distribution'}
          </Button>
        </div>
      </form>
    </ModalShell>,
    document.body,
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
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-card)] bg-white shadow-xl">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-500">
        {label}
      </span>
      {children}
    </label>
  );
}
