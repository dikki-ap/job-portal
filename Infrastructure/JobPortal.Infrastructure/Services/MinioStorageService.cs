using Amazon.S3;
using Amazon.S3.Model;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace JobPortal.Infrastructure.Services;

public class MinioStorageService : IStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly StorageOptions _opts;
    private readonly ILogger<MinioStorageService> _logger;
    private bool _bucketReady;

    public MinioStorageService(IOptions<StorageOptions> opts, ILogger<MinioStorageService> logger)
    {
        _opts = opts.Value;
        _logger = logger;

        var config = new AmazonS3Config
        {
            ServiceURL = $"{(_opts.UseSSL ? "https" : "http")}://{_opts.Endpoint}",
            ForcePathStyle = _opts.ForcePathStyle,
        };

        _s3 = new AmazonS3Client(_opts.AccessKey, _opts.SecretKey, config);
    }

    public async Task<string> UploadAsync(Stream stream, string extension, string contentType, string userFolder, CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);

        var storageKey = $"files/{userFolder}/{Guid.NewGuid()}{extension}";

        await _s3.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _opts.BucketName,
            Key = storageKey,
            InputStream = stream,
            ContentType = contentType,
            DisablePayloadSigning = _opts.UseSSL,
        }, cancellationToken);

        _logger.LogDebug("Uploaded file key={Key}", storageKey);
        return storageKey;
    }

    public async Task<string> GeneratePresignedUrlAsync(string storageKey, int expiryMinutes, CancellationToken cancellationToken = default)
    {
        var url = await _s3.GetPreSignedURLAsync(new GetPreSignedUrlRequest
        {
            BucketName = _opts.BucketName,
            Key = storageKey,
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Verb = HttpVerb.GET,
        });

        return url;
    }

    public async Task<(Stream Stream, string ContentType)> DownloadAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var response = await _s3.GetObjectAsync(new GetObjectRequest
        {
            BucketName = _opts.BucketName,
            Key = storageKey,
        }, cancellationToken);

        return (response.ResponseStream, response.Headers.ContentType);
    }

    public async Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        await _s3.DeleteObjectAsync(new DeleteObjectRequest
        {
            BucketName = _opts.BucketName,
            Key = storageKey,
        }, cancellationToken);

        _logger.LogDebug("Deleted file key={Key}", storageKey);
    }

    private async Task EnsureBucketAsync(CancellationToken cancellationToken)
    {
        if (_bucketReady) return;

        try
        {
            await _s3.PutBucketAsync(new PutBucketRequest
            {
                BucketName = _opts.BucketName,
                UseClientRegion = true,
            }, cancellationToken);
            _logger.LogInformation("Created bucket {Bucket}", _opts.BucketName);
        }
        catch (AmazonS3Exception ex) when (ex.ErrorCode is "BucketAlreadyOwnedByYou" or "BucketAlreadyExists")
        {
            // Bucket already exists — expected after first run
        }

        _bucketReady = true;
    }
}
