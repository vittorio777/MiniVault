namespace MiniVault.Models;

public class GenerationJob
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Status { get; set; } = "Pending";
    public string OriginalImageUrl { get; set; } = string.Empty;
    public string Prompt { get; set; } = string.Empty;
    public string ResultImageUrl { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}