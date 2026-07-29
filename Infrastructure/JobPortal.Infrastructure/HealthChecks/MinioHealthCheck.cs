using Amazon.S3;
using Amazon.S3.Model;
using JobPortal.Infrastructure.Options;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace JobPortal.Infrastructure.HealthChecks;

public class MinioHealthCheck : IHealthCheck
{
    private readonly AmazonS3Client _s3;
    private readonly string _bucketName;

    public MinioHealthCheck(IOptions<StorageOptions> opts)
    {
        var o = opts.Value;
        var config = new AmazonS3Config
        {
            ServiceURL = $"{(o.UseSSL ? "https" : "http")}://{o.Endpoint}",
            ForcePathStyle = o.ForcePathStyle,
        };
        _s3 = new AmazonS3Client(o.AccessKey, o.SecretKey, config);
        _bucketName = o.BucketName;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _s3.GetBucketLocationAsync(
                new GetBucketLocationRequest { BucketName = _bucketName },
                cancellationToken);
            return HealthCheckResult.Healthy("MinIO bucket reachable.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("MinIO unreachable.", ex);
        }
    }
}
