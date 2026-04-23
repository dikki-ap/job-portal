using JobPortal.Domain.Entities.Applications;

namespace JobPortal.Application.Common;

internal static class ApplicationStepHelper
{
    // Lowest-order Pending step where all required previous steps are Passed
    internal static ApplicationStep? FindCurrentActiveStep(Domain.Entities.Applications.Application app)
    {
        foreach (var step in app.Steps.Where(s => s.Status == ApplicationStepStatus.Pending).OrderBy(s => s.StepOrder))
        {
            var hasBlocker = app.Steps.Any(s =>
                s.StepOrder < step.StepOrder &&
                (s.JobStep?.IsRequired ?? true) &&
                s.Status != ApplicationStepStatus.Passed);

            if (!hasBlocker) return step;
        }
        return null;
    }

    internal static bool IsLastRequiredStep(Domain.Entities.Applications.Application app, ApplicationStep step)
        => !app.Steps.Any(s => s.StepOrder > step.StepOrder && (s.JobStep?.IsRequired ?? true));
}
