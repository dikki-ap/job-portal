import PhoneInputLib from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '../../lib/utils';

interface PhoneInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PhoneInput({ id, label, value, onChange, error }: PhoneInputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <PhoneInputLib
        id={id}
        international
        defaultCountry="ID"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        className={cn(
          'phone-input-wrapper',
          error && 'phone-input-error'
        )}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
