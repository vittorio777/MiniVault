namespace MiniVault.Services.Storage;

/// <summary>
/// Defines a storage abstraction for uploading, deleting,
/// and resolving image files.
/// </summary>
public interface IImageStorageService
{
    /// <summary>
    /// Stores an image and returns its application-relative URL.
    /// </summary>
    Task<string> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        string? subdirectory = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Deletes the image referenced by the specified URL.
    /// </summary>
    Task DeleteAsync(
        string imageUrl,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Resolves an application image URL to its physical file path.
    /// </summary>
    string GetPhysicalPath(string imageUrl);
}
