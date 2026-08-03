import { useRef, useState, useEffect } from 'react';
import { Pencil, Upload, X, FileText } from 'lucide-react';
import { Button } from './Button';

const ALLOWED_ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface Props {
  open: boolean;
  onClose: () => void;
  currentName: string;
  currentFileName: string;
  onUpdate: (name: string, file: File | null) => Promise<void>;
  isUpdating: boolean;
}

export function UpdateCompanyDocumentModal({ open, onClose, currentName, currentFileName, onUpdate, isUpdating }: Props) {
  const [name, setName] = useState(currentName);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(currentName);
      setFile(null);
      setFileError('');
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [open, currentName]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const picked = e.target.files?.[0] ?? null;
    if (!picked) { setFile(null); return; }

    if (!ALLOWED_MIME_TYPES.has(picked.type)) {
      setFileError('File type not allowed. Use PDF, DOC, DOCX, JPEG, or PNG.');
      setFile(null);
      e.target.value = '';
      return;
    }
    if (picked.size > MAX_SIZE_BYTES) {
      setFileError('File exceeds the 5 MB limit.');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(picked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await onUpdate(trimmed, file);
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClose = () => {
    if (isUpdating) return;
    setName(currentName);
    setFile(null);
    setFileError('');
    if (inputRef.current) inputRef.current.value = '';
    onClose();
  };

  const nameChanged = name.trim() !== currentName.trim();
  const canSubmit = (nameChanged || file !== null) && name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-gray-900">Update Document</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUpdating}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="e.g. MCU Report"
              disabled={isUpdating}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 disabled:bg-gray-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Replace File <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div
              className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-center hover:border-[var(--primary)] hover:bg-blue-50/30 transition-colors cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="h-5 w-5 text-[var(--primary)] shrink-0" />
                  <span className="font-medium break-all">{file.name}</span>
                  <span className="text-gray-400 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ) : currentFileName ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                    <span className="font-medium break-all text-gray-600">{currentFileName}</span>
                  </div>
                  <p className="text-xs text-gray-400">Current file · click to replace</p>
                </div>
              ) : (
                <>
                  <Upload className="h-7 w-7 text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Click to choose a new file</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPEG, PNG · max 5 MB</p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_ACCEPT}
                onChange={handleFileChange}
                disabled={isUpdating}
                className="hidden"
              />
            </div>
            {fileError && <p className="text-xs text-red-600">{fileError}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isUpdating}
              disabled={!canSubmit}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" /> Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
