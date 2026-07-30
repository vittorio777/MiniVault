namespace MiniVault.Services.Storage;

public class LocalImageStorageService : IImageStorageService
{
    private readonly string _uploadsDirectory;

    public LocalImageStorageService(IWebHostEnvironment environment)
    {
        _uploadsDirectory = environment.IsDevelopment()
            ? Path.Combine(environment.ContentRootPath, "wwwroot", "uploads")
            : Path.Combine("/home", "data", "minivault", "uploads");

        Directory.CreateDirectory(_uploadsDirectory);
    }

    public async Task<string> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        string? subdirectory = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(stream);

        var extension = GetSafeExtension(fileName, contentType);
        var safeSubdirectory = NormalizeSubdirectory(subdirectory);

        var targetDirectory = string.IsNullOrWhiteSpace(safeSubdirectory)
            ? _uploadsDirectory
            : Path.Combine(_uploadsDirectory, safeSubdirectory);

        Directory.CreateDirectory(targetDirectory);

        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(targetDirectory, storedFileName);

        await using var fileStream = new FileStream(
            filePath,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None,
            bufferSize: 81920,
            useAsync: true
        );

        await stream.CopyToAsync(fileStream, cancellationToken);

        return string.IsNullOrWhiteSpace(safeSubdirectory)
            ? $"/uploads/{storedFileName}"
            : $"/uploads/{safeSubdirectory.Replace(Path.DirectorySeparatorChar, '/')}/{storedFileName}";
    }

    public Task DeleteAsync(
        string imageUrl,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return Task.CompletedTask;
        }

        var filePath = GetPhysicalPath(imageUrl);

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }

    public string GetPhysicalPath(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            throw new ArgumentException("Image URL is required.", nameof(imageUrl));
        }

        var pathOnly = imageUrl;

        if (Uri.TryCreate(imageUrl, UriKind.Absolute, out var absoluteUri))
        {
            pathOnly = absoluteUri.AbsolutePath;
        }

        var normalizedUrl = pathOnly.Replace('\\', '/').Trim();
        const string uploadsPrefix = "/uploads/";

        if (!normalizedUrl.StartsWith(uploadsPrefix, StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException(
                "Image URL must start with /uploads/.",
                nameof(imageUrl)
            );
        }

        var relativePath = normalizedUrl[uploadsPrefix.Length..];
        var platformRelativePath = relativePath.Replace('/', Path.DirectorySeparatorChar);

        var fullPath = Path.GetFullPath(
            Path.Combine(_uploadsDirectory, platformRelativePath)
        );

        var uploadsRoot = Path.GetFullPath(_uploadsDirectory);
        var rootWithSeparator =
            uploadsRoot.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;

        if (!fullPath.StartsWith(rootWithSeparator, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                "The resolved image path is outside the uploads directory."
            );
        }

        return fullPath;
    }

    private static string NormalizeSubdirectory(string? subdirectory)
    {
        if (string.IsNullOrWhiteSpace(subdirectory))
        {
            return string.Empty;
        }

        var normalized = subdirectory.Replace('\\', '/').Trim('/');
        var segments = normalized.Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (segments.Any(segment =>
                segment is "." or ".."
                || segment.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0))
        {
            throw new ArgumentException(
                "Invalid image subdirectory.",
                nameof(subdirectory)
            );
        }

        return Path.Combine(segments);
    }

    private static string GetSafeExtension(string fileName, string contentType)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();

        if (extension is ".jpg" or ".jpeg" or ".png" or ".webp")
        {
            return extension;
        }

        return contentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => throw new NotSupportedException(
                $"Unsupported image type: {contentType}"
            )
        };
    }
}
