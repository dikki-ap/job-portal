import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Option {
  id: number;
  name: string;
}

interface SkillPickerProps {
  options: Option[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function SkillPicker({
  options,
  selectedIds,
  onChange,
  label,
  disabled,
  placeholder = 'Search and add skills...',
}: SkillPickerProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedOptions = options.filter((o) => selectedIds.includes(o.id));
  const filtered = options.filter(
    (o) => !selectedIds.includes(o.id) && o.name.toLowerCase().includes(search.toLowerCase())
  );

  const add = (id: number) => {
    onChange([...selectedIds, id]);
    setSearch('');
  };

  const remove = (id: number) => {
    onChange(selectedIds.filter((s) => s !== id));
  };

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <span className="text-sm font-medium text-gray-700">
          {label} <span className="text-gray-400 font-normal">(optional)</span>
        </span>
      )}

      <div className="relative">
        <div
          className={cn(
            'min-h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2',
            'focus-within:border-[#004181] focus-within:ring-2 focus-within:ring-[#004181]/20',
            'transition-shadow',
            disabled && 'cursor-not-allowed bg-gray-50 opacity-70'
          )}
        >
          <div className="flex flex-wrap gap-1.5 items-center">
            {selectedOptions.map((opt) => (
              <span
                key={opt.id}
                className="inline-flex items-center gap-1 rounded-md bg-[#004181] px-2 py-0.5 text-xs font-medium text-white"
              >
                {opt.name}
                <button
                  type="button"
                  onClick={() => remove(opt.id)}
                  disabled={disabled}
                  className="hover:text-blue-200 disabled:cursor-not-allowed leading-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={selectedIds.length === 0 ? placeholder : 'Add more...'}
              disabled={disabled}
              className="flex-1 min-w-[140px] text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent disabled:cursor-not-allowed py-0.5"
            />
          </div>
        </div>

        {open && !disabled && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">
                {search ? `No skills match "${search}".` : 'All available skills selected.'}
              </p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => add(opt.id)}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  {opt.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <p className="text-xs text-gray-400">{selectedIds.length} skill{selectedIds.length > 1 ? 's' : ''} selected</p>
      )}
    </div>
  );
}
