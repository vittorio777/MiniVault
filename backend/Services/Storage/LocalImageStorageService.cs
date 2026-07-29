namespace MiniVault.Services.Storage;

public class LocalImageStorageService : IImageStorageService
{
    private readonly IWebHostEnvironment _environment;

    public LocalImageStorageService(
        IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(fileName);

        var storedFileName =
            $"{Guid.NewGuid():N}{extension}";

        var uploadsDirectory = Path.Combine(
            _environment.WebRootPath,
            "uploads"
        );

        Directory.CreateDirectory(uploadsDirectory);

        var filePath = Path.Combine(
            uploadsDirectory,
            storedFileName
        );

        await using var fileStream = new FileStream(
            filePath,
            FileMode.Create,
            FileAccess.Write,
            FileShare.None,
            bufferSize: 81920,
            useAsync: true
        );

        await stream.CopyToAsync(
            fileStream,
            cancellationToken
        );

        return $"/uploads/{storedFileName}";
    }

    public Task DeleteAsync(
        string imageUrl,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return Task.CompletedTask;
        }

        var relativePath = imageUrl
            .TrimStart('/')
            .Replace('/', Path.DirectorySeparatorChar);

        var filePath = Path.Combine(
            _environment.WebRootPath,
            relativePath
        );

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }
}