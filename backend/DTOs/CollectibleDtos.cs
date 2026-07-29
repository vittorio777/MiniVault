namespace MiniVault.DTOs;

using System.ComponentModel.DataAnnotations;

public class CreateCollectibleRequest
{
    [Required]
    [StringLength(60)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string Category { get; set; } = string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Url]
    public string OriginalImageUrl { get; set; } = string.Empty;

    [Required]
    [Url]
    public string GeneratedImageUrl { get; set; } = string.Empty;
}

public class UpdateCollectibleRequest
{
    [Required]
    [StringLength(60)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string Category { get; set; } = string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
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