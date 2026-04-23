import type { ApplicationDto, ApplicationStepDto } from '../types/api';

export type DerivedStatus = 'Pending' | 'InProgress' | 'InReview' | 'Accepted' | 'Rejected';

export const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  InProgress: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  InReview: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  Accepted: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Rejected: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

export const STATUS_LABEL: Record<string, string> = {
  InProgress: 'In Review',
  InReview: 'In Review',
};

/** Compute the displayed status from step progression rather than the stored field alone. */
export function deriveStatus(app: Pick<ApplicationDto, 'status' | 'steps'>): DerivedStatus {
  if (app.status === 'Accepted') return 'Accepted';
  if (app.status === 'Rejected') return 'Rejected';
  if (app.status === 'InReview') return 'InReview';

  // DB status is 'Pending' — refine to InProgress if at least one step has been passed
  const anyPassed = app.steps.some((s) => s.status === 'Passed');
  return anyPassed ? 'InProgress' : 'Pending';
}

/** Returns true if this step can be acted on (previous required steps are all Passed). */
export function canActOnStep(step: ApplicationStepDto, allSteps: ApplicationStepDto[]): boolean {
  return !allSteps.some(
    (s) => s.stepOrder < step.stepOrder && s.isRequired && s.status !== 'Passed'
  );
}

/** Returns the current active step info for progress display, or null if not applicable. */
export function getCurrentStepInfo(
  app: Pick<ApplicationDto, 'status' | 'steps'>
): { stepOrder: number; total: number; stepName: string } | null {
  if (app.status === 'Accepted' || app.status === 'Rejected') return null;
  if (app.steps.length === 0) return null;

  const total = Math.max(...app.steps.map((s) => s.stepOrder));
  const pendingSorted = [...app.steps]
    .filter((s) => s.status === 'Pending')
    .sort((a, b) => a.stepOrder - b.stepOrder);

  for (const step of pendingSorted) {
    if (canActOnStep(step, app.steps)) {
      return { stepOrder: step.stepOrder, total, stepName: step.stepName };
    }
  }
  return null;
}
