namespace JobPortal.Infrastructure.Options;

public class SmtpOptions
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public string FromAddress { get; set; } = string.Empty;
    public string FromName { get; set; } = "Job Portal";
    public string? Username { get; set; }
    public string? Password { get; set; }
    public bool UseSsl { get; set; } = false;
}
