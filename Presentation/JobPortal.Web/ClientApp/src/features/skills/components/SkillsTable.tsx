import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useDeleteSkillMutation } from "../api/skillsApi";
import { formatDateTime } from "../../../lib/format";
import type { SkillDto } from "../../../types/api";

interface SkillsTableProps {
  skills: SkillDto[];
  onEdit: (skill: SkillDto) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function SkillsTable({ skills, onEdit, onSuccess, onError }: SkillsTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmSkill, setConfirmSkill] = useState<SkillDto | null>(null);
  const [deleteSkill] = useDeleteSkillMutation();

  const handleDelete = async () => {
    if (!confirmSkill) return;
    setDeletingId(confirmSkill.id);
    try {
      await deleteSkill(confirmSkill.id).unwrap();
      onSuccess(`"${confirmSkill.name}" has been deleted.`);
    } catch {
      onError("Failed to delete skill. It may be in use.");
    } finally {
      setDeletingId(null);
      setConfirmSkill(null);
    }
  };

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">No skills found.</p>
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
              <th className="px-6 py-3 hidden lg:table-cell">Created By</th>
              <th className="px-6 py-3 hidden md:table-cell">Created At</th>
              <th className="px-6 py-3 hidden lg:table-cell">Updated By</th>
              <th className="px-6 py-3 hidden md:table-cell">Updated At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {skills.map((skill, idx) => (
              <tr key={skill.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{skill.name}</td>
                <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{skill.createdByName ?? "—"}</td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{formatDateTime(skill.createdAt)}</td>
                <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{skill.updatedByName ?? "—"}</td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{formatDateTime(skill.updatedAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(skill)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setConfirmSkill(skill)}
                      loading={deletingId === skill.id}
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

      <Modal open={!!confirmSkill} onClose={() => setConfirmSkill(null)} title="Delete Skill">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">"{confirmSkill?.name}"</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmSkill(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={!!deletingId}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
