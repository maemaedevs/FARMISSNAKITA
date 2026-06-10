import { useRef, useState, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Calendar, ExternalLink, FileText, Upload, X } from 'lucide-react';

import { Button, Input } from '@/components/common';
import { api } from '@/services/api';
import type { FarmerLandDocument } from '@/types';
import { formatDate } from '@/utils/format';
import { resolveAssetUrl } from '@/utils/resolveAssetUrl';

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
].join(',');

type LandDocumentsSectionProps = {
  farmerId: string;
  documents: FarmerLandDocument[];
};

type UploadModalState = {
  file: File;
  title: string;
};

function titleFromFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').trim();
  return base.length > 0 ? base : 'Land Document';
}

function isImageDocument(doc: FarmerLandDocument): boolean {
  if (doc.mimeType?.startsWith('image/')) return true;
  const url = doc.fileUrl ?? doc.fileName ?? '';
  return /\.(jpe?g|png)$/i.test(url);
}

function isPdfDocument(doc: FarmerLandDocument): boolean {
  if (doc.mimeType === 'application/pdf') return true;
  const url = doc.fileUrl ?? doc.fileName ?? '';
  return /\.pdf$/i.test(url);
}

export function LandDocumentsSection({
  farmerId,
  documents,
}: LandDocumentsSectionProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadModal, setUploadModal] = useState<UploadModalState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, title }: UploadModalState) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('title', title.trim());

      const res = await api.post<FarmerLandDocument>(
        `/admin/farmers/${farmerId}/land-documents`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return res.data;
    },
    onSuccess: () => {
      setUploadModal(null);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['farmer', farmerId] });
    },
    onError: (err) => {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
      setError(message ?? 'Could not upload the document. Try again.');
    },
  });

  function openFilePicker() {
    setError(null);
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const allowed =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'application/pdf' ||
      /\.(jpe?g|png|pdf)$/i.test(file.name);

    if (!allowed) {
      setError('Only JPEG, PNG, or PDF files are allowed.');
      return;
    }

    setUploadModal({ file, title: titleFromFileName(file.name) });
  }

  function handleUpload() {
    if (!uploadModal || uploadModal.title.trim().length === 0) {
      setError('Enter a document title.');
      return;
    }
    uploadMutation.mutate(uploadModal);
  }

  return (
    <>
      <section className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-4 shadow-[var(--shadow-soft)]">
        <h3 className="mb-3 text-sm font-semibold text-ink-800">
          Land Documents & Verifications
        </h3>

        {error && !uploadModal ? (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        ) : null}

        <div className="flex gap-3 overflow-x-auto pb-1">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
          <button
            type="button"
            onClick={openFilePicker}
            className="flex h-36 w-32 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 text-ink-400 transition hover:border-brand-300 hover:text-brand-600"
          >
            <Upload className="h-5 w-5" />
            <span className="px-2 text-center text-xs font-medium">Upload Document</span>
          </button>
        </div>

        <p className="mt-3 text-xs text-ink-400">
          Accepted formats: JPEG, PNG, or PDF (max 10 MB).
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={handleFileChange}
        />
      </section>

      {uploadModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div className="w-full max-w-md rounded-[var(--radius-card)] border border-ink-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-ink-800">Upload document</h4>
                <p className="mt-1 text-sm text-ink-500">{uploadModal.file.name}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadModal(null);
                  setError(null);
                }}
                className="rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <Input
                label="Document title"
                value={uploadModal.title}
                onChange={(event) =>
                  setUploadModal((prev) =>
                    prev ? { ...prev, title: event.target.value } : prev,
                  )
                }
                placeholder="e.g. Land Title, Tax Declaration"
              />

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setUploadModal(null);
                    setError(null);
                  }}
                  disabled={uploadMutation.isPending}
                >
                  Cancel
                </Button>
                <Button size="md" onClick={handleUpload} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DocumentCard({ doc }: { doc: FarmerLandDocument }) {
  const fileUrl = resolveAssetUrl(doc.fileUrl);
  const isVerified = doc.status === 'verified';
  const isImage = isImageDocument(doc);
  const isPdf = isPdfDocument(doc);

  return (
    <div className="w-32 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-ink-50">
      <div className="relative flex h-20 items-center justify-center overflow-hidden bg-gradient-to-br from-ink-100 to-ink-50">
        {isImage && fileUrl ? (
          <img
            src={fileUrl}
            alt={doc.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileText className="h-8 w-8 text-ink-300" />
        )}
        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-1 top-1 rounded bg-white/90 p-1 text-ink-500 shadow-sm hover:text-brand-600"
            aria-label={`Open ${doc.title}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
      <div className="space-y-1 p-2">
        <div className="truncate text-xs font-medium text-ink-800" title={doc.title}>
          {doc.title}
        </div>
        <span
          className={
            isVerified
              ? 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700'
              : 'inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700'
          }
        >
          <span
            className={`h-1 w-1 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}
          />
          {isVerified ? 'Verified' : 'Pending'}
        </span>
        {isPdf && fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-[10px] font-medium text-brand-600 hover:underline"
          >
            View PDF
          </a>
        ) : null}
        <div className="flex items-center gap-1 text-[10px] text-ink-400">
          <Calendar className="h-3 w-3" />
          {formatDate(doc.uploadedAt)}
        </div>
      </div>
    </div>
  );
}
