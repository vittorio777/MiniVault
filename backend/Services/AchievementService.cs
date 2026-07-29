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

    public async Task<List<UserAchievementDetails>> GetByUserIdAsync(
        int userId)
    {
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

    public async Task<List<int>> UpdateAchievementsAsync(
        int userId)
    {
        await InitializeUserAchievementsAsync(userId);

        var collectibleCategories =
            await _context.Collectibles
                .Where(collectible =>
                    collectible.UserId == userId)
                .Select(collectible =>
                    collectible.Category)
                .ToListAsync();

        var totalCollectibles =
            collectibleCategories.Count;

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

            var cappedProgress = Math.Min(
                actualProgress,
                achievement.TargetValue
            );

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

    public Task<List<int>> UpdateAchievementsAfterCaptureAsync(
        int userId,
        string collectibleCategory)
    {
        return UpdateAchievementsAsync(userId);
    }
}