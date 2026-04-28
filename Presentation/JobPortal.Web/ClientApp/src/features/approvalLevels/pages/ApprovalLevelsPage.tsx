import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { ToastContainer } from '../../../components/ui/Toast';
import { ApprovalLevelForm } from '../components/ApprovalLevelForm';
import { useGetApprovalLevelsQuery, useDeleteApprovalLevelMutation } from '../api/approvalLevelsApi';
import { useToast } from '../../../hooks/useToast';
import type { ApprovalLevelDto } from '../../../types/api';

export function ApprovalLevelsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApprovalLevelDto | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApprovalLevelDto | null>(null);
  const { toasts, addToast, dismissToast } = useToast();

  const { data: levels = [], isLoading, isError } = useGetApprovalLevelsQuery();
  const [deleteLevel, { isLoading: isDeleting }] = useDeleteApprovalLevelMutation();

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteLevel(confirmDelete.id).unwrap();
      addToast(`"${confirmDelete.name}" has been deleted.`, 'success');
    } catch {
      addToast('Failed to delete approval level.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Approval Levels</h1>
        <p className="text-sm text-gray-500">
          Configure multi-level approval process for job posts before they are published.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Level
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-[var(--primary)]" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Failed to load approval levels. Please try again.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          {levels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <p className="text-sm">No approval levels configured. Job posts can be published directly.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3 w-16">Order</th>
                  <th className="px-6 py-3">Level Name</th>
                  <th className="px-6 py-3">Approver</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {levels.map((level) => (
                  <tr key={level.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white mx-auto">
                        {level.levelOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{level.name}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{level.approverName}</div>
                      <div className="text-xs text-gray-400">{level.approverEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        level.isActive
                          ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {level.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(level); setFormOpen(true); }} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setConfirmDelete(level)} title="Delete">
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

      <ApprovalLevelForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        editing={editing}
        onSuccess={(msg) => addToast(msg, 'success')}
        onError={(msg) => addToast(msg, 'error')}
      />

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Approval Level">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{confirmDelete?.name}"</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>Delete</Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
