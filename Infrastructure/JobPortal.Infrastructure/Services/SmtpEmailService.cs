using JobPortal.Application.Interfaces.Services;
using JobPortal.Infrastructure.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace JobPortal.Infrastructure.Services;

public class SmtpEmailService(IOptions<SmtpOptions> options, ILogger<SmtpEmailService> logger) : IEmailService
{
    private readonly SmtpOptions _smtp = options.Value;

    public async Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_smtp.Host))
        {
            logger.LogWarning("SMTP host is not configured — skipping email to {To}", to);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_smtp.FromName, _smtp.FromAddress));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = body };

        using var client = new SmtpClient();
        try
        {
            var socketOptions = _smtp.UseSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTlsWhenAvailable;
            await client.ConnectAsync(_smtp.Host, _smtp.Port, socketOptions, cancellationToken);

            if (!string.IsNullOrWhiteSpace(_smtp.Username))
                await client.AuthenticateAsync(_smtp.Username, _smtp.Password ?? string.Empty, cancellationToken);

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            logger.LogInformation("Email sent to={To} subject={Subject}", to, subject);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to={To} subject={Subject}", to, subject);
            throw;
        }
    }
}
