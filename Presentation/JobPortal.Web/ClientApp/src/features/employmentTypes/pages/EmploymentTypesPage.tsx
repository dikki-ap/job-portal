import { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Pagination } from '../../../components/ui/Pagination';
import { ToastContainer } from '../../../components/ui/Toast';
import { EmploymentTypeForm } from '../components/EmploymentTypeForm';
import { EmploymentTypesTable } from '../components/EmploymentTypesTable';
import { useGetEmploymentTypesQuery } from '../api/employmentTypesApi';
import { usePagination } from '../../../hooks/usePagination';
import { useToast } from '../../../hooks/useToast';
import type { EmploymentTypeDto } from '../../../types/api';

export function EmploymentTypesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmploymentTypeDto | null>(null);
  const [search, setSearch] = useState('');
  const { toasts, addToast, dismissToast } = useToast();

  const { data: employmentTypes = [], isLoading, isError } = useGetEmploymentTypesQuery();

  const filtered = useMemo(
    () => employmentTypes.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())),
    [employmentTypes, search]
  );

  const { paginated, currentPage, totalPages, totalItems, pageSize, from, to, goToPage, setPageSize } =
    usePagination(filtered);

  const handleEdit = (item: EmploymentTypeDto) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Employment Type Management</h1>
        <p className="text-sm text-gray-500">Manage employment types available in the job portal.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employment types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20"
          />
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="shrink-0">
          <Plus className="h-4 w-4" />
          Add Employment Type
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-[#004181]" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Failed to load employment types. Please try again.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <EmploymentTypesTable
            employmentTypes={paginated}
            onEdit={handleEdit}
            onSuccess={(msg) => addToast(msg, 'success')}
            onError={(msg) => addToast(msg, 'error')}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            from={from}
            to={to}
            pageSize={pageSize}
            onPageChange={goToPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <EmploymentTypeForm
        open={formOpen}
        onClose={handleClose}
        editing={editing}
        onSuccess={(msg) => addToast(msg, 'success')}
        onError={(msg) => addToast(msg, 'error')}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
