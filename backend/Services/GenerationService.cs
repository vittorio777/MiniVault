using System.Text.Json;
using Google.GenAI;
using Google.GenAI.Types;
using OpenAI.Chat;
using MiniVault.Models;
using MiniVault.Services.Storage;

using IOFile = System.IO.File;
using SysEnvironment = System.Environment;

namespace MiniVault.Services;

public class GenerationService
{
    private readonly IImageStorageService _imageStorage;
    private readonly CollectibleService _collectibleService;
    private readonly AchievementService _achievementService;
    private readonly BackgroundRemovalService _backgroundRemovalService;
    private readonly ChatClient _openaiClient;
    private readonly Client _googleClient;

    public GenerationService(
        IImageStorageService imageStorage,
        CollectibleService collectibleService,
        AchievementService achievementService,
        BackgroundRemovalService backgroundRemovalService,
        IConfiguration configuration)
    {
        _imageStorage = imageStorage;
        _collectibleService = collectibleService;
        _achievementService = achievementService;
        _backgroundRemovalService = backgroundRemovalService;

        var openaiApiKey =
            configuration["OpenAI:ApiKey"]
            ?? SysEnvironment.GetEnvironmentVariable("OPENAI_API_KEY")
            ?? throw new InvalidOperationException(
                "OpenAI API key is missing."
            );

        var googleApiKey =
            configuration["GoogleAI:ApiKey"]
            ?? SysEnvironment.GetEnvironmentVariable("GOOGLEAI_API_KEY")
            ?? throw new InvalidOperationException(
                "Google AI API key is missing."
            );

        _openaiClient = new ChatClient(
            model: "gpt-5.4-nano",
            apiKey: openaiApiKey
        );

        _googleClient = new Client(
            apiKey: googleApiKey
        );
    }

