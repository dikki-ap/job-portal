namespace JobPortal.Infrastructure.Services;

public class EmailBackgroundJob(SmtpEmailService smtp)
{
    public Task SendAsync(string to, string subject, string body)
        => smtp.SendAsync(to, subject, body);
}
