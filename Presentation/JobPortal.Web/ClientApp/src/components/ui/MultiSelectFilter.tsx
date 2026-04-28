import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FilterOption {
  id: string | number;
  label: string;
}

interface MultiSelectFilterProps<T extends string | number> {
  label: string;
  options: FilterOption[];
  selected: T[];
  onChange: (ids: T[]) => void;
  searchPlaceholder?: string;
}

export function MultiSelectFilter<T extends string | number>({
  label,
  options,
  selected,
  onChange,
  searchPlaceholder,
}: MultiSelectFilterProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: T) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const hasSelected = selected.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm transition-colors',
          hasSelected
            ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] font-medium'
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
        )}
      >
        <span>{label}</span>
        {hasSelected && (
          <>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] font-semibold text-white leading-none">
              {selected.length}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={clearAll}
              onKeyDown={(e) => e.key === 'Enter' && clearAll(e as unknown as React.MouseEvent)}
              className="rounded hover:bg-[var(--primary)]/20 p-0.5 -mr-1"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          </>
        )}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder ?? `Search ${label.toLowerCase()}…`}
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">
                {search ? `No matches for "${search}"` : 'No options available'}
              </p>
            ) : (
              filtered.map((opt) => {
                const isSelected = selected.includes(opt.id as T);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggle(opt.id as T)}
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
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {selected.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                Clear {selected.length} selected
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
