namespace MiniVault.Models;

public class UserAchievement
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public int AchievementId { get; set; }

    public int Progress { get; set; }
    public bool IsUnlocked { get; set; }
    public DateTime? UnlockedAt { get; set; }
}