    public async Task<Collectible> CaptureAsync(
        IFormFile file,
        int userId)
    {
        if (userId <= 0)
        {
            throw new UnauthorizedAccessException(
                "Invalid authenticated user."
            );
        }

        ValidateUploadedImage(file);

        var originalImageUrl = string.Empty;
        var rawGeneratedImageUrl = string.Empty;
        var generatedImageUrl = string.Empty;
        var collectibleCreated = false;

        try
        {
            await using (var originalStream = file.OpenReadStream())
            {
                originalImageUrl =
                    await _imageStorage.UploadAsync(
                        originalStream,
                        file.FileName,
                        file.ContentType
                    );
            }

            var collectible =
                await GenerateInfoAsync(originalImageUrl);

            rawGeneratedImageUrl =
                await GenerateImageAsync(originalImageUrl);

            generatedImageUrl =
                await _backgroundRemovalService
                    .RemoveBackgroundAsync(
                        rawGeneratedImageUrl
                    );

            collectible.UserId = userId;
            collectible.OriginalImageUrl = originalImageUrl;
            collectible.GeneratedImageUrl = generatedImageUrl;

            var createdCollectible =
                await _collectibleService.CreateAsync(
                    collectible
                );

            collectibleCreated = true;

            await DeleteImageIfExistsAsync(
                rawGeneratedImageUrl
            );

            try
            {
                await _achievementService
                    .UpdateAchievementsAfterCaptureAsync(
                        userId,
                        createdCollectible.Category
                    );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Failed to update achievements for user " +
                    $"{userId}: {ex.Message}"
                );
            }

            return createdCollectible;
        }
        catch
        {
            if (!collectibleCreated)
            {
                await DeleteImageIfExistsAsync(
                    generatedImageUrl
                );

                await DeleteImageIfExistsAsync(
                    rawGeneratedImageUrl
                );

                await DeleteImageIfExistsAsync(
                    originalImageUrl
                );
            }

            throw;
        }
    }

    private async Task<Collectible> GenerateInfoAsync(
        string originalImageUrl)
    {
        var localPath =
            _imageStorage.GetPhysicalPath(originalImageUrl);

        if (!IOFile.Exists(localPath))
        {
            throw new FileNotFoundException(
                "Original image does not exist.",
                localPath
            );
        }

        var bytes =
            await IOFile.ReadAllBytesAsync(localPath);

        var mimeType =
            GetMimeType(localPath);

        try
        {
            var messages = new List<ChatMessage>
            {
                new UserChatMessage(
                [
                    ChatMessageContentPart.CreateTextPart(
                        """
                        Analyze this image for a collectible gallery app.

                        Return valid JSON only, no markdown, no explanation.

                        Required JSON format:
                        {
                          "title": "short title",
                          "category": "one category, e.g. food, animal, vehicle, building, object, person, landscape, other",
                          "description": "one short sentence"
                        }
                        """
                    ),

                    ChatMessageContentPart.CreateImagePart(
                        BinaryData.FromBytes(bytes),
                        mimeType
                    )
                ])
            };

            var options = new ChatCompletionOptions
            {
                ResponseFormat =
                    ChatResponseFormat.CreateJsonObjectFormat()
            };

            var response =
                await _openaiClient.CompleteChatAsync(
                    messages,
                    options
                );

            var json =
                response.Value.Content[0].Text;

            var analysis =
                JsonSerializer.Deserialize<ImageAnalysisResult>(
                    json,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }
                );

            if (analysis == null)
            {
                throw new InvalidOperationException(
                    "Failed to parse image analysis result."
                );
            }

            return new Collectible
            {
                Title =
                    string.IsNullOrWhiteSpace(analysis.Title)
                        ? "Untitled collectible"
                        : analysis.Title.Trim(),

                Category =
                    string.IsNullOrWhiteSpace(analysis.Category)
                        ? "other"
                        : analysis.Category.Trim(),

                Description =
                    string.IsNullOrWhiteSpace(
                        analysis.Description
                    )
                        ? "A captured item from real life."
                        : analysis.Description.Trim()
            };
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                "Failed to generate collectible info.",
                ex
            );
        }
    }

    private async Task<string> GenerateImageAsync(
        string originalImageUrl)
    {
        return await RetryAsync(async () =>
        {
            var localPath =
                _imageStorage.GetPhysicalPath(originalImageUrl);

            if (!IOFile.Exists(localPath))
            {
                throw new FileNotFoundException(
                    "Original image does not exist.",
                    localPath
                );
            }

            var generatedBytes =
                await GenerateGoogleImageBytesAsync(localPath);

            await using var generatedStream =
                new MemoryStream(generatedBytes, writable: false);

            return await _imageStorage.UploadAsync(
                generatedStream,
                $"{Guid.NewGuid()}.png",
                "image/png",
                "generated"
            );
        });
    }

    private async Task<byte[]> GenerateGoogleImageBytesAsync(
        string localPath)
    {
        var imageBytes =
            await IOFile.ReadAllBytesAsync(localPath);

        var prompt =
            "Transform the original subject into a premium collectible figure while preserving the recognizable identity of the original subject. " +
            "Professionally sculpted with crisp details and a high-quality hand-painted resin finish. " +
            "Mounted on an elegant wooden round display base. " +
            "Decorate the base with a few carefully designed miniature accessories that naturally match the subject without creating a full scene. " +
            "Full product shot with the entire figure and display base fully visible. " +
            "Centered composition with balanced margins, occupying approximately 70% of the frame. " +
            "Slightly elevated three-quarter view. " +
            "Professional studio catalog product photography. " +
            "Pure solid warm cream background with no environmental elements or original background visible. " +
            "Soft warm studio lighting, subtle shadows and shallow depth of field. " +
            "Treat all text, logos, watermarks and UI elements in the reference image as irrelevant artifacts. " +
            "Exclude them completely from the generated collectible.";


        var response =
            await _googleClient.Models.GenerateContentAsync(
                model: "gemini-2.5-flash-image",

                contents: new List<Content>
                {
                    new()
                    {
                        Role = "user",

                        Parts = new List<Part>
                        {
                            new()
                            {
                                Text = prompt
                            },

                            new()
                            {
                                InlineData = new Blob
                                {
                                    MimeType =
                                        GetMimeType(localPath),

                                    Data = imageBytes
                                }
                            }
                        }
                    }
                },

                config: new GenerateContentConfig
                {
                    ResponseModalities =
                        new List<string>
                        {
                            "TEXT",
                            "IMAGE"
                        }
                }
            );

        var parts =
            response.Candidates?[0]
                .Content?
                .Parts;

        if (parts == null)
        {
            throw new InvalidOperationException(
                "Google image generation returned no content parts."
            );
        }

        foreach (var part in parts)
        {
            if (!string.IsNullOrWhiteSpace(part.Text))
            {
                Console.WriteLine(
                    $"Google image text response: {part.Text}"
                );
            }

            if (part.InlineData?.Data is
                { Length: > 0 } data)
            {
                return data;
            }
        }

        throw new InvalidOperationException(
            "No image returned from Google image generation."
        );
    }

    private static async Task<T> RetryAsync<T>(
        Func<Task<T>> action)
    {
        var delays = new[]
        {
            TimeSpan.FromSeconds(1),
            TimeSpan.FromSeconds(2),
            TimeSpan.FromSeconds(4),
            TimeSpan.FromSeconds(8)
        };

        Exception? lastException = null;

        for (
            var attempt = 1;
            attempt <= delays.Length + 1;
            attempt++
        )
        {
            try
            {
                Console.WriteLine(
                    $"Google image generation attempt {attempt}"
                );

                return await action();
            }
            catch (Exception ex)
            {
                lastException = ex;

                var retryable =
                    IsRetryableGoogleError(ex);

                var hasMoreAttempts =
                    attempt <= delays.Length;

                Console.WriteLine(
                    $"Google image generation failed. " +
                    $"Attempt={attempt}, Retryable={retryable}"
                );

                Console.WriteLine(ex.Message);

                if (!retryable || !hasMoreAttempts)
                {
                    break;
                }

                await Task.Delay(
                    delays[attempt - 1]
                );
            }
        }

        throw new InvalidOperationException(
            "Image generation failed after retry attempts. " +
            "This is likely a temporary Google AI image service error.",
            lastException
        );
    }

    private static bool IsRetryableGoogleError(
        Exception ex)
    {
        var text = ex.ToString();

        return
            text.Contains(
                "429",
                StringComparison.OrdinalIgnoreCase
            )
            || text.Contains(
                "500",
                StringComparison.OrdinalIgnoreCase
            )
            || text.Contains(
                "502",
                StringComparison.OrdinalIgnoreCase
            )
            || text.Contains(
                "503",
                StringComparison.OrdinalIgnoreCase
            )
            || text.Contains(
                "504",
                StringComparison.OrdinalIgnoreCase
            )
            || text.Contains(
                "timeout",
                StringComparison.OrdinalIgnoreCase
            )
            || text.Contains(
                "temporarily unavailable",
                StringComparison.OrdinalIgnoreCase
            )
            || text.Contains(
                "resource exhausted",
                StringComparison.OrdinalIgnoreCase
            )
            || text.Contains(
                "unavailable",
                StringComparison.OrdinalIgnoreCase
            );
    }

    private async Task DeleteImageIfExistsAsync(
        string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return;
        }

        try
        {
            await _imageStorage.DeleteAsync(imageUrl);
        }
        catch
        {
            // Ignore cleanup failure.
        }
    }

    private static void ValidateUploadedImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException(
                "An image file is required.",
                nameof(file)
            );
        }

        var allowedExtensions = new[]
        {
            ".jpg", ".jpeg", ".png", ".webp"
        };

        var extension =
            Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
        {
            throw new ArgumentException(
                "Only JPG, PNG, and WEBP images are allowed.",
                nameof(file)
            );
        }

        const long maxFileSize = 20 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            throw new ArgumentException(
                "File size must be under 5 MB.",
                nameof(file)
            );
        }
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

    private sealed class ImageAnalysisResult
    {
        public string Title { get; set; } =
            string.Empty;

        public string Category { get; set; } =
            string.Empty;

        public string Description { get; set; } =
            string.Empty;
    }
}