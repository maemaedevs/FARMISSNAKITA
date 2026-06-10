import { useState } from 'react';
import { Copy, KeyRound, RefreshCw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/common';
import { api } from '@/services/api';

type GeneratePasswordResponse = {
  farmerCode: string;
  registryId: string;
  name: string;
  password: string;
  hasPassword: boolean;
};

type GeneratePasswordSectionProps = {
  farmerId: string;
  farmerCode: string;
  hasPassword?: boolean;
};

export function GeneratePasswordSection({
  farmerId,
  farmerCode,
  hasPassword = false,
}: GeneratePasswordSectionProps) {
  const queryClient = useQueryClient();
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<GeneratePasswordResponse>(
        `/admin/farmers/${farmerId}/generate-password`,
      );
      return res.data;
    },
    onSuccess: (data) => {
      setGeneratedPassword(data.password);
      setCopied(false);
      void queryClient.invalidateQueries({ queryKey: ['farmer', farmerId] });
    },
  });

  async function handleCopy() {
    if (!generatedPassword) return;
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <KeyRound className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-ink-800">Mobile Login Password</h3>
          <p className="mt-1 text-sm text-ink-500">
            Generate a password for farmer{' '}
            <span className="font-medium text-ink-700">{farmerCode}</span> to use in the
            mobile app together with their Farmer ID.
          </p>
          <p className="mt-2 text-xs text-ink-400">
            Status:{' '}
            <span className={hasPassword ? 'font-medium text-emerald-700' : 'font-medium text-amber-700'}>
              {hasPassword ? 'Password set' : 'No password yet'}
            </span>
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="md"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 ${mutation.isPending ? 'animate-spin' : ''}`} />
              {hasPassword ? 'Reset Password' : 'Generate Password'}
            </Button>
          </div>

          {mutation.isError ? (
            <p className="mt-3 text-sm text-red-600">
              Could not generate a password. Try again.
            </p>
          ) : null}

          {generatedPassword ? (
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-800">
                New password (shown once)
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="rounded bg-white px-3 py-2 text-sm font-semibold tracking-wide text-ink-800">
                  {generatedPassword}
                </code>
                <Button variant="secondary" size="sm" onClick={() => void handleCopy()}>
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="mt-2 text-xs text-emerald-800">
                Share this password securely with the farmer. They can change it later in the
                mobile app profile.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
