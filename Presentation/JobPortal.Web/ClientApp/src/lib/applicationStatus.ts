import type { ApplicationDto, ApplicationStepDto } from '../types/api';

export type DerivedStatus = 'Pending' | 'InProgress' | 'InReview' | 'Accepted' | 'Rejected';

export const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  InProgress: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200',
  InReview: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  Accepted: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Rejected: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

export const STATUS_LABEL: Record<string, string> = {
  InProgress: 'In Progress',
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
