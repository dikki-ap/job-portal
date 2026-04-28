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
        CancellationToken cancellationToken)
    {
        var to = app.User?.Email;
        if (string.IsNullOrWhiteSpace(to)) return;

        var candidateName = app.User is { } u ? $"{u.FirstName} {u.LastName}".Trim() : string.Empty;
        var jobTitle = app.JobPost?.Title ?? string.Empty;
        var code = app.Code;

        try
        {
            await emailService.SendAsync(
                to,
                Fill(subject, candidateName, jobTitle, code),
                Fill(body, candidateName, jobTitle, code),
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send application email appId={AppId}", app.Id);
        }
    }

    internal static Task SendReceivedAsync(IEmailService emailService, ILogger logger, ApplicationEntity app, CancellationToken ct = default)
        => SendAsync(emailService, logger, app,
            subject: "Application Received — {{JobTitle}}",
            body: """
                <p>Hi {{CandidateName}},</p>
                <p>Thank you for applying for <strong>{{JobTitle}}</strong>. We have received your application and will review it shortly.</p>
                <p>Your application code is: <strong>{{ApplicationCode}}</strong>. You can use this to track your application status.</p>
                <p>Best regards,<br/>HR Team</p>
                """,
            ct);

    internal static Task SendReengageAsync(IEmailService emailService, ILogger logger, ApplicationEntity app, CancellationToken ct = default)
        => SendAsync(emailService, logger, app,
            subject: "We'd Like to Reconnect — {{JobTitle}}",
            body: """
                <p>Hi {{CandidateName}},</p>
                <p>We've been impressed by your profile and would love to consider you for the position of <strong>{{JobTitle}}</strong>.</p>
                <p>We've opened a new application on your behalf. Your application code is: <strong>{{ApplicationCode}}</strong>.</p>
                <p>Our team will be in touch soon with the next steps.</p>
                <p>Best regards,<br/>HR Team</p>
                """,
            ct);

}
