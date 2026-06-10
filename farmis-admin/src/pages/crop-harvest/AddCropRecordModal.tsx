import { useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Sprout, X } from 'lucide-react';

import { Button, Input, Select } from '@/components/common';
import { api } from '@/services/api';
import type {
  CreateCropRecordInput,
  CropRecord,
  Farmer,
  PaginatedResponse,
} from '@/types';

interface AddCropRecordModalProps {
  open: boolean;
  onClose: () => void;
}

const CROP_TYPE_OPTIONS = [
  { value: '', label: 'Select crop type…' },
  { value: 'Grain', label: 'Grain' },
  { value: 'Fruit', label: 'Fruit' },
  { value: 'Vegetable', label: 'Vegetable' },
  { value: 'Legume', label: 'Legume' },
  { value: 'Root Crop', label: 'Root Crop' },
];

const STATUS_OPTIONS = [
  { value: 'growing', label: 'Growing' },
  { value: 'harvested', label: 'Harvested' },
];

interface FormState {
  farmerId: string;
  cropName: string;
  cropType: string;
  farmAreaHa: string;
  plantingDate: string;
  expectedHarvestDate: string;
  status: 'growing' | 'harvested';
}

const EMPTY_FORM: FormState = {
  farmerId: '',
  cropName: '',
  cropType: '',
  farmAreaHa: '',
  plantingDate: '',
  expectedHarvestDate: '',
  status: 'growing',
};

export function AddCropRecordModal({ open, onClose }: AddCropRecordModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const { data: farmersData, isLoading: farmersLoading } = useQuery({
    queryKey: ['farmers', 'crop-record-picker'] as const,
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Farmer>>(
        '/admin/farmers?page=1&pageSize=100',
      );
      return res.data;
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async (input: CreateCropRecordInput) => {
      const res = await api.post<CropRecord>('/admin/crop-records', input);
      return res.data;
    },
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['crop-records'] });
      onClose();
    },
    onError: (err) => {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
      setError(message ?? 'Could not create the crop record. Try again.');
    },
  });

  if (!open) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.farmerId) {
      setError('Select a farmer.');
      return;
    }
    if (!form.cropName.trim()) {
      setError('Enter a crop name.');
      return;
    }
    if (!form.cropType) {
      setError('Select a crop type.');
      return;
    }
    if (!form.plantingDate || !form.expectedHarvestDate) {
      setError('Enter planting and expected harvest dates.');
      return;
    }

    const farmAreaHa = Number.parseFloat(form.farmAreaHa);
    if (!Number.isFinite(farmAreaHa) || farmAreaHa < 0) {
      setError('Enter a valid farm area in hectares.');
      return;
    }

    mutation.mutate({
      farmerId: form.farmerId,
      cropName: form.cropName.trim(),
      cropType: form.cropType,
      farmAreaHa,
      plantingDate: form.plantingDate,
      expectedHarvestDate: form.expectedHarvestDate,
      status: form.status,
    });
  }

  const farmerOptions = [
    { value: '', label: farmersLoading ? 'Loading farmers…' : 'Select farmer…' },
    ...(farmersData?.data ?? []).map((farmer) => ({
      value: farmer.id,
      label: `${farmer.name} (${farmer.farmerCode})`,
    })),
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-3 border-b border-ink-100 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink-800">Add Crop Record</h2>
              <p className="mt-0.5 text-sm text-ink-500">
                Register a new planting or harvest record for a farmer.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <Field label="Farmer">
            <Select
              value={form.farmerId}
              onChange={(e) => update('farmerId', e.target.value)}
              options={farmerOptions}
              disabled={farmersLoading}
            />
          </Field>

          <Field label="Crop name">
            <Input
              value={form.cropName}
              onChange={(e) => update('cropName', e.target.value)}
              placeholder="e.g. Rice, Corn, Tomato"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Crop type">
              <Select
                value={form.cropType}
                onChange={(e) => update('cropType', e.target.value)}
                options={CROP_TYPE_OPTIONS}
              />
            </Field>
            <Field label="Farm area (ha)">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.farmAreaHa}
                onChange={(e) => update('farmAreaHa', e.target.value)}
                placeholder="e.g. 1.5"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Planting date">
              <Input
                type="date"
                value={form.plantingDate}
                onChange={(e) => update('plantingDate', e.target.value)}
              />
            </Field>
            <Field label="Expected harvest date">
              <Input
                type="date"
                value={form.expectedHarvestDate}
                onChange={(e) => update('expectedHarvestDate', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) =>
                update('status', e.target.value as FormState['status'])
              }
              options={STATUS_OPTIONS}
            />
          </Field>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="md" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Record'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-ink-500">{label}</label>
      {children}
    </div>
  );
}
