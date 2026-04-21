import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateDocumentTypeMutation, useUpdateDocumentTypeMutation } from '../api/documentTypesApi';
import type { DocumentTypeDto } from '../../../types/api';

interface DocumentTypeFormProps {
  open: boolean;
  onClose: () => void;
  editing?: DocumentTypeDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function DocumentTypeForm({ open, onClose, editing, onSuccess, onError }: DocumentTypeFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [createDocumentType, { isLoading: isCreating }] = useCreateDocumentTypeMutation();
  const [updateDocumentType, { isLoading: isUpdating }] = useUpdateDocumentTypeMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => { if (open) { setName(editing?.name ?? ''); setError(''); } }, [open, editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Document type name is required.'); return; }
    if (trimmed.length > 100) { setError('Must not exceed 100 characters.'); return; }
    try {
      if (editing) { await updateDocumentType({ id: editing.id, name: trimmed }).unwrap(); onSuccess('Document type updated successfully.'); }
      else { await createDocumentType({ name: trimmed }).unwrap(); onSuccess('Document type created successfully.'); }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      onError(data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Document Type' : 'Add Document Type'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input id="doc-type-name" label="Document Type Name" placeholder="e.g. Resume" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} error={error} autoFocus disabled={isLoading} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{editing ? 'Save Changes' : 'Add Document Type'}</Button>
        </div>
      </form>
    </Modal>
  );
}
