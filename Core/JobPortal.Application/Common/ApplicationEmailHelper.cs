using JobPortal.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;

namespace JobPortal.Application.Common;

internal static class ApplicationEmailHelper
{
    private static string Fill(string template, string candidateName, string jobTitle, string applicationCode)
        => template
            .Replace("{{CandidateName}}", candidateName)
            .Replace("{{JobTitle}}", jobTitle)
            .Replace("{{ApplicationCode}}", applicationCode);

    private static async Task SendAsync(
        IEmailService emailService,
        ILogger logger,
        ApplicationEntity app,
        string subject,
        string body,
        string primaryColor,
        string companyName,
        CancellationToken cancellationToken)
    {
        var to = app.User?.Email;
        if (string.IsNullOrWhiteSpace(to)) return;

        var candidateName = app.User is { } u ? $"{u.FirstName} {u.LastName}".Trim() : string.Empty;
        var jobTitle = app.JobPost?.Title ?? string.Empty;
        var code = app.Code;

        try
        {
            var filledSubject = Fill(subject, candidateName, jobTitle, code);
            var filledBody    = Fill(body, candidateName, jobTitle, code);
            var html          = EmailLayout.Wrap(filledBody, primaryColor, companyName);

            await emailService.SendAsync(to, filledSubject, html, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send application email appId={AppId}", app.Id);
        }
    }

    internal static Task SendReceivedAsync(
        IEmailService emailService,
        ILogger logger,
        ApplicationEntity app,
        string primaryColor,
        string companyName,
        CancellationToken ct = default)
        => SendAsync(emailService, logger, app,
            subject: "Application Received — {{JobTitle}}",
            body: """
                <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi <strong>{{CandidateName}}</strong>,</p>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;">
                  Thank you for applying for <strong>{{JobTitle}}</strong>. We have received your application
                  and will review it shortly.
                </p>
                <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                  Your application code is: <strong style="color:#111827;">{{ApplicationCode}}</strong>.
                  You can use this to track your application status.
                </p>
                <p style="margin:0;color:#374151;font-size:14px;">Best regards,<br/>HR Team</p>
                """,
            primaryColor, companyName, ct);

    internal static Task SendRejectedAsync(
        IEmailService emailService,
        ILogger logger,
        ApplicationEntity app,
        string primaryColor,
        string companyName,
        CancellationToken ct = default)
        => SendAsync(emailService, logger, app,
            subject: "Update on Your Application — {{JobTitle}}",
            body: """
                <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi <strong>{{CandidateName}}</strong>,</p>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;">
                  Thank you for your interest in <strong>{{JobTitle}}</strong> and the time you invested in applying.
                  After careful consideration, we regret to inform you that your application has not been progressed further at this time.
                </p>
                <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                  We truly appreciate your effort and encourage you to apply for future openings that match your profile.
                </p>
                <p style="margin:0;color:#374151;font-size:14px;">Best regards,<br/>HR Team</p>
                """,
            primaryColor, companyName, ct);

    internal static Task SendReengageAsync(
        IEmailService emailService,
        ILogger logger,
        ApplicationEntity app,
        string primaryColor,
        string companyName,
        CancellationToken ct = default)
        => SendAsync(emailService, logger, app,
            subject: "We'd Like to Reconnect — {{JobTitle}}",
            body: """
                <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi <strong>{{CandidateName}}</strong>,</p>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;">
                  We've been impressed by your profile and would love to consider you for the position of
                  <strong>{{JobTitle}}</strong>.
                </p>
                <p style="margin:0 0 16px;color:#374151;font-size:14px;">
                  We've opened a new application on your behalf. Your application code is:
                  <strong style="color:#111827;">{{ApplicationCode}}</strong>.
                </p>
                <p style="margin:0 0 8px;color:#374151;font-size:14px;">Our team will be in touch soon with the next steps.</p>
                <p style="margin:0;color:#374151;font-size:14px;">Best regards,<br/>HR Team</p>
                """,
            primaryColor, companyName, ct);
}
