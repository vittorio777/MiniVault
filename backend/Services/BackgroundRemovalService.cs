using System.Net.Http.Headers;

using IOFile = System.IO.File;
using SysEnvironment = System.Environment;

namespace MiniVault.Services;

public class BackgroundRemovalService
{
    private const string RemoveBackgroundEndpoint =
        "https://api.remove.bg/v1.0/removebg";

    private readonly HttpClient _httpClient;
    private readonly IWebHostEnvironment _environment;
    private readonly string _apiKey;

    public BackgroundRemovalService(
        HttpClient httpClient,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        _httpClient = httpClient;
        _environment = environment;

        _apiKey =
            configuration["RemoveBg:ApiKey"]
            ?? SysEnvironment.GetEnvironmentVariable(
                "REMOVE_BG_API_KEY"
            )
            ?? throw new InvalidOperationException(
                "Remove.bg API key is missing."
            );

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            throw new InvalidOperationException(
                "Remove.bg API key is missing."
            );
        }
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
            ConvertImageUrlToLocalPath(imageUrl);

        if (!IOFile.Exists(inputLocalPath))
        {
            throw new FileNotFoundException(
                "Generated image does not exist.",
                inputLocalPath
            );
        }

        var outputFileName =
            $"{Guid.NewGuid()}.png";

        var outputRelativePath =
            Path.Combine(
                "uploads",
                "generated",
                outputFileName
            );

        var outputLocalPath =
            Path.Combine(
                GetWebRootPath(),
                outputRelativePath
            );

        Directory.CreateDirectory(
            Path.GetDirectoryName(outputLocalPath)!
        );

        try
        {
            await using var imageStream =
                IOFile.OpenRead(inputLocalPath);

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

            // 高清
            // form.Add(
            //     new StringContent("auto"),
            //     "size"
            // );

            // 预览
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
                new FileStream(
                    outputLocalPath,
                    FileMode.Create,
                    FileAccess.Write,
                    FileShare.None
                );

            await response.Content.CopyToAsync(outputStream);

            return "/" +
                   outputRelativePath.Replace(
                       Path.DirectorySeparatorChar,
                       '/'
                   );
        }
        catch
        {
            if (IOFile.Exists(outputLocalPath))
            {
                IOFile.Delete(outputLocalPath);
            }

            throw;
        }
    }

    private string ConvertImageUrlToLocalPath(
        string imageUrl)
    {
        var relativePath =
            imageUrl
                .TrimStart('/')
                .Replace(
                    "/",
                    Path.DirectorySeparatorChar.ToString()
                );

        return Path.Combine(
            GetWebRootPath(),
            relativePath
        );
    }

    private string GetWebRootPath()
    {
        if (!string.IsNullOrWhiteSpace(
                _environment.WebRootPath
            ))
        {
            return _environment.WebRootPath;
        }

        return Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot"
        );
    }

    private static string GetMimeType(
        string path)
    {
        var extension =
            Path.GetExtension(path)
                .ToLowerInvariant();

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
