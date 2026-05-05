import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useGetDepartmentsQuery } from '../../departments/api/departmentsApi';
import { useCreateDepartmentManagerMutation, useUpdateDepartmentManagerMutation } from '../api/departmentManagersApi';
import type { DepartmentManagerDto } from '../../../types/api';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: DepartmentManagerDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function DepartmentManagerForm({ open, onClose, editing, onSuccess, onError }: Props) {
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: departments = [] } = useGetDepartmentsQuery();
  const [create, { isLoading: isCreating }] = useCreateDepartmentManagerMutation();
  const [update, { isLoading: isUpdating }] = useUpdateDepartmentManagerMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setFullName(editing?.fullName ?? '');
      setPosition(editing?.position ?? '');
      setEmail(editing?.email ?? '');
      setDepartmentId(editing?.departmentId.toString() ?? '');
      setErrors({});
    }
  }, [open, editing]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!position.trim()) errs.position = 'Position is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format.';
    if (!departmentId) errs.departmentId = 'Department is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      fullName: fullName.trim(),
      position: position.trim(),
      email: email.trim().toLowerCase(),
      departmentId: Number(departmentId),
    };
    try {
      if (editing) {
        await update({ id: editing.id, ...payload }).unwrap();
        onSuccess('Department manager updated successfully.');
      } else {
        await create(payload).unwrap();
        onSuccess('Department manager added successfully.');
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
      <Button type="submit" form="dm-form" loading={isLoading}>
        {editing ? 'Save Changes' : 'Add Manager'}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Department Manager' : 'Add Department Manager'}
      className="max-w-lg"
      footer={footer}
    >
      <form id="dm-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          placeholder="e.g. John Doe"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: '' })); }}
          error={errors.fullName}
          autoFocus
          disabled={isLoading}
        />
        <Input
          label="Position / Title"
          placeholder="e.g. Engineering Manager"
          value={position}
          onChange={(e) => { setPosition(e.target.value); setErrors((p) => ({ ...p, position: '' })); }}
          error={errors.position}
          disabled={isLoading}
        />
        <Input
          label="Email"
          type="email"
          placeholder="e.g. john.doe@company.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
          error={errors.email}
          disabled={isLoading}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Department</label>
          <select
            value={departmentId}
            onChange={(e) => { setDepartmentId(e.target.value); setErrors((p) => ({ ...p, departmentId: '' })); }}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
          >
            <option value="">Select department…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.departmentId && <p className="text-xs text-red-600">{errors.departmentId}</p>}
        </div>
      </form>
    </Modal>
  );
}
