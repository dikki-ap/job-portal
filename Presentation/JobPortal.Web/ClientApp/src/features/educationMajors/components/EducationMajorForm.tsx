import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateEducationMajorMutation, useUpdateEducationMajorMutation } from '../api/educationMajorsApi';
import type { EducationMajorDto } from '../../../types/api';

interface EducationMajorFormProps {
  open: boolean;
  onClose: () => void;
  editing?: EducationMajorDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function EducationMajorForm({ open, onClose, editing, onSuccess, onError }: EducationMajorFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [createEducationMajor, { isLoading: isCreating }] = useCreateEducationMajorMutation();
  const [updateEducationMajor, { isLoading: isUpdating }] = useUpdateEducationMajorMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => { if (open) { setName(editing?.name ?? ''); setError(''); } }, [open, editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Education major name is required.'); return; }
    if (trimmed.length > 150) { setError('Must not exceed 150 characters.'); return; }
    try {
      if (editing) { await updateEducationMajor({ id: editing.id, name: trimmed }).unwrap(); onSuccess('Education major updated successfully.'); }
      else { await createEducationMajor({ name: trimmed }).unwrap(); onSuccess('Education major created successfully.'); }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      onError(data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Education Major' : 'Add Education Major'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input id="edu-major-name" label="Education Major Name" placeholder="e.g. Computer Science" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} error={error} autoFocus disabled={isLoading} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{editing ? 'Save Changes' : 'Add Education Major'}</Button>
        </div>
      </form>
    </Modal>
  );
}
