namespace JobPortal.Application.Interfaces.Services;

public interface IStorageService
{
    Task<string> UploadAsync(Stream stream, string extension, string contentType, string userFolder, CancellationToken cancellationToken = default);
    Task<string> GeneratePresignedUrlAsync(string storageKey, int expiryMinutes, CancellationToken cancellationToken = default);
}
