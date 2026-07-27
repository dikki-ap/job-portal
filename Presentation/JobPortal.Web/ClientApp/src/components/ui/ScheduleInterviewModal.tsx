import { useState, useEffect } from 'react';
import { CalendarClock, MapPin, FileText, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ScheduleData {
  scheduledAt: string | null;
  scheduledLocation: string | null;
  scheduledNote: string | null;
}

interface ScheduleInterviewModalProps {
  open: boolean;
  onClose: () => void;
  stepName: string;
  existing: ScheduleData | null;
  onSave: (data: ScheduleData) => Promise<void>;
  isSaving: boolean;
}

function toLocalDatetimeValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleInterviewModal({
  open, onClose, stepName, existing, onSave, isSaving,
}: ScheduleInterviewModalProps) {
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setDateTime(toLocalDatetimeValue(existing?.scheduledAt ?? null));
    setLocation(existing?.scheduledLocation ?? '');
    setNote(existing?.scheduledNote ?? '');
  }, [open, existing]);

  const hasExisting = !!existing?.scheduledAt;

  const handleSave = () => {
    const scheduledAt = dateTime
      ? new Date(dateTime).toISOString()
      : null;
    onSave({
      scheduledAt,
      scheduledLocation: location.trim() || null,
      scheduledNote: note.trim() || null,
    });
  };

  const handleClear = () => {
    onSave({ scheduledAt: null, scheduledLocation: null, scheduledNote: null });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Schedule — ${stepName}`}
      footer={
        <div className="flex flex-wrap items-center gap-2 justify-between">
          {hasExisting && (
            <Button variant="ghost" size="sm" onClick={handleClear} disabled={isSaving}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Clear Schedule
            </Button>
          )}
          <div className={`flex gap-2 ${hasExisting ? '' : 'ml-auto'}`}>
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button size="sm" onClick={handleSave} loading={isSaving} disabled={!dateTime}>
              Save Schedule
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <CalendarClock className="h-4 w-4 text-gray-400" />
            Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4 text-gray-400" />
            Location / Meeting Link
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Room 3A or https://meet.google.com/..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4 text-gray-400" />
            Notes for Candidate
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any instructions or preparation notes..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
