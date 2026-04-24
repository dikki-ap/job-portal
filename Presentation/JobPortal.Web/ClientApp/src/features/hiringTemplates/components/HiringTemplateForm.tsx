import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Mail,
  ChevronRight,
} from "lucide-react";
import { RichTextEditor } from "../../../components/ui/RichTextEditor";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import {
  useCreateHiringTemplateMutation,
  useUpdateHiringTemplateMutation,
} from "../api/hiringTemplatesApi";
import type { HiringTemplateDto } from "../../../types/api";

interface StepItem {
  tempId: string;
  name: string;
  isRequired: boolean;
  passEmailSubject: string;
  passEmailBody: string;
  failEmailSubject: string;
  failEmailBody: string;
  emailOpen: boolean;
}

interface HiringTemplateFormProps {
  open: boolean;
  onClose: () => void;
  editing?: HiringTemplateDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const emptyStep = (): StepItem => ({
  tempId: crypto.randomUUID(),
  name: "",
  isRequired: true,
  passEmailSubject: "",
  passEmailBody: "",
  failEmailSubject: "",
  failEmailBody: "",
  emailOpen: false,
});

export function HiringTemplateForm({
  open,
  onClose,
  editing,
  onSuccess,
  onError,
}: HiringTemplateFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<StepItem[]>([emptyStep()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createTemplate, { isLoading: isCreating }] =
    useCreateHiringTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] =
    useUpdateHiringTemplateMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setDescription(editing?.description ?? "");
      setSteps(
        editing?.steps.length
          ? editing.steps.map((s) => ({
              tempId: crypto.randomUUID(),
              name: s.name,
              isRequired: s.isRequired,
              passEmailSubject: s.passEmailSubject ?? "",
              passEmailBody: s.passEmailBody ?? "",
              failEmailSubject: s.failEmailSubject ?? "",
              failEmailBody: s.failEmailBody ?? "",
              emailOpen: false,
            }))
          : [emptyStep()],
      );
      setErrors({});
    }
  }, [open, editing]);

  const addStep = () => setSteps((prev) => [...prev, emptyStep()]);
  const removeStep = (tempId: string) =>
    setSteps((prev) => prev.filter((s) => s.tempId !== tempId));
  const moveStep = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= steps.length) return;
    setSteps((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  };
  const updateStep = (
    tempId: string,
    field: keyof Omit<StepItem, "tempId">,
    value: string | boolean,
  ) => {
    setSteps((prev) =>
      prev.map((s) => (s.tempId === tempId ? { ...s, [field]: value } : s)),
    );
    setErrors((prev) => ({ ...prev, steps: "" }));
  };
  const toggleEmail = (tempId: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.tempId === tempId ? { ...s, emailOpen: !s.emailOpen } : s,
      ),
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Template name is required.";
    if (steps.length === 0) errs.steps = "At least one step is required.";
    if (steps.some((s) => !s.name.trim()))
      errs.steps = "All step names must be filled.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      steps: steps.map((s) => ({
        name: s.name.trim(),
        isRequired: s.isRequired,
        passEmailSubject: s.passEmailSubject.trim() || null,
        passEmailBody: s.passEmailBody.trim() || null,
        failEmailSubject: s.failEmailSubject.trim() || null,
        failEmailBody: s.failEmailBody.trim() || null,
      })),
    };
    try {
      if (editing) {
        await updateTemplate({ id: editing.id, ...payload }).unwrap();
        onSuccess("Hiring template updated successfully.");
      } else {
        await createTemplate(payload).unwrap();
        onSuccess("Hiring template created successfully.");
      }
      onClose();
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })
        ?.data;
      onError(
        data?.errors?.[0] ?? data?.error ?? "An unexpected error occurred.",
      );
    }
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button type="submit" form="ht-form" loading={isLoading}>
        {editing ? "Save Changes" : "Add Template"}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Hiring Template" : "Add Hiring Template"}
      className="max-w-2xl"
      footer={footer}
    >
      <form
        id="ht-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
      >
        <Input
          id="ht-name"
          label="Template Name"
          placeholder="e.g. Tech Hiring Pipeline"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((p) => ({ ...p, name: "" }));
          }}
          error={errors.name}
          autoFocus
          disabled={isLoading}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="ht-desc"
            className="text-sm font-medium text-gray-700"
          >
            Description{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="ht-desc"
            rows={2}
            placeholder="Brief description of when to use this template..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70 resize-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Hiring Steps
            </span>
            {errors.steps && (
              <p className="text-xs text-red-600">{errors.steps}</p>
            )}
          </div>
          {steps.map((step, idx) => (
            <div
              key={step.tempId}
              className="rounded-lg border border-gray-200 bg-gray-50"
            >
              {/* Step row */}
              <div className="flex items-center gap-2 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004181] text-xs font-semibold text-white">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  placeholder="e.g. HR Interview"
                  value={step.name}
                  onChange={(e) =>
                    updateStep(step.tempId, "name", e.target.value)
                  }
                  disabled={isLoading}
                  className="h-9 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 disabled:opacity-70"
                />
                <label className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
                  <input
                    type="checkbox"
                    checked={step.isRequired}
                    onChange={(e) =>
                      updateStep(step.tempId, "isRequired", e.target.checked)
                    }
                    disabled={isLoading}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-[#004181]"
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => toggleEmail(step.tempId)}
                  disabled={isLoading}
                  title="Email templates for this step"
                  className={`flex items-center gap-1 rounded px-1.5 py-1 text-xs transition-colors disabled:opacity-30 ${step.emailOpen ? "text-[#004181] bg-blue-50" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <ChevronRight
                    className={`h-3 w-3 transition-transform ${step.emailOpen ? "rotate-90" : ""}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(idx, -1)}
                  disabled={idx === 0 || isLoading}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(idx, 1)}
                  disabled={idx === steps.length - 1 || isLoading}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(step.tempId)}
                  disabled={isLoading}
                  className="text-red-400 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Email template panel */}
              {step.emailOpen && (
                <div className="border-t border-gray-200 p-3 flex flex-col gap-3">
                  <p className="text-xs text-gray-500">
                    Use placeholders:{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {"{{CandidateName}}"}
                    </code>{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {"{{JobTitle}}"}
                    </code>{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {"{{StepName}}"}
                    </code>{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {"{{NextStep}}"}
                    </code>
                    . Leave subject &amp; body blank to skip sending.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-green-700">
                        When Passed
                      </span>
                      <input
                        type="text"
                        placeholder="Subject (e.g. You passed {{StepName}})"
                        value={step.passEmailSubject}
                        onChange={(e) =>
                          updateStep(
                            step.tempId,
                            "passEmailSubject",
                            e.target.value,
                          )
                        }
                        disabled={isLoading}
                        className="h-8 rounded-lg border border-gray-300 bg-white px-3 text-xs focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 disabled:opacity-70"
                      />
                      <RichTextEditor
                        value={step.passEmailBody}
                        onChange={(html) =>
                          updateStep(step.tempId, "passEmailBody", html)
                        }
                        placeholder="Email body..."
                        disabled={isLoading}
                        compact
                        minHeight="5rem"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-red-600">
                        When Failed
                      </span>
                      <input
                        type="text"
                        placeholder="Subject (e.g. Update on your application)"
                        value={step.failEmailSubject}
                        onChange={(e) =>
                          updateStep(
                            step.tempId,
                            "failEmailSubject",
                            e.target.value,
                          )
                        }
                        disabled={isLoading}
                        className="h-8 rounded-lg border border-gray-300 bg-white px-3 text-xs focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 disabled:opacity-70"
                      />
                      <RichTextEditor
                        value={step.failEmailBody}
                        onChange={(html) =>
                          updateStep(step.tempId, "failEmailBody", html)
                        }
                        placeholder="Email body..."
                        disabled={isLoading}
                        compact
                        minHeight="5rem"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm font-medium text-[#004181] hover:text-[#003070] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add Step
          </button>
        </div>
      </form>
    </Modal>
  );
}
