import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useDeleteDocumentTypeMutation } from "../api/documentTypesApi";
import { useFormatter } from "../../../lib/useFormatter";
import type { DocumentTypeDto } from "../../../types/api";

interface DocumentTypesTableProps {
  documentTypes: DocumentTypeDto[];
  onEdit: (item: DocumentTypeDto) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
};

export function DocumentTypesTable({ documentTypes, onEdit, onSuccess, onError }: DocumentTypesTableProps) {
  const { formatDateTime } = useFormatter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmItem, setConfirmItem] = useState<DocumentTypeDto | null>(null);
  const [deleteDocumentType] = useDeleteDocumentTypeMutation();

  const handleDelete = async () => {
    if (!confirmItem) return;
    setDeletingId(confirmItem.id);
    try {
      await deleteDocumentType(confirmItem.id).unwrap();
      onSuccess(`"${confirmItem.name}" has been deleted.`);
    } catch {
      onError("Failed to delete document type. It may be in use.");
    } finally {
      setDeletingId(null);
      setConfirmItem(null);
    }
  };

  if (documentTypes.length === 0) {
    return <div className="flex flex-col items-center justify-center py-16 text-gray-400"><p className="text-sm">No document types found.</p></div>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3 w-12">No</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Max Size</th>
              <th className="px-6 py-3">Allowed Types</th>
              <th className="px-6 py-3 hidden lg:table-cell">Created By</th>
              <th className="px-6 py-3 hidden md:table-cell">Created At</th>
              <th className="px-6 py-3 hidden lg:table-cell">Updated By</th>
              <th className="px-6 py-3 hidden md:table-cell">Updated At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documentTypes.map((dt, idx) => (
              <tr key={dt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{dt.name}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{dt.maxFileSizeMb} MB</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {dt.allowedMimeTypes.map((mime) => (
                      <span key={mime} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-[var(--primary)] ring-1 ring-inset ring-blue-200">
                        {MIME_LABELS[mime] ?? mime}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{dt.createdByName ?? "—"}</td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{formatDateTime(dt.createdAt)}</td>
                <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{dt.updatedByName ?? "—"}</td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{formatDateTime(dt.updatedAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(dt)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setConfirmItem(dt)} loading={deletingId === dt.id} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!confirmItem} onClose={() => setConfirmItem(null)} title="Delete Document Type">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-600">Are you sure you want to delete <span className="font-semibold text-gray-900">"{confirmItem?.name}"</span>? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmItem(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={!!deletingId}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
