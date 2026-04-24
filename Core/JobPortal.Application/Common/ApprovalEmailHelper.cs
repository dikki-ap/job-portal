using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Jobs;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Common;

internal static class ApprovalEmailHelper
{
    internal static void FireAndForgetApprovalEmail(
        IEmailService emailService,
        string baseUrl,
        ILogger logger,
        JobApprovalInstance instance,
        JobApprovalInstanceStep step)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                await SendApprovalEmailAsync(emailService, baseUrl, logger, instance, step);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send approval email jobPostId={JobPostId} stepOrder={StepOrder}",
                    instance.JobPostId, step.StepOrder);
            }
        });
    }

    private static async Task SendApprovalEmailAsync(
        IEmailService emailService,
        string baseUrl,
        ILogger logger,
        JobApprovalInstance instance,
        JobApprovalInstanceStep step)
    {
        var job = instance.JobPost;
        if (job is null) return;

        baseUrl = baseUrl.TrimEnd('/');
        var jobLink = $"{baseUrl}/jobs/{job.Id}/approve";

        var salaryRange = BuildSalaryRange(job);
        var subject = $"[Action Required] Approval Needed: {job.Title}";
        var body = BuildEmailBody(job, step, jobLink, salaryRange, instance.Steps.Count);

        logger.LogDebug("ApprovalEmail jobPostId={JobPostId} stepOrder={StepOrder} to={To}",
            job.Id, step.StepOrder, step.ApproverEmail);

        await emailService.SendAsync(step.ApproverEmail, subject, body);
    }

    private static string BuildSalaryRange(JobPost job)
    {
        if (job.MinSalary is null && job.MaxSalary is null) return "-";
        var prefix = job.CurrencyType?.Prefix ?? string.Empty;
        var min = job.MinSalary.HasValue ? $"{prefix} {job.MinSalary:N0}".Trim() : null;
        var max = job.MaxSalary.HasValue ? $"{prefix} {job.MaxSalary:N0}".Trim() : null;
        return (min, max) switch
        {
            (not null, not null) => $"{min} – {max}",
            (not null, null) => $"From {min}",
            (null, not null) => $"Up to {max}",
            _ => "-",
        };
    }

    private static string BuildEmailBody(JobPost job, JobApprovalInstanceStep step, string jobLink, string salaryRange, int totalSteps)
    {
        return $"""
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                    <tr><td style="background:#004181;padding:24px 32px;">
                      <h1 style="margin:0;color:#ffffff;font-size:20px;">Job Post Approval Required</h1>
                    </td></tr>
                    <tr><td style="padding:28px 32px;">
                      <p style="margin:0 0 8px;color:#374151;font-size:14px;">Dear <strong>{step.ApproverName}</strong>,</p>
                      <p style="margin:0 0 24px;color:#374151;font-size:14px;">
                        A job post requires your approval. Please review the details below and take action.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;">
                        <tr style="background:#f9fafb;"><td colspan="2" style="padding:10px 16px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Job Details</td></tr>
                        {TableRow("Job Title", job.Title)}
                        {TableRow("Department", job.Department?.Name ?? "-")}
                        {TableRow("Job Level", job.JobLevel?.Name ?? "-")}
                        {TableRow("Job Category", job.JobCategory?.Name ?? "-")}
                        {TableRow("Work Mode", job.WorkMode?.Name ?? "-")}
                        {TableRow("Employment Type", job.EmploymentType?.Name ?? "-")}
                        {TableRow("Quota", job.Quota.ToString())}
                        {TableRow("Salary Range", salaryRange)}
                        {TableRow("Min. Education", job.MinEducationLevel?.Name ?? "-")}
                        {TableRow("Approval Step", $"Step {step.StepOrder} of {totalSteps}")}
                      </table>
                      <p style="margin:0 0 20px;color:#374151;font-size:14px;">
                        Click the button below to view the full job post and submit your decision (login required).
                      </p>
                      <table cellpadding="0" cellspacing="0"><tr><td>
                        <a href="{jobLink}" style="display:inline-block;background:#004181;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;">
                          Review Job Post
                        </a>
                      </td></tr></table>
                    </td></tr>
                    <tr><td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                      <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated notification. Do not reply to this email.</p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;
    }

    private static string TableRow(string label, string value)
        => $"""
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:10px 16px;font-size:13px;color:#6b7280;width:40%;white-space:nowrap;">{label}</td>
              <td style="padding:10px 16px;font-size:13px;color:#111827;font-weight:500;">{System.Net.WebUtility.HtmlEncode(value)}</td>
            </tr>
            """;
}
