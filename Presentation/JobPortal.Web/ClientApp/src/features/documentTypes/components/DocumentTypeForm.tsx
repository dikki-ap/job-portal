import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import {
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
} from "../api/documentTypesApi";
import type { DocumentTypeDto } from "../../../types/api";

interface DocumentTypeFormProps {
  open: boolean;
  onClose: () => void;
  editing?: DocumentTypeDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const MIME_TYPE_OPTIONS = [
  { value: "application/pdf", label: "PDF" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
  { value: "application/msword", label: "DOC" },
  {
    value:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "DOCX",
  },
];

export function DocumentTypeForm({
  open,
  onClose,
  editing,
  onSuccess,
  onError,
}: DocumentTypeFormProps) {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [maxFileSizeMb, setMaxFileSizeMb] = useState("");
  const [maxSizeError, setMaxSizeError] = useState("");
  const [isDefaultRequired, setIsDefaultRequired] = useState(false);
  const [selectedMimeTypes, setSelectedMimeTypes] = useState<string[]>([]);
  const [mimeError, setMimeError] = useState("");
  const [createDocumentType, { isLoading: isCreating }] =
    useCreateDocumentTypeMutation();
  const [updateDocumentType, { isLoading: isUpdating }] =
    useUpdateDocumentTypeMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setMaxFileSizeMb(editing ? String(editing.maxFileSizeMb) : "");
      setIsDefaultRequired(editing?.isDefaultRequired ?? false);
      setSelectedMimeTypes(editing?.allowedMimeTypes ?? []);
      setNameError("");
      setMaxSizeError("");
      setMimeError("");
    }
  }, [open, editing]);

  const toggleMimeType = (value: string) => {
    setMimeError("");
    setSelectedMimeTypes((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const parsedSize = parseInt(maxFileSizeMb, 10);
    let valid = true;
    if (!trimmed) {
      setNameError("Document type name is required.");
      valid = false;
    } else if (trimmed.length > 100) {
      setNameError("Must not exceed 100 characters.");
      valid = false;
    }
    if (!maxFileSizeMb || isNaN(parsedSize) || parsedSize <= 0) {
      setMaxSizeError("Max file size must be a positive number.");
      valid = false;
    } else if (parsedSize > 50) {
      setMaxSizeError("Max file size must not exceed 50 MB.");
      valid = false;
    }
    if (selectedMimeTypes.length === 0) {
      setMimeError("At least one file type must be selected.");
      valid = false;
    }
    if (!valid) return;

    try {
      if (editing) {
        await updateDocumentType({
          id: editing.id,
          name: trimmed,
          maxFileSizeMb: parsedSize,
          isDefaultRequired,
          mimeTypes: selectedMimeTypes,
        }).unwrap();
        onSuccess("Document type updated successfully.");
      } else {
        await createDocumentType({
          name: trimmed,
          maxFileSizeMb: parsedSize,
          isDefaultRequired,
          mimeTypes: selectedMimeTypes,
        }).unwrap();
        onSuccess("Document type created successfully.");
      }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })
        ?.data;
      onError(
        data?.errors?.[0] ?? data?.error ?? "An unexpected error occurred.",
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Document Type" : "Add Document Type"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="doc-type-name"
          label="Document Type Name"
          placeholder="e.g. Resume"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError("");
          }}
          error={nameError}
          autoFocus
          disabled={isLoading}
        />
        <Input
          id="doc-type-max-size"
          label="Max File Size (MB)"
          placeholder="e.g. 5"
          type="number"
          min={1}
          max={10}
          value={maxFileSizeMb}
          onChange={(e) => {
            setMaxFileSizeMb(e.target.value);
            setMaxSizeError("");
          }}
          error={maxSizeError}
          disabled={isLoading}
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefaultRequired}
            onChange={(e) => setIsDefaultRequired(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
          />
          <span className="text-sm text-gray-700">Required by default for all job posts</span>
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">
            Allowed File Types
          </span>
          <div className="flex flex-wrap gap-2">
            {MIME_TYPE_OPTIONS.map((opt) => {
              const checked = selectedMimeTypes.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => toggleMimeType(opt.value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {mimeError && <p className="text-xs text-red-600">{mimeError}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {editing ? "Save Changes" : "Add Document Type"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
