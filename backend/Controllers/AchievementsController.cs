using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniVault.DTOs;
using MiniVault.Extensions;
using MiniVault.Services;

namespace MiniVault.Controllers;

/// <summary>
/// Provides endpoints for retrieving the authenticated user's achievements.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AchievementsController : ControllerBase
{
    private readonly AchievementService _achievementService;

    public AchievementsController(
        AchievementService achievementService)
    {
        _achievementService = achievementService;
    }

    /// <summary>
    /// Returns the current user's achievement progress and unlock status.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<UserAchievementResponse>>> GetAchievements()
    {
        // Read the authenticated user's ID from the validated JWT.
        var userId = User.GetUserId();

        var userAchievements =
            await _achievementService.GetByUserIdAsync(userId);

        var response = userAchievements
            .Select(ToResponse)
            .ToList();

        return Ok(response);
    }

    // Convert the internal service model into the API response model.
    private static UserAchievementResponse ToResponse(
        UserAchievementDetails userAchievement)
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
            UnlockedAt = userAchievement.UnlockedAt
        };
    }
}