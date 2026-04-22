namespace JobPortal.Infrastructure.Options;

public class StorageOptions
{
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = "job-portal-documents";
    public bool UseSSL { get; set; } = false;
    public bool ForcePathStyle { get; set; } = true;
    public int PresignExpireMinutes { get; set; } = 15;
}
