namespace MiniVault.Services.Storage;

public class LocalImageStorageService : IImageStorageService
{
    private readonly string _uploadsDirectory;

    public LocalImageStorageService(
        IWebHostEnvironment environment)
    {
        var storageRoot = environment.IsDevelopment()
            ? Path.Combine(
                environment.ContentRootPath,
                "wwwroot"
            )
            : Path.Combine(
                "/home",
                "data",
                "minivault"
            );

        _uploadsDirectory = Path.Combine(
            storageRoot,
            "uploads"
        );

        Directory.CreateDirectory(_uploadsDirectory);
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

        var filePath = Path.Combine(
            _uploadsDirectory,
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

        var fileName = Path.GetFileName(imageUrl);

        if (string.IsNullOrWhiteSpace(fileName))
        {
            return Task.CompletedTask;
        }

        var filePath = Path.Combine(
            _uploadsDirectory,
            fileName
        );

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }
}