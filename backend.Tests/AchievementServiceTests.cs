using Microsoft.EntityFrameworkCore;

using MiniVault.Data;
using MiniVault.Models;
using MiniVault.Services;

namespace backend.Tests;

public class AchievementServiceTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(
                Guid.NewGuid().ToString()
            )
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task InitializeUserAchievementsAsync_CreatesMissingRecordsWithoutDuplicates()
    {
        // Arrange
        await using var context = CreateContext();

        context.Achievements.AddRange(
            new Achievement
            {
                Id = 1,
                Name = "First Collectible",
                Description = "Add your first collectible",
                Icon = "star",
                Category = "All",
                TargetValue = 1
            },
            new Achievement
            {
                Id = 2,
                Name = "Figure Collector",
                Description = "Add three figures",
                Icon = "figure",
                Category = "Figure",
                TargetValue = 3
            }
        );

        await context.SaveChangesAsync();

        var service =
            new AchievementService(context);

        // Act
        await service.InitializeUserAchievementsAsync(1);

        await service.InitializeUserAchievementsAsync(1);

        // Assert
        var userAchievements =
            await context.UserAchievements
                .Where(userAchievement =>
                    userAchievement.UserId == 1)
                .ToListAsync();

        Assert.Equal(
            2,
            userAchievements.Count
        );

        Assert.Contains(
            userAchievements,
            userAchievement =>
                userAchievement.AchievementId == 1
        );

        Assert.Contains(
            userAchievements,
            userAchievement =>
                userAchievement.AchievementId == 2
        );

        Assert.All(
            userAchievements,
            userAchievement =>
            {
                Assert.Equal(
                    0,
                    userAchievement.Progress
                );

                Assert.False(
                    userAchievement.IsUnlocked
                );

                Assert.Null(
                    userAchievement.UnlockedAt
                );
            }
        );
    }

    [Fact]
    public async Task UpdateAchievementsAsync_WhenTargetReached_UnlocksAchievement()
    {
        // Arrange
        await using var context = CreateContext();

        context.Achievements.Add(
            new Achievement
            {
                Id = 1,
                Name = "Collector",
                Description = "Add two collectibles",
                Icon = "star",
                Category = "All",
                TargetValue = 2
            }
        );

        context.Collectibles.AddRange(
            new Collectible
            {
                Id = 1,
                UserId = 1,
                Title = "Pokemon",
                Category = "Figure",
                Description = "Pokemon collectible",
                OriginalImageUrl =
                    "/images/pokemon-original.png",
                GeneratedImageUrl =
                    "/images/pokemon-generated.png",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Collectible
            {
                Id = 2,
                UserId = 1,
                Title = "Mario",
                Category = "Game",
                Description = "Mario collectible",
                OriginalImageUrl =
                    "/images/mario-original.png",
                GeneratedImageUrl =
                    "/images/mario-generated.png",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Collectible
            {
                Id = 3,
                UserId = 2,
                Title = "Other User Item",
                Category = "Figure",
                Description = "Another user's item",
                OriginalImageUrl =
                    "/images/other-original.png",
                GeneratedImageUrl =
                    "/images/other-generated.png",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        await context.SaveChangesAsync();

        var service =
            new AchievementService(context);

        // Act
        var newlyUnlockedIds =
            await service.UpdateAchievementsAsync(1);

        // Assert
        var userAchievement =
            await context.UserAchievements
                .SingleAsync(
                    item =>
                        item.UserId == 1 &&
                        item.AchievementId == 1
                );

        Assert.Equal(
            2,
            userAchievement.Progress
        );

        Assert.True(
            userAchievement.IsUnlocked
        );

        Assert.NotNull(
            userAchievement.UnlockedAt
        );

        Assert.Contains(
            1,
            newlyUnlockedIds
        );
    }

    [Fact]
    public async Task UpdateAchievementsAsync_WhenTargetNotReached_UpdatesProgressWithoutUnlocking()
    {
        // Arrange
        await using var context = CreateContext();

        context.Achievements.Add(
            new Achievement
            {
                Id = 1,
                Name = "Figure Collector",
                Description = "Add three figures",
                Icon = "figure",
                Category = "Figure",
                TargetValue = 3
            }
        );

        context.Collectibles.AddRange(
            new Collectible
            {
                Id = 1,
                UserId = 1,
                Title = "Pokemon",
                Category = "Figure",
                Description = "Pokemon collectible",
                OriginalImageUrl =
                    "/images/pokemon-original.png",
                GeneratedImageUrl =
                    "/images/pokemon-generated.png",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Collectible
            {
                Id = 2,
                UserId = 1,
                Title = "Mario",
                Category = "Game",
                Description = "Mario collectible",
                OriginalImageUrl =
                    "/images/mario-original.png",
                GeneratedImageUrl =
                    "/images/mario-generated.png",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        await context.SaveChangesAsync();

        var service =
            new AchievementService(context);

        // Act
        var newlyUnlockedIds =
            await service.UpdateAchievementsAsync(1);

        // Assert
        var userAchievement =
            await context.UserAchievements
                .SingleAsync(
                    item =>
                        item.UserId == 1 &&
                        item.AchievementId == 1
                );

        Assert.Equal(
            1,
            userAchievement.Progress
        );

        Assert.False(
            userAchievement.IsUnlocked
        );

        Assert.Null(
            userAchievement.UnlockedAt
        );

        Assert.Empty(
            newlyUnlockedIds
        );
    }
}