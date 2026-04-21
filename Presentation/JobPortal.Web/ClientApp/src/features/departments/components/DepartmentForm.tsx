import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from '../api/departmentsApi';
import type { DepartmentDto } from '../../../types/api';

interface DepartmentFormProps {
  open: boolean;
  onClose: () => void;
  editing?: DepartmentDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function DepartmentForm({ open, onClose, editing, onSuccess, onError }: DepartmentFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
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
    if (!trimmed) { setError('Department name is required.'); return; }
    if (trimmed.length > 100) { setError('Department name must not exceed 100 characters.'); return; }

    try {
      if (editing) {
        await updateDepartment({ id: editing.id, name: trimmed }).unwrap();
        onSuccess('Department updated successfully.');
      } else {
        await createDepartment({ name: trimmed }).unwrap();
        onSuccess('Department created successfully.');
      }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      const message =
        data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.';
      onError(message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Department' : 'Add Department'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="dept-name"
          label="Department Name"
          placeholder="e.g. Engineering"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
          autoFocus
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {editing ? 'Save Changes' : 'Add Department'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
