using Amazon.S3;
using Amazon.S3.Model;
using JobPortal.Infrastructure.Options;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace JobPortal.Infrastructure.HealthChecks;

public class MinioHealthCheck(IOptions<StorageOptions> opts) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var o = opts.Value;
            var config = new AmazonS3Config
            {
                ServiceURL = $"{(o.UseSSL ? "https" : "http")}://{o.Endpoint}",
                ForcePathStyle = o.ForcePathStyle,
            };
            using var s3 = new AmazonS3Client(o.AccessKey, o.SecretKey, config);
            await s3.GetBucketLocationAsync(new GetBucketLocationRequest
            {
                BucketName = o.BucketName
            }, cancellationToken);

            return HealthCheckResult.Healthy("MinIO bucket reachable.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("MinIO unreachable.", ex);
        }
    }
}
