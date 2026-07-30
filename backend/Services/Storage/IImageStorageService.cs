namespace MiniVault.Services.Storage;

public interface IImageStorageService
{
    Task<string> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        string? subdirectory = null,
        CancellationToken cancellationToken = default
    );

    Task DeleteAsync(
        string imageUrl,
        CancellationToken cancellationToken = default
    );

    string GetPhysicalPath(string imageUrl);
}
