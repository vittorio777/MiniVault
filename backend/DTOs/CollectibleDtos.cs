namespace MiniVault.DTOs;

public class CreateCollectibleRequest
{
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string OriginalImageUrl { get; set; } = string.Empty;
    public string GeneratedImageUrl { get; set; } = string.Empty;
}

public class UpdateCollectibleRequest
{
    public string Title { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string OriginalImageUrl { get; set; } = string.Empty;

    public string GeneratedImageUrl { get; set; } = string.Empty;
}

public class CollectibleResponse
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string OriginalImageUrl { get; set; } = string.Empty;

    public string GeneratedImageUrl { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}