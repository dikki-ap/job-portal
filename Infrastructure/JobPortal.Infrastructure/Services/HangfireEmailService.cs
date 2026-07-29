using Hangfire;
using JobPortal.Application.Interfaces.Services;

namespace JobPortal.Infrastructure.Services;

public class HangfireEmailService(IBackgroundJobClient jobClient) : IEmailService
{
    public Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        jobClient.Enqueue<EmailBackgroundJob>(j => j.SendAsync(to, subject, body));
        return Task.CompletedTask;
    }
}
