import { useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { ToastContainer } from '../../../components/ui/Toast';
import { DepartmentManagerForm } from '../components/DepartmentManagerForm';
import { useGetDepartmentManagersQuery, useDeleteDepartmentManagerMutation } from '../api/departmentManagersApi';
import { useToast } from '../../../hooks/useToast';
import type { DepartmentManagerDto } from '../../../types/api';

export function DepartmentManagersPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentManagerDto | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DepartmentManagerDto | null>(null);
  const { toasts, addToast, dismissToast } = useToast();

  const { data: managers = [], isLoading, isError } = useGetDepartmentManagersQuery();
  const [deleteManager, { isLoading: isDeleting }] = useDeleteDepartmentManagerMutation();

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteManager(confirmDelete.id).unwrap();
      addToast(`"${confirmDelete.fullName}" has been removed.`, 'success');
    } catch {
      addToast('Failed to delete department manager.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Department Managers</h1>
        <p className="text-sm text-gray-500">
          Manage which people can view candidate applications for their assigned department.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Manager
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-[var(--primary)]" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Failed to load department managers. Please try again.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          {managers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Building2 className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No department managers configured yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Position</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Added By</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {managers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{manager.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{manager.position}</td>
                    <td className="px-6 py-4 text-gray-600">{manager.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                        <Building2 className="h-3 w-3" />
                        {manager.departmentName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{manager.createdByName ?? '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditing(manager); setFormOpen(true); }}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setConfirmDelete(manager)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <DepartmentManagerForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        editing={editing}
        onSuccess={(msg) => addToast(msg, 'success')}
        onError={(msg) => addToast(msg, 'error')}
      />

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remove Department Manager">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-600">
            Are you sure you want to remove{' '}
            <span className="font-semibold text-gray-900">"{confirmDelete?.fullName}"</span> from the department managers list?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>Remove</Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
