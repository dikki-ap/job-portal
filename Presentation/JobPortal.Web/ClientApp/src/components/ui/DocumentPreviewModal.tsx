import { useEffect, useRef, useState } from 'react';
import { X, Download, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { downloadWithAuth } from '../../lib/download';

const MIME_PREVIEW_TYPE: Record<string, 'pdf' | 'image' | 'docx'> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'image',
  'image/png': 'image',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  documentId: number;
  fileType: string;
  fileName: string;
  token: string | undefined;
}

export function DocumentPreviewModal({ open, onClose, documentId, fileType, fileName, token }: DocumentPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const docxContainerRef = useRef<HTMLDivElement>(null);

  const previewType = MIME_PREVIEW_TYPE[fileType];

  useEffect(() => {
    if (!open || !previewType) return;

    setLoading(true);
    setError(null);
    setBlobUrl(null);
    setDocxBlob(null);

    let currentBlobUrl: string | null = null;

    fetch(`/api/documents/${documentId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load document (${res.status})`);
        const blob = await res.blob();

        if (previewType === 'docx') {
          setDocxBlob(blob);
        } else {
          currentBlobUrl = URL.createObjectURL(blob);
          setBlobUrl(currentBlobUrl);
        }
      })
      .catch((err: unknown) => {
        setError((err as Error)?.message ?? 'Failed to load document');
      })
      .finally(() => setLoading(false));

    return () => {
      if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    };
  }, [open, documentId, token, previewType]);

  // Render DOCX after container div is in the DOM
  useEffect(() => {
    if (!docxBlob || !docxContainerRef.current) return;
    const container = docxContainerRef.current;
    container.innerHTML = '';

    import('docx-preview')
      .then(({ renderAsync }) =>
        renderAsync(docxBlob, container, undefined, {
          className: 'docx',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
        })
      )
      .catch(() => setError('Failed to render DOCX document'));
  }, [docxBlob]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleDownload = () => downloadWithAuth(`/api/documents/${documentId}/download`, token, fileName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl h-[90vh] rounded-xl bg-white shadow-xl flex flex-col overflow-hidden">

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
          <p className="text-base font-semibold text-gray-900 truncate min-w-0 pr-4">{fileName}</p>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
            <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Spinner size="lg" className="text-[var(--primary)]" />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-red-600">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {!previewType && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <p className="text-sm text-gray-500">Preview not available for this file format.</p>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
                    <Download className="h-3.5 w-3.5" /> Download to open
                  </Button>
                </div>
              )}

              {previewType === 'pdf' && blobUrl && (
                <iframe src={blobUrl} className="w-full h-full border-0" title={fileName} />
              )}

              {previewType === 'image' && blobUrl && (
                <div className="flex items-center justify-center h-full p-6 bg-gray-50">
                  <img src={blobUrl} alt={fileName} className="max-w-full max-h-full object-contain rounded-lg shadow" />
                </div>
              )}

              {previewType === 'docx' && (
                <div className="h-full overflow-auto bg-gray-50">
                  <div ref={docxContainerRef} className="min-h-full" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
