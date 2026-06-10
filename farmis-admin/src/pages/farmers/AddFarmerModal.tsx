import { useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { UserPlus, X } from 'lucide-react';

import { Button, Input, Select } from '@/components/common';
import { api } from '@/services/api';
import type { CreateFarmerInput, Farmer } from '@/types';

interface AddFarmerModalProps {
  open: boolean;
  onClose: () => void;
}

const BARANGAY_OPTIONS = [
  { value: '', label: 'Select barangay…' },
  { value: 'San Isidro', label: 'San Isidro' },
  { value: 'San Roque', label: 'San Roque' },
  { value: 'Poblacion', label: 'Poblacion' },
  { value: 'Mabini', label: 'Mabini' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

interface FormState {
  name: string;
  birthday: string;
  placeOfBirth: string;
  nationality: string;
  occupation: string;
  education: string;
  contactNumber: string;
  email: string;
  householdSize: string;
  primaryIncome: string;
  barangay: string;
  farmAreaHa: string;
  primaryCrops: string;
  status: 'active' | 'inactive';
}

const EMPTY_FORM: FormState = {
  name: '',
  birthday: '',
  placeOfBirth: '',
  nationality: '',
  occupation: '',
  education: '',
  contactNumber: '',
  email: '',
  householdSize: '',
  primaryIncome: '',
  barangay: '',
  farmAreaHa: '',
  primaryCrops: '',
  status: 'active',
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-b border-ink-100 pb-2 text-sm font-semibold text-ink-800">
      {children}
    </h3>
  );
}

export function AddFarmerModal({ open, onClose }: AddFarmerModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );

  const mutation = useMutation({
    mutationFn: async (input: CreateFarmerInput): Promise<Farmer> => {
      const res = await api.post<Farmer>('/admin/farmers', input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      handleClose();
    },
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'Full name is required';
    if (!form.contactNumber.trim()) next.contactNumber = 'Contact number is required';
    if (!form.barangay) next.barangay = 'Barangay is required';
    const area = Number(form.farmAreaHa);
    if (!form.farmAreaHa.trim() || Number.isNaN(area) || area < 0) {
      next.farmAreaHa = 'Enter a valid farm area';
    }
    if (form.householdSize.trim()) {
      const size = Number(form.householdSize);
      if (Number.isNaN(size) || size < 0) {
        next.householdSize = 'Enter a valid household size';
      }
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors({});
    mutation.reset();
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateFarmerInput = {
      name: form.name.trim(),
      contactNumber: form.contactNumber.trim(),
      barangay: form.barangay,
      farmAreaHa: Number(form.farmAreaHa),
      primaryCrops: form.primaryCrops
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      status: form.status,
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.birthday.trim() ? { birthday: form.birthday.trim() } : {}),
      ...(form.placeOfBirth.trim() ? { placeOfBirth: form.placeOfBirth.trim() } : {}),
      ...(form.nationality.trim() ? { nationality: form.nationality.trim() } : {}),
      ...(form.occupation.trim() ? { occupation: form.occupation.trim() } : {}),
      ...(form.education.trim() ? { education: form.education.trim() } : {}),
      ...(form.householdSize.trim()
        ? { householdSize: Number(form.householdSize) }
        : {}),
      ...(form.primaryIncome.trim() ? { primaryIncome: form.primaryIncome.trim() } : {}),
    };

    mutation.mutate(payload);
  }

  if (!open) return null;

  const serverError =
    mutation.error instanceof AxiosError
      ? (mutation.error.response?.data as { message?: string })?.message ??
        mutation.error.message
      : mutation.error
        ? 'Something went wrong. Please try again.'
        : null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex shrink-0 items-start justify-between border-b border-ink-100 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink-800">Add New Farmer</h2>
              <p className="mt-0.5 text-xs text-ink-400">
                Register a farmer. A farmer ID is generated automatically.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5"
        >
          <section className="flex flex-col gap-4">
            <SectionTitle>Personal Information</SectionTitle>

            <Input
              label="Full Name"
              placeholder="Juan Dela Cruz"
              value={form.name}
              error={errors.name}
              onChange={(e) => update('name', e.target.value)}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Birthday"
                type="date"
                value={form.birthday}
                onChange={(e) => update('birthday', e.target.value)}
              />
              <Input
                label="Place of Birth"
                placeholder="Example City"
                value={form.placeOfBirth}
                onChange={(e) => update('placeOfBirth', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nationality"
                placeholder="Filipino"
                value={form.nationality}
                onChange={(e) => update('nationality', e.target.value)}
              />
              <Input
                label="Occupation"
                placeholder="Farmer"
                value={form.occupation}
                onChange={(e) => update('occupation', e.target.value)}
              />
            </div>

            <Input
              label="Educational Attainment"
              placeholder="High School"
              value={form.education}
              onChange={(e) => update('education', e.target.value)}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Contact Number"
                placeholder="0917 123 4567"
                value={form.contactNumber}
                error={errors.contactNumber}
                onChange={(e) => update('contactNumber', e.target.value)}
              />
              <Input
                label="Email Address"
                placeholder="juan@farmis.local"
                value={form.email}
                error={errors.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Household Size"
                type="number"
                min="0"
                placeholder="5"
                value={form.householdSize}
                error={errors.householdSize}
                onChange={(e) => update('householdSize', e.target.value)}
              />
              <Input
                label="Primary Source of Income"
                placeholder="Farming"
                value={form.primaryIncome}
                onChange={(e) => update('primaryIncome', e.target.value)}
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <SectionTitle>Farm Details</SectionTitle>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-ink-500">Barangay</span>
                <Select
                  value={form.barangay}
                  options={BARANGAY_OPTIONS}
                  onChange={(e) => update('barangay', e.target.value)}
                />
                {errors.barangay ? (
                  <span className="text-xs text-red-600">{errors.barangay}</span>
                ) : null}
              </div>
              <Input
                label="Farm Area (ha)"
                type="number"
                step="0.01"
                min="0"
                placeholder="1.5"
                value={form.farmAreaHa}
                error={errors.farmAreaHa}
                onChange={(e) => update('farmAreaHa', e.target.value)}
              />
            </div>

            <Input
              label="Primary Crops"
              placeholder="Rice, Corn (comma-separated)"
              hint="Separate multiple crops with commas."
              value={form.primaryCrops}
              onChange={(e) => update('primaryCrops', e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-500">Status</span>
              <Select
                value={form.status}
                options={STATUS_OPTIONS}
                onChange={(e) =>
                  update('status', e.target.value as 'active' | 'inactive')
                }
              />
            </div>
          </section>

          {serverError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              <UserPlus className="h-4 w-4" />
              Register Farmer
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
