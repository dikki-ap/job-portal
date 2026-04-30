import { useMemo } from 'react';
import { useBranding } from '../contexts/BrandingContext';
import { formatDate, formatDateTime } from './format';

export function useFormatter() {
  const { timezone } = useBranding();
  return useMemo(() => ({
    formatDate: (iso: string | null | undefined) => formatDate(iso, timezone),
    formatDateTime: (iso: string | null | undefined) => formatDateTime(iso, timezone),
  }), [timezone]);
}
