using Microsoft.AspNetCore.Mvc;
using MiniVault.Services;
using MiniVault.DTOs;

namespace MiniVault.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AchievementsController : ControllerBase
{
    private readonly AchievementService _achievementService;

    public AchievementsController(AchievementService achievementService)
    {
        _achievementService = achievementService;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<UserAchievementResponse>>> GetByUserId(int userId)
    {
        var userAchievements = await _achievementService.GetByUserIdAsync(userId);

        var response = userAchievements
            .Select(ToResponse)
            .ToList();

        return Ok(response);
    }

    private static UserAchievementResponse ToResponse(UserAchievementDetails userAchievement)
    {
        return new UserAchievementResponse
        {
            AchievementId = userAchievement.AchievementId,
            AchievementName = userAchievement.Name,
            Description = userAchievement.Description,
            Icon = userAchievement.Icon,
            TargetValue = userAchievement.TargetValue,
            Progress = userAchievement.Progress,
            IsUnlocked = userAchievement.IsUnlocked,
            UnlockedAt = userAchievement.UnlockedAt,
        };
    }
}

