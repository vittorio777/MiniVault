namespace MiniVault.Services.Storage;

public class LocalImageStorageService : IImageStorageService
{
    private readonly string _uploadsDirectory;

    public LocalImageStorageService(IWebHostEnvironment environment)
    {
        // Use wwwroot during local development and Azure's persistent
        // /home directory in production so uploaded files survive deployments.
        _uploadsDirectory = environment.IsDevelopment()
            ? Path.Combine(environment.ContentRootPath, "wwwroot", "uploads")
            : Path.Combine("/home", "data", "minivault", "uploads");

        Directory.CreateDirectory(_uploadsDirectory);
    }

    /// <summary>
    /// Stores an image and returns its application-relative URL.
    /// </summary>
    public async Task<string> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        string? subdirectory = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(stream);

        // Do not trust the supplied file name directly. Only retain
        // a supported extension and generate a unique stored name.
        var extension = GetSafeExtension(fileName, contentType);
        var safeSubdirectory = NormalizeSubdirectory(subdirectory);

        var targetDirectory = string.IsNullOrWhiteSpace(safeSubdirectory)
            ? _uploadsDirectory
            : Path.Combine(_uploadsDirectory, safeSubdirectory);

        Directory.CreateDirectory(targetDirectory);

        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(targetDirectory, storedFileName);

        // CreateNew prevents an existing file from being overwritten.
        await using var fileStream = new FileStream(
            filePath,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None,
            bufferSize: 81920,
            useAsync: true
        );

        await stream.CopyToAsync(fileStream, cancellationToken);

        // Store and expose relative URLs so the same database values
        // work in both local and Azure environments.
        return string.IsNullOrWhiteSpace(safeSubdirectory)
            ? $"/uploads/{storedFileName}"
            : $"/uploads/{safeSubdirectory.Replace(Path.DirectorySeparatorChar, '/')}/{storedFileName}";
    }

    /// <summary>
    /// Deletes an image when the referenced file exists.
    /// </summary>
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

    /// <summary>
    /// Converts an uploads URL into its validated physical file path.
    /// </summary>
    public string GetPhysicalPath(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            throw new ArgumentException("Image URL is required.", nameof(imageUrl));
        }

        var pathOnly = imageUrl;

        // Accept either an application-relative URL or a full URL.
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

        // Ensure the resolved path remains inside the uploads directory.
        // This prevents path traversal through values such as ../.
        if (!fullPath.StartsWith(rootWithSeparator, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                "The resolved image path is outside the uploads directory."
            );
        }

        return fullPath;
    }

    /// <summary>
    /// Validates and converts an optional URL-style subdirectory
    /// into a platform-specific relative path.
    /// </summary>
    private static string NormalizeSubdirectory(string? subdirectory)
    {
        if (string.IsNullOrWhiteSpace(subdirectory))
        {
            return string.Empty;
        }

        var normalized = subdirectory.Replace('\\', '/').Trim('/');
        var segments = normalized.Split('/', StringSplitOptions.RemoveEmptyEntries);

        // Reject traversal segments and invalid file-system characters.
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

    /// <summary>
    /// Returns a supported image extension using the file name
    /// or, when necessary, the declared content type.
    /// </summary>
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
