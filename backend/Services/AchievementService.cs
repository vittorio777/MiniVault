using Microsoft.EntityFrameworkCore;
using MiniVault.Data;
using MiniVault.DTOs;
using MiniVault.Models;

namespace MiniVault.Services;

public class AchievementService
{
    private readonly AppDbContext _context;

    public AchievementService(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Returns the user's achievement progress and unlock status.
    /// </summary>
    public async Task<List<UserAchievementDetails>> GetByUserIdAsync(
        int userId)
    {
        // Ensure the user has records for all currently defined achievements,
        // then recalculate progress before returning the latest state.
        await InitializeUserAchievementsAsync(userId);
        await UpdateAchievementsAsync(userId);

        return await (
            from achievement in _context.Achievements
            join userAchievement in _context.UserAchievements
                on achievement.Id equals userAchievement.AchievementId
            where userAchievement.UserId == userId
            orderby userAchievement.IsUnlocked descending,
                achievement.Id
            select new UserAchievementDetails
            {
                AchievementId = achievement.Id,
                Name = achievement.Name,
                Description = achievement.Description,
                Icon = achievement.Icon,
                Category = achievement.Category,
                TargetValue = achievement.TargetValue,
                Progress = userAchievement.Progress,
                IsUnlocked = userAchievement.IsUnlocked,
                UnlockedAt = userAchievement.UnlockedAt
            }
        ).ToListAsync();
    }

    /// <summary>
    /// Creates any missing user-achievement records without duplicating
    /// records that already exist.
    /// </summary>
    public async Task InitializeUserAchievementsAsync(
        int userId)
    {
        var achievementIds = await _context.Achievements
            .Select(achievement => achievement.Id)
            .ToListAsync();

        if (achievementIds.Count == 0)
        {
            return;
        }

        var existingAchievementIds =
            await _context.UserAchievements
                .Where(userAchievement =>
                    userAchievement.UserId == userId)
                .Select(userAchievement =>
                    userAchievement.AchievementId)
                .ToListAsync();

        // Use a set for efficient lookup when identifying newly added
        // achievements that the user does not yet have.
        var existingAchievementIdSet =
            existingAchievementIds.ToHashSet();

        var newUserAchievements = achievementIds
            .Where(achievementId =>
                !existingAchievementIdSet.Contains(achievementId))
            .Select(achievementId => new UserAchievement
            {
                UserId = userId,
                AchievementId = achievementId,
                Progress = 0,
                IsUnlocked = false,
                UnlockedAt = null
            })
            .ToList();

        if (newUserAchievements.Count == 0)
        {
            return;
        }

        _context.UserAchievements.AddRange(
            newUserAchievements
        );

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Recalculates achievement progress from the user's current collection
    /// and returns the IDs of achievements unlocked during this update.
    /// </summary>
    public async Task<List<int>> UpdateAchievementsAsync(
        int userId)
    {
        await InitializeUserAchievementsAsync(userId);

        // Load only the category values required to calculate
        // total-collection and category-specific achievements.
        var collectibleCategories =
            await _context.Collectibles
                .Where(collectible =>
                    collectible.UserId == userId)
                .Select(collectible =>
                    collectible.Category)
                .ToListAsync();

        var totalCollectibles =
            collectibleCategories.Count;

        // Group category names without case sensitivity so values such as
        // "Animal" and "animal" contribute to the same achievement.
        var categoryCounts = collectibleCategories
            .Where(category =>
                !string.IsNullOrWhiteSpace(category))
            .GroupBy(
                category => category.Trim(),
                StringComparer.OrdinalIgnoreCase
            )
            .ToDictionary(
                group => group.Key,
                group => group.Count(),
                StringComparer.OrdinalIgnoreCase
            );

        var userAchievements = await (
            from userAchievement in _context.UserAchievements
            join achievement in _context.Achievements
                on userAchievement.AchievementId
                equals achievement.Id
            where userAchievement.UserId == userId
            select new
            {
                UserAchievement = userAchievement,
                Achievement = achievement
            }
        ).ToListAsync();

        var newlyUnlockedAchievementIds =
            new List<int>();

        foreach (var item in userAchievements)
        {
            var achievement = item.Achievement;
            var userAchievement = item.UserAchievement;

            // "All" achievements use the complete collection count;
            // other achievements use the matching category count.
            var actualProgress =
                string.Equals(
                    achievement.Category,
                    "All",
                    StringComparison.OrdinalIgnoreCase
                )
                    ? totalCollectibles
                    : categoryCounts.GetValueOrDefault(
                        achievement.Category,
                        0
                    );

            // Do not display progress beyond the achievement target.
            var cappedProgress = Math.Min(
                actualProgress,
                achievement.TargetValue
            );

            // Once unlocked, achievements remain unlocked even if
            // collectibles are later deleted or recategorized.
            if (userAchievement.IsUnlocked)
            {
                userAchievement.Progress =
                    achievement.TargetValue;

                continue;
            }

            userAchievement.Progress = cappedProgress;

            if (actualProgress < achievement.TargetValue)
            {
                continue;
            }

            userAchievement.IsUnlocked = true;
            userAchievement.UnlockedAt = DateTime.UtcNow;

            newlyUnlockedAchievementIds.Add(
                achievement.Id
            );
        }

        await _context.SaveChangesAsync();

        return newlyUnlockedAchievementIds;
    }

    /// <summary>
    /// Refreshes achievement progress after a collectible is created.
    /// </summary>
    public Task<List<int>> UpdateAchievementsAfterCaptureAsync(
        int userId,
        string collectibleCategory)
    {
        // Progress is recalculated from the database, so the supplied
        // category is currently not required by the implementation.
        return UpdateAchievementsAsync(userId);
    }
}