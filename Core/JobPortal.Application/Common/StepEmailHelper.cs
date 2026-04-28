using System.Text.RegularExpressions;
using JobPortal.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;
using ApplicationStep = JobPortal.Domain.Entities.Applications.ApplicationStep;

namespace JobPortal.Application.Common;

internal static class StepEmailHelper
{
    // Matches a placeholder where HTML tags from inline formatting (bold/italic/underline)
    // interrupt the closing }}: e.g. "{{StepName}</strong>}" → "{{StepName}}</strong>"
    private static readonly Regex SplitClosingBracePattern =
        new(@"\{\{([A-Za-z]+)\}((?:</?[A-Za-z][^>]*>)+)\}", RegexOptions.Compiled);

    private static string Fill(string? template, string candidateName, string jobTitle, string stepName, string nextStepName)
    {
        var t = (template ?? string.Empty)
            // Normalize HTML-entity-encoded curly braces some editors emit
            .Replace("&#123;", "{").Replace("&#125;", "}")
            .Replace("&#x7B;", "{", StringComparison.OrdinalIgnoreCase)
            .Replace("&#x7D;", "}", StringComparison.OrdinalIgnoreCase);

        // Fix split placeholders: "{{Key}</tag>}" → "{{Key}}</tag>"
        t = SplitClosingBracePattern.Replace(t, "{{$1}}$2");

        return t
            .Replace("{{CandidateName}}", candidateName)
            .Replace("{{JobTitle}}", jobTitle)
            .Replace("{{StepName}}", stepName)
            .Replace("{{NextStep}}", nextStepName);
    }

    internal static async Task SendStepEmailAsync(
        IEmailService emailService,
        ILogger logger,
        ApplicationEntity app,
        ApplicationStep step,
        bool passed,
        string primaryColor,
        string companyName,
        CancellationToken cancellationToken = default)
    {
        var to = app.User?.Email;
        if (string.IsNullOrWhiteSpace(to)) return;

        var subject = passed ? step.JobStep?.PassEmailSubject : step.JobStep?.FailEmailSubject;
        var body    = passed ? step.JobStep?.PassEmailBody    : step.JobStep?.FailEmailBody;

        if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(body)) return;

        var candidateName = app.User is { } u ? $"{u.FirstName} {u.LastName}".Trim() : string.Empty;
        var jobTitle      = app.JobPost?.Title ?? string.Empty;
        var stepName      = step.StepName;
        var nextStepName  = app.Steps
            .Where(s => s.StepOrder > step.StepOrder)
            .OrderBy(s => s.StepOrder)
            .FirstOrDefault()?.StepName ?? string.Empty;

        logger.LogDebug("StepEmail appId={AppId} stepId={StepId} stepName={StepName} passed={Passed}",
            app.Id, step.Id, stepName, passed);

        subject = Fill(subject, candidateName, jobTitle, stepName, nextStepName);
        body    = Fill(body,    candidateName, jobTitle, stepName, nextStepName);
        var html = EmailLayout.Wrap(body, primaryColor, companyName);

        try
        {
            await emailService.SendAsync(to, subject, html, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send step email appId={AppId} stepId={StepId}", app.Id, step.Id);
        }
    }

    internal static void FireAndForgetBulkEmails(
        IEmailService emailService,
        ILogger logger,
        IEnumerable<(ApplicationEntity App, ApplicationStep Step, bool Passed)> items,
        string primaryColor,
        string companyName)
    {
        var list = items.ToList();
        if (list.Count == 0) return;

        _ = Task.Run(async () =>
        {
            foreach (var (app, step, passed) in list)
                await SendStepEmailAsync(emailService, logger, app, step, passed, primaryColor, companyName);
        });
    }
}
