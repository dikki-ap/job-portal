import { useState, useEffect, useRef } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';
import { useGetDepartmentsQuery } from '../../departments/api/departmentsApi';
import { useCreateDepartmentManagerMutation, useUpdateDepartmentManagerMutation } from '../api/departmentManagersApi';
import type { DepartmentManagerDto } from '../../../types/api';

const MAX_VISIBLE = 5;

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: DepartmentManagerDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

function DepartmentMultiSelect({
  selectedIds,
  onChange,
  disabled,
  error,
}: {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  error?: string;
}) {
  const { data: departments = [] } = useGetDepartmentsQuery();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
        setShowAll(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allFiltered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );
  const visible = showAll ? allFiltered : allFiltered.slice(0, MAX_VISIBLE);
  const hasMore = !showAll && allFiltered.length > MAX_VISIBLE;

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedNames = departments
    .filter((d) => selectedIds.includes(d.id))
    .map((d) => d.name);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-medium text-gray-700">
        Departments <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          className={cn(
            'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-left transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20',
            error
              ? 'border-red-400'
              : open
                ? 'border-[var(--primary)]'
                : 'border-gray-300 hover:border-gray-400',
            disabled && 'cursor-not-allowed bg-gray-50 opacity-70',
            !disabled && 'bg-white cursor-pointer',
          )}
        >
          {selectedNames.length === 0 ? (
            <span className="text-gray-400 flex-1">Select departments…</span>
          ) : (
            selectedNames.map((name, i) => (
              <span
                key={selectedIds[i]}
                className="inline-flex items-center gap-1 rounded-md bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]"
              >
                {name}
                {!disabled && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); toggle(selectedIds[i]); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggle(selectedIds[i]); } }}
                    className="rounded hover:bg-[var(--primary)]/20 p-0.5 -mr-0.5"
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </span>
            ))
          )}
          <ChevronDown className={cn('ml-auto h-4 w-4 text-gray-400 transition-transform shrink-0', open && 'rotate-180')} />
        </button>

        {open && !disabled && (
          <div className="absolute left-0 top-full z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
                placeholder="Search departments…"
                className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-[220px] overflow-y-auto py-1">
              {allFiltered.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">
                  {search ? `No matches for "${search}"` : 'No departments available'}
                </p>
              ) : (
                <>
                  {visible.map((dept) => {
                    const isSelected = selectedIds.includes(dept.id);
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => toggle(dept.id)}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors',
                          isSelected ? 'bg-[var(--primary)]/5 text-[var(--primary)]' : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <span className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                          isSelected ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-gray-300'
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </span>
                        <span className="truncate">{dept.name}</span>
                      </button>
                    );
                  })}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => setShowAll(true)}
                      className="flex w-full items-center justify-center border-t border-gray-100 px-3 py-2 text-xs text-[var(--primary)] hover:bg-gray-50 transition-colors"
                    >
                      Show all {allFiltered.length} departments
                    </button>
                  )}
                </>
              )}
            </div>

            {selectedIds.length > 0 && (
              <div className="border-t border-gray-100 px-3 py-2">
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Clear {selectedIds.length} selected
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function DepartmentManagerForm({ open, onClose, editing, onSuccess, onError }: Props) {
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [departmentIds, setDepartmentIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [create, { isLoading: isCreating }] = useCreateDepartmentManagerMutation();
  const [update, { isLoading: isUpdating }] = useUpdateDepartmentManagerMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setFullName(editing?.fullName ?? '');
      setPosition(editing?.position ?? '');
      setEmail(editing?.email ?? '');
      setDepartmentIds(editing?.departmentIds ?? []);
      setErrors({});
    }
  }, [open, editing]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!position.trim()) errs.position = 'Position is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format.';
    if (departmentIds.length === 0) errs.departmentIds = 'At least one department is required.';
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
      departmentIds,
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
        <DepartmentMultiSelect
          selectedIds={departmentIds}
          onChange={(ids) => { setDepartmentIds(ids); setErrors((p) => ({ ...p, departmentIds: '' })); }}
          disabled={isLoading}
          error={errors.departmentIds}
        />
      </form>
    </Modal>
  );
}
