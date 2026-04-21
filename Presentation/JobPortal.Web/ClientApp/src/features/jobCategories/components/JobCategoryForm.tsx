import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateJobCategoryMutation, useUpdateJobCategoryMutation } from '../api/jobCategoriesApi';
import type { JobCategoryDto } from '../../../types/api';

interface JobCategoryFormProps {
  open: boolean;
  onClose: () => void;
  editing?: JobCategoryDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function JobCategoryForm({ open, onClose, editing, onSuccess, onError }: JobCategoryFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [createJobCategory, { isLoading: isCreating }] = useCreateJobCategoryMutation();
  const [updateJobCategory, { isLoading: isUpdating }] = useUpdateJobCategoryMutation();
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
    if (!trimmed) { setError('Job category name is required.'); return; }
    if (trimmed.length > 100) { setError('Job category name must not exceed 100 characters.'); return; }

    try {
      if (editing) {
        await updateJobCategory({ id: editing.id, name: trimmed }).unwrap();
        onSuccess('Job category updated successfully.');
      } else {
        await createJobCategory({ name: trimmed }).unwrap();
        onSuccess('Job category created successfully.');
      }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      const message = data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.';
      onError(message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Job Category' : 'Add Job Category'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="job-category-name"
          label="Job Category Name"
          placeholder="e.g. Engineering"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
          autoFocus
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{editing ? 'Save Changes' : 'Add Job Category'}</Button>
        </div>
      </form>
    </Modal>
  );
}
