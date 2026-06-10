import { useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { HandHeart, X } from 'lucide-react';

import { Button, Input, Select } from '@/components/common';
import { api } from '@/services/api';
import type { AssistanceProgram, CreateProgramInput } from '@/types';

interface AddProgramModalProps {
  open: boolean;
  onClose: () => void;
}

const PROGRAM_TYPE_OPTIONS = [
  { value: 'Input Support', label: 'Input Support' },
  { value: 'Production Support', label: 'Production Support' },
  { value: 'Livestock', label: 'Livestock' },
  { value: 'Infrastructure', label: 'Infrastructure' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const ICON_OPTIONS = [
  { value: 'gift', label: 'Gift' },
  { value: 'sprout', label: 'Sprout' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'beef', label: 'Livestock' },
  { value: 'building', label: 'Infrastructure' },
  { value: 'tractor', label: 'Equipment' },
];

interface FormState {
  name: string;
  tagline: string;
  programType: CreateProgramInput['programType'];
  description: string;
  targetBeneficiaries: string;
  fundingSource: string;
  status: 'active' | 'inactive';
  icon: AssistanceProgram['icon'];
}

const EMPTY_FORM: FormState = {
  name: '',
  tagline: '',
  programType: 'Input Support',
  description: '',
  targetBeneficiaries: '',
  fundingSource: '',
  status: 'active',
  icon: 'gift',
};

export function AddProgramModal({ open, onClose }: AddProgramModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: CreateProgramInput) => {
      const res = await api.post<AssistanceProgram>('/admin/programs', input);
      return res.data;
    },
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['programs'] });
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError) {
        const msg = (err.response?.data as { message?: string })?.message;
        setError(msg ?? 'Could not create program.');
        return;
      }
      setError('Could not create program.');
    },
  });

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const target = Number(form.targetBeneficiaries);
    if (!Number.isFinite(target) || target < 0) {
      setError('Enter a valid target beneficiaries count.');
      return;
    }

    mutation.mutate({
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      programType: form.programType,
      description: form.description.trim(),
      targetBeneficiaries: target,
      fundingSource: form.fundingSource.trim(),
      status: form.status,
      icon: form.icon,
    });
  }

  return createPortal(
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <HandHeart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-800">
              Add New Program
            </h2>
            <p className="text-sm text-ink-400">
              Create an assistance program farmers can enroll in.
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
          <Field label="Program name">
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. Seed & Fertilizer Program"
            />
          </Field>
          <Field label="Tagline">
            <Input
              value={form.tagline}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tagline: e.target.value }))
              }
              placeholder="Short summary"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Program type">
            <Select
              value={form.programType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  programType: e.target.value as FormState['programType'],
                }))
              }
              options={PROGRAM_TYPE_OPTIONS}
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
          <Field label="Icon">
            <Select
              value={form.icon}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  icon: e.target.value as FormState['icon'],
                }))
              }
              options={ICON_OPTIONS}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            className="min-h-[88px] w-full rounded-lg border border-ink-100 px-3 py-2 text-sm text-ink-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Describe the program and eligibility…"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Target beneficiaries">
            <Input
              type="number"
              min={0}
              value={form.targetBeneficiaries}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  targetBeneficiaries: e.target.value,
                }))
              }
            />
          </Field>
          <Field label="Funding source">
            <Input
              value={form.fundingSource}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fundingSource: e.target.value }))
              }
              placeholder="e.g. Municipal Funds"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save program'}
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
