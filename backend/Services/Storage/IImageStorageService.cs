namespace MiniVault.Services.Storage;

public interface IImageStorageService
{
    Task<string> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default
    );

    Task DeleteAsync(
        string imageUrl,
        CancellationToken cancellationToken = default
    );
}