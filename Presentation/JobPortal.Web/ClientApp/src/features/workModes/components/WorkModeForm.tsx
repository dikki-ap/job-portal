import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateWorkModeMutation, useUpdateWorkModeMutation } from '../api/workModesApi';
import type { WorkModeDto } from '../../../types/api';

interface WorkModeFormProps {
  open: boolean;
  onClose: () => void;
  editing?: WorkModeDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function WorkModeForm({ open, onClose, editing, onSuccess, onError }: WorkModeFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [createWorkMode, { isLoading: isCreating }] = useCreateWorkModeMutation();
  const [updateWorkMode, { isLoading: isUpdating }] = useUpdateWorkModeMutation();
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
    if (!trimmed) { setError('Work mode name is required.'); return; }
    if (trimmed.length > 100) { setError('Work mode name must not exceed 100 characters.'); return; }

    try {
      if (editing) {
        await updateWorkMode({ id: editing.id, name: trimmed }).unwrap();
        onSuccess('Work mode updated successfully.');
      } else {
        await createWorkMode({ name: trimmed }).unwrap();
        onSuccess('Work mode created successfully.');
      }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      const message = data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.';
      onError(message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Work Mode' : 'Add Work Mode'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="work-mode-name"
          label="Work Mode Name"
          placeholder="e.g. Remote"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
          autoFocus
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{editing ? 'Save Changes' : 'Add Work Mode'}</Button>
        </div>
      </form>
    </Modal>
  );
}
