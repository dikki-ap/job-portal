import { useState, useEffect, useMemo } from 'react';

export type PageSize = 25 | 50 | 100 | 'all';
export const PAGE_SIZE_OPTIONS: PageSize[] = [25, 50, 100, 'all'];

export function usePagination<T>(items: T[], defaultPageSize: PageSize = 25) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(defaultPageSize);

  // Reset to page 1 whenever the source list or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [items, pageSize]);

  const totalItems = items.length;
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(totalItems / (pageSize || 1));

  const from = totalItems === 0 ? 0 : pageSize === 'all' ? 1 : (currentPage - 1) * pageSize + 1;
  const to = pageSize === 'all' ? totalItems : Math.min(currentPage * (pageSize as number), totalItems);

  const paginated = useMemo(() => {
    if (pageSize === 'all') return items;
    const start = (currentPage - 1) * (pageSize as number);
    return items.slice(start, start + (pageSize as number));
  }, [items, currentPage, pageSize]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    paginated,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    from,
    to,
    goToPage,
    setPageSize,
  };
}
