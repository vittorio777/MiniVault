using System.Net.Http.Headers;

using MiniVault.Services.Storage;

using SysEnvironment = System.Environment;

namespace MiniVault.Services;

public class BackgroundRemovalService
{
    private const string RemoveBackgroundEndpoint =
        "https://api.remove.bg/v1.0/removebg";

    private readonly HttpClient _httpClient;
    private readonly IImageStorageService _imageStorage;
    private readonly string _apiKey;

    public BackgroundRemovalService(
        HttpClient httpClient,
        IConfiguration configuration,
        IImageStorageService imageStorage)
    {
        _httpClient = httpClient;
        _imageStorage = imageStorage;

        _apiKey =
            configuration["RemoveBg:ApiKey"]
            ?? SysEnvironment.GetEnvironmentVariable(
                "REMOVE_BG_API_KEY"
            )
            ?? throw new InvalidOperationException(
                "Remove.bg API key is missing."
            );
    }

    public async Task<string> RemoveBackgroundAsync(
        string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            throw new ArgumentException(
                "Generated image URL is required.",
                nameof(imageUrl)
            );
        }

        var inputLocalPath =
            _imageStorage.GetPhysicalPath(imageUrl);

        if (!File.Exists(inputLocalPath))
        {
            throw new FileNotFoundException(
                "Generated image does not exist.",
                inputLocalPath
            );
        }

        await using var imageStream =
            File.OpenRead(inputLocalPath);

        using var imageContent =
            new StreamContent(imageStream);

        imageContent.Headers.ContentType =
            new MediaTypeHeaderValue(
                GetMimeType(inputLocalPath)
            );

        using var form =
            new MultipartFormDataContent();

        form.Add(
            imageContent,
            "image_file",
            Path.GetFileName(inputLocalPath)
        );

        form.Add(
            new StringContent("preview"),
            "size"
        );

        using var request =
            new HttpRequestMessage(
                HttpMethod.Post,
                RemoveBackgroundEndpoint
            );

        request.Headers.Add(
            "X-Api-Key",
            _apiKey
        );

        request.Content = form;

        using var response =
            await _httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead
            );

        if (!response.IsSuccessStatusCode)
        {
            var errorBody =
                await response.Content.ReadAsStringAsync();

            throw new InvalidOperationException(
                $"Remove.bg request failed with status " +
                $"{(int)response.StatusCode}: {errorBody}"
            );
        }

        await using var outputStream =
            await response.Content.ReadAsStreamAsync();

        return await _imageStorage.UploadAsync(
            outputStream,
            $"{Guid.NewGuid()}.png",
            "image/png",
            "generated"
        );
    }

    private static string GetMimeType(string path)
    {
        var extension =
            Path.GetExtension(path).ToLowerInvariant();

        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => throw new NotSupportedException(
                $"Unsupported image type: {extension}"
            )
        };
    }
}
