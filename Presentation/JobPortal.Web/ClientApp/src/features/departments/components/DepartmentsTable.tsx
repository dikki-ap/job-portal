import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useDeleteDepartmentMutation } from "../api/departmentsApi";
import type { DepartmentDto } from "../../../types/api";

interface DepartmentsTableProps {
  departments: DepartmentDto[];
  onEdit: (dept: DepartmentDto) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function DepartmentsTable({
  departments,
  onEdit,
  onSuccess,
  onError,
}: DepartmentsTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDept, setConfirmDept] = useState<DepartmentDto | null>(null);
  const [deleteDepartment] = useDeleteDepartmentMutation();

  const handleDelete = async () => {
    if (!confirmDept) return;
    setDeletingId(confirmDept.id);
    try {
      await deleteDepartment(confirmDept.id).unwrap();
      onSuccess(`"${confirmDept.name}" has been deleted.`);
    } catch {
      onError("Failed to delete department. It may be in use.");
    } finally {
      setDeletingId(null);
      setConfirmDept(null);
    }
  };

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">No departments found.</p>
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
              <th className="px-6 py-3 hidden md:table-cell">Created At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.map((dept, idx) => (
              <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                  {idx + 1}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {dept.name}
                </td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                  {new Date(dept.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(dept)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setConfirmDept(dept)}
                      loading={deletingId === dept.id}
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

      <Modal
        open={!!confirmDept}
        onClose={() => setConfirmDept(null)}
        title="Delete Department"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              "{confirmDept?.name}"
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDept(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={!!deletingId}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
