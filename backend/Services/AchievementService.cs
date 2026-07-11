using MiniVault.Data;
using MiniVault.Models;
using MiniVault.DTOs;
using Microsoft.EntityFrameworkCore;

namespace MiniVault.Services;

public class AchievementService
{
    private readonly AppDbContext _context;

    public AchievementService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserAchievementDetails>> GetByUserIdAsync(int userId)
    {
        var result = await (
            from achievement in _context.Achievements
            join userAchievement in _context.UserAchievements
                on achievement.Id equals userAchievement.AchievementId
            where userAchievement.UserId == userId
            orderby userAchievement.IsUnlocked descending, achievement.Id
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

        return result;
    }

    // 增，新用户注册的时候，数据库增加条目；InitializeUserAchievementsAsync
    public async Task<bool> InitializeUserAchievementsAsync(int userId)
    {
        var achievementIds = await _context.Achievements
            .Select(a => a.Id)
            .ToListAsync();

        if (achievementIds.Count == 0)
        {
            return false;
        }

        var existingAchievementIds = await _context.UserAchievements
            .Where(ua => ua.UserId == userId)
            .Select(ua => ua.AchievementId)
            .ToListAsync();

        var newUserAchievements = achievementIds
                .Where(id => !existingAchievementIds.Contains(id))
                .Select(achievementId => new UserAchievement
                {
                    UserId = userId,
                    AchievementId = achievementId,
                    Progress = 0,
                    IsUnlocked = false,
                    UnlockedAt = null
                }).ToList();

        if (newUserAchievements.Count == 0)
        {
            return true;
        }

        _context.UserAchievements.AddRange(newUserAchievements);
        await _context.SaveChangesAsync();
        return true;
    }

    // 改，成就变化更新；UpdateAchievementsAfterCaptureAsync
    public async Task<List<int>> UpdateAchievementsAfterCaptureAsync(int userId, string collectibleCategory)
    {
        var unlockedAchievementIds = new List<int>();

        var userAchievements = await (
            from userAchievement in _context.UserAchievements
            join achievement in _context.Achievements
            on userAchievement.AchievementId equals achievement.Id
            where userAchievement.UserId == userId
            select new
            {
                UserAchievement = userAchievement,
                Achievement = achievement
            }
        ).ToListAsync();

        foreach (var item in userAchievements)
        {
            var achievement = item.Achievement;
            var userAchievement = item.UserAchievement;

            if (userAchievement.IsUnlocked)
            {
                continue;
            }

            var shouldIncrease = string.Equals(achievement.Category, "All", StringComparison.OrdinalIgnoreCase)
                || string.Equals(achievement.Category, collectibleCategory, StringComparison.OrdinalIgnoreCase);

            if (!shouldIncrease)
            {
                continue;
            }

            userAchievement.Progress++;

            if (userAchievement.Progress >= achievement.TargetValue)
            {
                userAchievement.Progress = achievement.TargetValue;
                userAchievement.IsUnlocked = true;
                userAchievement.UnlockedAt = DateTime.UtcNow;

                unlockedAchievementIds.Add(userAchievement.AchievementId);
            }

        }

        await _context.SaveChangesAsync();
        return unlockedAchievementIds;
    }
}