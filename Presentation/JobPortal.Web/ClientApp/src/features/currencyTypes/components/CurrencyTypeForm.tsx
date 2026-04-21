import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateCurrencyTypeMutation, useUpdateCurrencyTypeMutation } from '../api/currencyTypesApi';
import type { CurrencyTypeDto } from '../../../types/api';

interface CurrencyTypeFormProps {
  open: boolean;
  onClose: () => void;
  editing?: CurrencyTypeDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function CurrencyTypeForm({ open, onClose, editing, onSuccess, onError }: CurrencyTypeFormProps) {
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [nameError, setNameError] = useState('');
  const [prefixError, setPrefixError] = useState('');

  const [createCurrencyType, { isLoading: isCreating }] = useCreateCurrencyTypeMutation();
  const [updateCurrencyType, { isLoading: isUpdating }] = useUpdateCurrencyTypeMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '');
      setPrefix(editing?.prefix ?? '');
      setNameError('');
      setPrefixError('');
    }
  }, [open, editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPrefix = prefix.trim();
    let valid = true;

    if (!trimmedName) { setNameError('Currency type name is required.'); valid = false; }
    else if (trimmedName.length > 100) { setNameError('Must not exceed 100 characters.'); valid = false; }

    if (!trimmedPrefix) { setPrefixError('Prefix is required.'); valid = false; }
    else if (trimmedPrefix.length > 10) { setPrefixError('Must not exceed 10 characters.'); valid = false; }

    if (!valid) return;

    try {
      if (editing) {
        await updateCurrencyType({ id: editing.id, name: trimmedName, prefix: trimmedPrefix }).unwrap();
        onSuccess('Currency type updated successfully.');
      } else {
        await createCurrencyType({ name: trimmedName, prefix: trimmedPrefix }).unwrap();
        onSuccess('Currency type created successfully.');
      }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      const message = data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.';
      onError(message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Currency Type' : 'Add Currency Type'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="currency-name"
          label="Currency Name"
          placeholder="e.g. Indonesian Rupiah"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(''); }}
          error={nameError}
          autoFocus
          disabled={isLoading}
        />
        <Input
          id="currency-prefix"
          label="Prefix / Symbol"
          placeholder="e.g. Rp"
          value={prefix}
          onChange={(e) => { setPrefix(e.target.value); setPrefixError(''); }}
          error={prefixError}
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{editing ? 'Save Changes' : 'Add Currency Type'}</Button>
        </div>
      </form>
    </Modal>
  );
}
