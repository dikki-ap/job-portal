import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateJobLevelMutation, useUpdateJobLevelMutation } from '../api/jobLevelsApi';
import type { JobLevelDto } from '../../../types/api';

interface JobLevelFormProps {
  open: boolean;
  onClose: () => void;
  editing?: JobLevelDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function JobLevelForm({ open, onClose, editing, onSuccess, onError }: JobLevelFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [createJobLevel, { isLoading: isCreating }] = useCreateJobLevelMutation();
  const [updateJobLevel, { isLoading: isUpdating }] = useUpdateJobLevelMutation();
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
    if (!trimmed) { setError('Job level name is required.'); return; }
    if (trimmed.length > 100) { setError('Job level name must not exceed 100 characters.'); return; }

    try {
      if (editing) {
        await updateJobLevel({ id: editing.id, name: trimmed }).unwrap();
        onSuccess('Job level updated successfully.');
      } else {
        await createJobLevel({ name: trimmed }).unwrap();
        onSuccess('Job level created successfully.');
      }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      const message = data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.';
      onError(message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Job Level' : 'Add Job Level'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="job-level-name"
          label="Job Level Name"
          placeholder="e.g. Senior"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
          autoFocus
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{editing ? 'Save Changes' : 'Add Job Level'}</Button>
        </div>
      </form>
    </Modal>
  );
}
