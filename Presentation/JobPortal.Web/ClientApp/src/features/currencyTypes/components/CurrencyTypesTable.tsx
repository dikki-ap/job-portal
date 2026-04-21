import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useDeleteCurrencyTypeMutation } from "../api/currencyTypesApi";
import { formatDateTime } from "../../../lib/format";
import type { CurrencyTypeDto } from "../../../types/api";

interface CurrencyTypesTableProps {
  currencyTypes: CurrencyTypeDto[];
  onEdit: (item: CurrencyTypeDto) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function CurrencyTypesTable({ currencyTypes, onEdit, onSuccess, onError }: CurrencyTypesTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmItem, setConfirmItem] = useState<CurrencyTypeDto | null>(null);
  const [deleteCurrencyType] = useDeleteCurrencyTypeMutation();

  const handleDelete = async () => {
    if (!confirmItem) return;
    setDeletingId(confirmItem.id);
    try {
      await deleteCurrencyType(confirmItem.id).unwrap();
      onSuccess(`"${confirmItem.name}" has been deleted.`);
    } catch {
      onError("Failed to delete currency type. It may be in use.");
    } finally {
      setDeletingId(null);
      setConfirmItem(null);
    }
  };

  if (currencyTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">No currency types found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3 w-12">No</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Prefix</th>
              <th className="px-6 py-3 hidden lg:table-cell">Created By</th>
              <th className="px-6 py-3 hidden md:table-cell">Created At</th>
              <th className="px-6 py-3 hidden lg:table-cell">Updated By</th>
              <th className="px-6 py-3 hidden md:table-cell">Updated At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currencyTypes.map((ct, idx) => (
              <tr key={ct.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{ct.name}</td>
                <td className="px-6 py-4 text-gray-600 font-mono">{ct.prefix}</td>
                <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{ct.createdByName ?? "—"}</td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{formatDateTime(ct.createdAt)}</td>
                <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{ct.updatedByName ?? "—"}</td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{formatDateTime(ct.updatedAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(ct)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setConfirmItem(ct)}
                      loading={deletingId === ct.id}
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
      </div>

      <Modal open={!!confirmItem} onClose={() => setConfirmItem(null)} title="Delete Currency Type">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">"{confirmItem?.name}"</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmItem(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={!!deletingId}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
