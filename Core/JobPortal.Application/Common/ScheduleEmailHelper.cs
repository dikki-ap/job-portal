using System.Net;
using JobPortal.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;

namespace JobPortal.Application.Common;

internal static class ScheduleEmailHelper
{
    private static string BuildDetailRow(string label, string value, bool first = false)
    {
        var borderTop = first ? string.Empty : "border-top:1px solid #e5e7eb;";
        return $"""
            <tr>
              <td style="padding:10px 16px;color:#6b7280;font-size:13px;width:38%;{borderTop}">{WebUtility.HtmlEncode(label)}</td>
              <td style="padding:10px 16px;color:#111827;font-size:13px;{borderTop}">{value}</td>
            </tr>
            """;
    }

    private static string BuildNoteRow(string note)
        => $"""
            <tr>
              <td colspan="2" style="padding:10px 16px;border-top:1px solid #e5e7eb;">
                <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Notes</p>
                <p style="margin:0;color:#374151;font-size:13px;white-space:pre-wrap;">{WebUtility.HtmlEncode(note)}</p>
              </td>
            </tr>
            """;

    private static string BuildDetailsTable(string stepName, string jobTitle, DateTime scheduledAt, string? location, string? note)
    {
        var formattedDate = scheduledAt.ToString("ddd, dd MMM yyyy — HH:mm") + " UTC";

        var rows = BuildDetailRow("Step", $"<strong>{WebUtility.HtmlEncode(stepName)}</strong>", first: true)
                 + BuildDetailRow("Position", WebUtility.HtmlEncode(jobTitle))
                 + BuildDetailRow("Date &amp; Time", WebUtility.HtmlEncode(formattedDate));

        if (!string.IsNullOrWhiteSpace(location))
        {
            var locationDisplay = Uri.IsWellFormedUriString(location, UriKind.Absolute)
                ? $"<a href=\"{WebUtility.HtmlEncode(location)}\" style=\"color:#004181;\">{WebUtility.HtmlEncode(location)}</a>"
                : WebUtility.HtmlEncode(location);
            rows += BuildDetailRow("Location / Link", locationDisplay);
        }

        if (!string.IsNullOrWhiteSpace(note))
            rows += BuildNoteRow(note);

        return $"""
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin:0 0 24px;">
              <tr>
                <td colspan="2" style="background:#f9fafb;padding:10px 16px;border-bottom:1px solid #e5e7eb;">
                  <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Schedule Details</span>
                </td>
              </tr>
              {rows}
            </table>
            """;
    }

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

        var html = EmailLayout.Wrap(body, primaryColor, companyName);

        try
        {
            await emailService.SendAsync(to, subject, html, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send schedule email appId={AppId}", app.Id);
        }
    }

    internal static Task SendScheduledAsync(
        IEmailService emailService,
        ILogger logger,
        ApplicationEntity app,
        string stepName,
        DateTime scheduledAt,
        string? location,
        string? note,
        string primaryColor,
        string companyName,
        CancellationToken ct = default)
    {
        var candidateName = app.User is { } u ? $"{u.FirstName} {u.LastName}".Trim() : string.Empty;
        var jobTitle = app.JobPost?.Title ?? string.Empty;
        var detailsTable = BuildDetailsTable(stepName, jobTitle, scheduledAt, location, note);

        var subject = $"{stepName} Scheduled — {jobTitle}";
        var body = $"""
            <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi <strong>{WebUtility.HtmlEncode(candidateName)}</strong>,</p>
            <p style="margin:0 0 20px;color:#374151;font-size:14px;">
              Great news! Your <strong>{WebUtility.HtmlEncode(stepName)}</strong> for the position of
              <strong>{WebUtility.HtmlEncode(jobTitle)}</strong> has been scheduled.
              Please find the details below.
            </p>
            {detailsTable}
            <p style="margin:0 0 8px;color:#374151;font-size:14px;">
              If you have any questions or need to discuss the schedule, please don't hesitate to contact our HR team.
            </p>
            <p style="margin:0;color:#374151;font-size:14px;">Best regards,<br/>HR Team</p>
            """;

        return SendAsync(emailService, logger, app, subject, body, primaryColor, companyName, ct);
    }

    internal static Task SendUpdatedAsync(
        IEmailService emailService,
        ILogger logger,
        ApplicationEntity app,
        string stepName,
        DateTime scheduledAt,
        string? location,
        string? note,
        string primaryColor,
        string companyName,
        CancellationToken ct = default)
    {
        var candidateName = app.User is { } u ? $"{u.FirstName} {u.LastName}".Trim() : string.Empty;
        var jobTitle = app.JobPost?.Title ?? string.Empty;
        var detailsTable = BuildDetailsTable(stepName, jobTitle, scheduledAt, location, note);

        var subject = $"{stepName} Rescheduled — {jobTitle}";
        var body = $"""
            <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi <strong>{WebUtility.HtmlEncode(candidateName)}</strong>,</p>
            <p style="margin:0 0 20px;color:#374151;font-size:14px;">
              We'd like to let you know that your <strong>{WebUtility.HtmlEncode(stepName)}</strong> schedule
              for the position of <strong>{WebUtility.HtmlEncode(jobTitle)}</strong> has been updated.
              Please review the new details below.
            </p>
            {detailsTable}
            <p style="margin:0 0 8px;color:#374151;font-size:14px;">
              If you have any questions or concerns regarding the updated schedule, please reach out to our HR team.
            </p>
            <p style="margin:0;color:#374151;font-size:14px;">Best regards,<br/>HR Team</p>
            """;

        return SendAsync(emailService, logger, app, subject, body, primaryColor, companyName, ct);
    }

    internal static Task SendCancelledAsync(
        IEmailService emailService,
        ILogger logger,
        ApplicationEntity app,
        string stepName,
        string primaryColor,
        string companyName,
        CancellationToken ct = default)
    {
        var candidateName = app.User is { } u ? $"{u.FirstName} {u.LastName}".Trim() : string.Empty;
        var jobTitle = app.JobPost?.Title ?? string.Empty;

        var subject = $"{stepName} Schedule Cancelled — {jobTitle}";
        var body = $"""
            <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi <strong>{WebUtility.HtmlEncode(candidateName)}</strong>,</p>
            <p style="margin:0 0 20px;color:#374151;font-size:14px;">
              We'd like to inform you that the scheduled <strong>{WebUtility.HtmlEncode(stepName)}</strong>
              for the position of <strong>{WebUtility.HtmlEncode(jobTitle)}</strong> has been cancelled.
            </p>
            <p style="margin:0 0 8px;color:#374151;font-size:14px;">
              Our team will be in touch with you regarding next steps. If you have any questions,
              please don't hesitate to contact our HR team.
            </p>
            <p style="margin:0;color:#374151;font-size:14px;">Best regards,<br/>HR Team</p>
            """;

        return SendAsync(emailService, logger, app, subject, body, primaryColor, companyName, ct);
    }
}
