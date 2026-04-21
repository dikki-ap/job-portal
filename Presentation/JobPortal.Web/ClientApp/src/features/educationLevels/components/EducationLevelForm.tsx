import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateEducationLevelMutation, useUpdateEducationLevelMutation } from '../api/educationLevelsApi';
import type { EducationLevelDto } from '../../../types/api';

interface EducationLevelFormProps {
  open: boolean;
  onClose: () => void;
  editing?: EducationLevelDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function EducationLevelForm({ open, onClose, editing, onSuccess, onError }: EducationLevelFormProps) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [nameError, setNameError] = useState('');
  const [levelError, setLevelError] = useState('');
  const [createEducationLevel, { isLoading: isCreating }] = useCreateEducationLevelMutation();
  const [updateEducationLevel, { isLoading: isUpdating }] = useUpdateEducationLevelMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '');
      setLevel(editing ? String(editing.level) : '');
      setNameError('');
      setLevelError('');
    }
  }, [open, editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedLevel = parseInt(level, 10);
    let valid = true;

    if (!trimmedName) { setNameError('Education level name is required.'); valid = false; }
    else if (trimmedName.length > 100) { setNameError('Must not exceed 100 characters.'); valid = false; }

    if (!level || isNaN(parsedLevel) || parsedLevel <= 0) { setLevelError('Level must be a positive number.'); valid = false; }

    if (!valid) return;

    try {
      if (editing) {
        await updateEducationLevel({ id: editing.id, name: trimmedName, level: parsedLevel }).unwrap();
        onSuccess('Education level updated successfully.');
      } else {
        await createEducationLevel({ name: trimmedName, level: parsedLevel }).unwrap();
        onSuccess('Education level created successfully.');
      }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      onError(data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Education Level' : 'Add Education Level'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="edu-level-num"
          label="Level (ordering)"
          placeholder="e.g. 1"
          type="number"
          min={1}
          value={level}
          onChange={(e) => { setLevel(e.target.value); setLevelError(''); }}
          error={levelError}
          autoFocus
          disabled={isLoading}
        />
        <Input
          id="edu-level-name"
          label="Education Level Name"
          placeholder="e.g. High School"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(''); }}
          error={nameError}
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{editing ? 'Save Changes' : 'Add Education Level'}</Button>
        </div>
      </form>
    </Modal>
  );
}
