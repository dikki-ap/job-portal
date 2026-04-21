import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateEmploymentTypeMutation, useUpdateEmploymentTypeMutation } from '../api/employmentTypesApi';
import type { EmploymentTypeDto } from '../../../types/api';

interface EmploymentTypeFormProps {
  open: boolean;
  onClose: () => void;
  editing?: EmploymentTypeDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function EmploymentTypeForm({ open, onClose, editing, onSuccess, onError }: EmploymentTypeFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [createEmploymentType, { isLoading: isCreating }] = useCreateEmploymentTypeMutation();
  const [updateEmploymentType, { isLoading: isUpdating }] = useUpdateEmploymentTypeMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '');
      setError('');
    }
  }, [open, editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Employment type name is required.'); return; }
    if (trimmed.length > 100) { setError('Employment type name must not exceed 100 characters.'); return; }

    try {
      if (editing) {
        await updateEmploymentType({ id: editing.id, name: trimmed }).unwrap();
        onSuccess('Employment type updated successfully.');
      } else {
        await createEmploymentType({ name: trimmed }).unwrap();
        onSuccess('Employment type created successfully.');
      }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      const message = data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.';
      onError(message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Employment Type' : 'Add Employment Type'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="employment-type-name"
          label="Employment Type Name"
          placeholder="e.g. Full Time"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
          autoFocus
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{editing ? 'Save Changes' : 'Add Employment Type'}</Button>
        </div>
      </form>
    </Modal>
  );
}
