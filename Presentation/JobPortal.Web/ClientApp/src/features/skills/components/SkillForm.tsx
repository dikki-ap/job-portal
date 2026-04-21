import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateSkillMutation, useUpdateSkillMutation } from '../api/skillsApi';
import type { SkillDto } from '../../../types/api';

interface SkillFormProps {
  open: boolean;
  onClose: () => void;
  editing?: SkillDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function SkillForm({ open, onClose, editing, onSuccess, onError }: SkillFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [createSkill, { isLoading: isCreating }] = useCreateSkillMutation();
  const [updateSkill, { isLoading: isUpdating }] = useUpdateSkillMutation();
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
    if (!trimmed) { setError('Skill name is required.'); return; }
    if (trimmed.length > 100) { setError('Skill name must not exceed 100 characters.'); return; }

    try {
      if (editing) {
        await updateSkill({ id: editing.id, name: trimmed }).unwrap();
        onSuccess('Skill updated successfully.');
      } else {
        await createSkill({ name: trimmed }).unwrap();
        onSuccess('Skill created successfully.');
      }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      const message = data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.';
      onError(message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Skill' : 'Add Skill'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="skill-name"
          label="Skill Name"
          placeholder="e.g. JavaScript"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
          autoFocus
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{editing ? 'Save Changes' : 'Add Skill'}</Button>
        </div>
      </form>
    </Modal>
  );
}
