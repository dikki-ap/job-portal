import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateApprovalLevelMutation, useUpdateApprovalLevelMutation } from '../api/approvalLevelsApi';
import type { ApprovalLevelDto } from '../../../types/api';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: ApprovalLevelDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ApprovalLevelForm({ open, onClose, editing, onSuccess, onError }: Props) {
  const [name, setName] = useState('');
  const [levelOrder, setLevelOrder] = useState('');
  const [approverName, setApproverName] = useState('');
  const [approverEmail, setApproverEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [create, { isLoading: isCreating }] = useCreateApprovalLevelMutation();
  const [update, { isLoading: isUpdating }] = useUpdateApprovalLevelMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '');
      setLevelOrder(editing?.levelOrder.toString() ?? '');
      setApproverName(editing?.approverName ?? '');
      setApproverEmail(editing?.approverEmail ?? '');
      setIsActive(editing?.isActive ?? true);
      setErrors({});
    }
  }, [open, editing]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!levelOrder || isNaN(Number(levelOrder)) || Number(levelOrder) < 1)
      errs.levelOrder = 'Level order must be a positive number.';
    if (!approverName.trim()) errs.approverName = 'Approver name is required.';
    if (!approverEmail.trim()) errs.approverEmail = 'Approver email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(approverEmail))
      errs.approverEmail = 'Invalid email format.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: name.trim(),
      levelOrder: Number(levelOrder),
      approverName: approverName.trim(),
      approverEmail: approverEmail.trim().toLowerCase(),
      isActive,
    };
    try {
      if (editing) {
        await update({ id: editing.id, ...payload }).unwrap();
        onSuccess('Approval level updated successfully.');
      } else {
        await create(payload).unwrap();
        onSuccess('Approval level created successfully.');
      }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      onError(data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.');
    }
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
      <Button type="submit" form="al-form" loading={isLoading}>
        {editing ? 'Save Changes' : 'Add Level'}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Approval Level' : 'Add Approval Level'}
      className="max-w-lg"
      footer={footer}
    >
      <form id="al-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Level Name"
          placeholder="e.g. Direct Manager"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
          error={errors.name}
          autoFocus
          disabled={isLoading}
        />
        <Input
          label="Level Order"
          type="number"
          min={1}
          placeholder="e.g. 1"
          value={levelOrder}
          onChange={(e) => { setLevelOrder(e.target.value); setErrors((p) => ({ ...p, levelOrder: '' })); }}
          error={errors.levelOrder}
          disabled={isLoading}
        />
        <Input
          label="Approver Name"
          placeholder="e.g. John Doe"
          value={approverName}
          onChange={(e) => { setApproverName(e.target.value); setErrors((p) => ({ ...p, approverName: '' })); }}
          error={errors.approverName}
          disabled={isLoading}
        />
        <Input
          label="Approver Email"
          type="email"
          placeholder="e.g. john.doe@company.com"
          value={approverEmail}
          onChange={(e) => { setApproverEmail(e.target.value); setErrors((p) => ({ ...p, approverEmail: '' })); }}
          error={errors.approverEmail}
          disabled={isLoading}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300 text-[var(--primary)]"
          />
          Active
        </label>
      </form>
    </Modal>
  );
}
