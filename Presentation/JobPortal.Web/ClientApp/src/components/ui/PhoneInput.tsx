import { useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Country {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
  minLen: number;
  maxLen: number;
}

const COUNTRIES: Country[] = [
  { code: 'ID', dialCode: '62',  flag: '🇮🇩', name: 'Indonesia',     minLen: 9,  maxLen: 13 },
  { code: 'US', dialCode: '1',   flag: '🇺🇸', name: 'United States', minLen: 10, maxLen: 10 },
  { code: 'GB', dialCode: '44',  flag: '🇬🇧', name: 'United Kingdom',minLen: 10, maxLen: 10 },
  { code: 'AU', dialCode: '61',  flag: '🇦🇺', name: 'Australia',     minLen: 9,  maxLen: 9  },
  { code: 'MY', dialCode: '60',  flag: '🇲🇾', name: 'Malaysia',      minLen: 9,  maxLen: 11 },
  { code: 'SG', dialCode: '65',  flag: '🇸🇬', name: 'Singapore',     minLen: 8,  maxLen: 8  },
  { code: 'PH', dialCode: '63',  flag: '🇵🇭', name: 'Philippines',   minLen: 10, maxLen: 10 },
  { code: 'TH', dialCode: '66',  flag: '🇹🇭', name: 'Thailand',      minLen: 9,  maxLen: 9  },
  { code: 'VN', dialCode: '84',  flag: '🇻🇳', name: 'Vietnam',       minLen: 9,  maxLen: 10 },
  { code: 'IN', dialCode: '91',  flag: '🇮🇳', name: 'India',         minLen: 10, maxLen: 10 },
  { code: 'CN', dialCode: '86',  flag: '🇨🇳', name: 'China',         minLen: 11, maxLen: 11 },
  { code: 'JP', dialCode: '81',  flag: '🇯🇵', name: 'Japan',         minLen: 10, maxLen: 10 },
  { code: 'KR', dialCode: '82',  flag: '🇰🇷', name: 'South Korea',   minLen: 9,  maxLen: 10 },
  { code: 'DE', dialCode: '49',  flag: '🇩🇪', name: 'Germany',       minLen: 10, maxLen: 12 },
  { code: 'FR', dialCode: '33',  flag: '🇫🇷', name: 'France',        minLen: 9,  maxLen: 9  },
  { code: 'NL', dialCode: '31',  flag: '🇳🇱', name: 'Netherlands',   minLen: 9,  maxLen: 9  },
  { code: 'SA', dialCode: '966', flag: '🇸🇦', name: 'Saudi Arabia',  minLen: 9,  maxLen: 9  },
  { code: 'AE', dialCode: '971', flag: '🇦🇪', name: 'UAE',           minLen: 9,  maxLen: 9  },
];

function parsePhone(value: string): { country: Country; local: string } {
  const defaultCountry = COUNTRIES[0];
  if (!value.startsWith('+')) return { country: defaultCountry, local: value };
  const digits = value.slice(1);
  // Try longest dialCode first (3-digit codes before 1-digit)
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (digits.startsWith(c.dialCode)) {
      return { country: c, local: digits.slice(c.dialCode.length) };
    }
  }
  return { country: defaultCountry, local: digits };
}

interface PhoneInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PhoneInput({ id, label, value, onChange, error }: PhoneInputProps) {
  const parsed = useMemo(() => parsePhone(value), [value]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const select = (country: Country) => {
    setOpen(false);
    setSearch('');
    onChange(`+${country.dialCode}${parsed.local}`);
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localDigits = e.target.value.replace(/\D/g, '');
    onChange(`+${parsed.country.dialCode}${localDigits}`);
  };

  const localError = (() => {
    if (!parsed.local) return null;
    const len = parsed.local.length;
    const { minLen, maxLen, name } = parsed.country;
    if (len < minLen) return `${name} numbers need at least ${minLen} digits`;
    if (len > maxLen) return `${name} numbers allow max ${maxLen} digits`;
    return null;
  })();

  const displayError = error ?? localError ?? undefined;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative flex gap-0">
        {/* Country selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => { setOpen((o) => !o); setSearch(''); }}
            className={cn(
              'flex items-center gap-1.5 h-10 rounded-l-lg border border-r-0 border-gray-300 bg-white px-3 text-sm text-gray-700',
              'hover:bg-gray-50 focus:outline-none focus:border-[#004181] focus:ring-2 focus:ring-[#004181]/20',
              displayError && 'border-red-500',
            )}
          >
            <span className="text-base leading-none">{parsed.country.flag}</span>
            <span className="text-gray-500 text-xs">+{parsed.country.dialCode}</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>

          {open && (
            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="p-2 border-b border-gray-100">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search country…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 rounded-md border border-gray-200 px-2 text-sm focus:outline-none focus:border-[#004181]"
                />
              </div>
              <ul className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 && (
                  <li className="px-3 py-2 text-xs text-gray-400">No countries found</li>
                )}
                {filtered.map((c) => (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => select(c)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-gray-50',
                        c.code === parsed.country.code && 'bg-blue-50 text-[#004181] font-medium'
                      )}
                    >
                      <span className="text-base">{c.flag}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-gray-400 text-xs shrink-0">+{c.dialCode}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Number input */}
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          value={parsed.local}
          onChange={handleLocalChange}
          placeholder={`8xx xxxx xxxx`}
          maxLength={parsed.country.maxLen}
          className={cn(
            'flex-1 h-10 rounded-r-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400',
            'focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20',
            displayError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          )}
        />
      </div>
      {displayError && <p className="text-xs text-red-600">{displayError}</p>}

      {/* Close dropdown on outside click */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setOpen(false); setSearch(''); }}
        />
      )}
    </div>
  );
}
