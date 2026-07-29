using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

using MiniVault.Data;
using MiniVault.Models;
using MiniVault.Services;

namespace backend.Tests;

public class CollectibleServiceTests
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

    private static CollectibleService CreateService(
        AppDbContext context)
    {
        var achievementService =
            new AchievementService(context);

        var cache = new MemoryCache(
            new MemoryCacheOptions()
        );

        return new CollectibleService(
            context,
            achievementService,
            cache
        );
    }

    [Fact]
    public async Task GetByUserIdAsync_ReturnsOnlySpecifiedUsersCollectibles()
    {
        // Arrange
        await using var context = CreateContext();

        context.Collectibles.AddRange(
            new Collectible
            {
                Id = 1,
                UserId = 1,
                Title = "Pokemon",
                Category = "Figure",
                Description = "Pokemon collectible",
                OriginalImageUrl = "/images/pokemon-original.png",
                GeneratedImageUrl = "/images/pokemon-generated.png",
                CreatedAt = DateTime.UtcNow.AddMinutes(-3),
                UpdatedAt = DateTime.UtcNow.AddMinutes(-3)
            },
            new Collectible
            {
                Id = 2,
                UserId = 1,
                Title = "Mario",
                Category = "Figure",
                Description = "Mario collectible",
                OriginalImageUrl = "/images/mario-original.png",
                GeneratedImageUrl = "/images/mario-generated.png",
                CreatedAt = DateTime.UtcNow.AddMinutes(-2),
                UpdatedAt = DateTime.UtcNow.AddMinutes(-2)
            },
            new Collectible
            {
                Id = 3,
                UserId = 2,
                Title = "Zelda",
                Category = "Game",
                Description = "Another user's collectible",
                OriginalImageUrl = "/images/zelda-original.png",
                GeneratedImageUrl = "/images/zelda-generated.png",
                CreatedAt = DateTime.UtcNow.AddMinutes(-1),
                UpdatedAt = DateTime.UtcNow.AddMinutes(-1)
            }
        );

        await context.SaveChangesAsync();

        var service = CreateService(context);

        // Act
        var result =
            await service.GetByUserIdAsync(1);

        // Assert
        Assert.Equal(2, result.Count);

        Assert.All(
            result,
            collectible =>
                Assert.Equal(1, collectible.UserId)
        );

        Assert.Contains(
            result,
            collectible =>
                collectible.Title == "Pokemon"
        );

        Assert.Contains(
            result,
            collectible =>
                collectible.Title == "Mario"
        );

        Assert.DoesNotContain(
            result,
            collectible =>
                collectible.Title == "Zelda"
        );
    }

    [Fact]
    public async Task CreateAsync_WithValidUser_CreatesCollectible()
    {
        // Arrange
        await using var context = CreateContext();

        var user = new User
        {
            Id = 1,
            Nickname = "wayne",
            Email = "wayne@example.com",
            PasswordHash = "test-password-hash",
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);

        await context.SaveChangesAsync();

        var service = CreateService(context);

        var collectible = new Collectible
        {
            UserId = 1,
            Title = "  Pokemon  ",
            Category = "  Figure  ",
            Description = "  Pokemon collectible  ",
            OriginalImageUrl = "/images/original.png",
            GeneratedImageUrl = "/images/generated.png"
        };

        // Act
        var result =
            await service.CreateAsync(collectible);

        // Assert
        Assert.NotNull(result);

        Assert.True(result.Id > 0);

        Assert.Equal(1, result.UserId);

        Assert.Equal(
            "Pokemon",
            result.Title
        );

        Assert.Equal(
            "Figure",
            result.Category
        );

        Assert.Equal(
            "Pokemon collectible",
            result.Description
        );

        Assert.NotEqual(
            default,
            result.CreatedAt
        );

        Assert.NotEqual(
            default,
            result.UpdatedAt
        );

        Assert.Single(context.Collectibles);
    }

    [Fact]
    public async Task CreateAsync_WithMissingUser_ThrowsException()
    {
        // Arrange
        await using var context = CreateContext();

        var service = CreateService(context);

        var collectible = new Collectible
        {
            UserId = 999,
            Title = "Pokemon",
            Category = "Figure",
            Description = "Pokemon collectible",
            OriginalImageUrl = "/images/original.png",
            GeneratedImageUrl = "/images/generated.png"
        };

        // Act
        var exception =
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => service.CreateAsync(collectible)
            );

        // Assert
        Assert.Equal(
            "The authenticated user does not exist.",
            exception.Message
        );

        Assert.Empty(context.Collectibles);
    }

    [Fact]
    public async Task UpdateByIdAsync_WithCorrectOwner_UpdatesCollectible()
    {
        // Arrange
        await using var context = CreateContext();

        var collectible = new Collectible
        {
            Id = 1,
            UserId = 1,
            Title = "Old title",
            Category = "Old category",
            Description = "Old description",
            OriginalImageUrl = "/images/original.png",
            GeneratedImageUrl = "/images/generated.png",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };

        context.Collectibles.Add(collectible);

        await context.SaveChangesAsync();

        var service = CreateService(context);

        var updatedCollectible = new Collectible
        {
            Title = "  New title  ",
            Category = "  New category  ",
            Description = "  New description  "
        };

        // Act
        var result = await service.UpdateByIdAsync(
            id: 1,
            userId: 1,
            updatedCollectible
        );

        // Assert
        Assert.True(result);

        var storedCollectible =
            await context.Collectibles.FindAsync(1);

        Assert.NotNull(storedCollectible);

        Assert.Equal(
            "New title",
            storedCollectible.Title
        );

        Assert.Equal(
            "New category",
            storedCollectible.Category
        );

        Assert.Equal(
            "New description",
            storedCollectible.Description
        );

        Assert.Equal(
            1,
            storedCollectible.UserId
        );
    }

    [Fact]
    public async Task UpdateByIdAsync_WithWrongOwner_DoesNotUpdateCollectible()
    {
        // Arrange
        await using var context = CreateContext();

        context.Collectibles.Add(
            new Collectible
            {
                Id = 1,
                UserId = 1,
                Title = "Original title",
                Category = "Figure",
                Description = "Original description",
                OriginalImageUrl = "/images/original.png",
                GeneratedImageUrl = "/images/generated.png",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        await context.SaveChangesAsync();

        var service = CreateService(context);

        var updatedCollectible = new Collectible
        {
            Title = "Changed title",
            Category = "Changed category",
            Description = "Changed description"
        };

        // Act
        var result = await service.UpdateByIdAsync(
            id: 1,
            userId: 2,
            updatedCollectible
        );

        // Assert
        Assert.False(result);

        var storedCollectible =
            await context.Collectibles.FindAsync(1);

        Assert.NotNull(storedCollectible);

        Assert.Equal(
            "Original title",
            storedCollectible.Title
        );
    }

    [Fact]
    public async Task DeleteByIdAsync_WithCorrectOwner_DeletesCollectible()
    {
        // Arrange
        await using var context = CreateContext();

        context.Collectibles.Add(
            new Collectible
            {
                Id = 1,
                UserId = 1,
                Title = "Pokemon",
                Category = "Figure",
                Description = "Pokemon collectible",
                OriginalImageUrl = "/images/original.png",
                GeneratedImageUrl = "/images/generated.png",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        await context.SaveChangesAsync();

        var service = CreateService(context);

        // Act
        var deletedCollectible =
            await service.DeleteByIdAsync(
                id: 1,
                userId: 1
            );

        // Assert
        Assert.NotNull(deletedCollectible);

        Assert.Equal(
            "Pokemon",
            deletedCollectible.Title
        );

        Assert.Empty(context.Collectibles);
    }

    [Fact]
    public async Task DeleteByIdAsync_WithWrongOwner_DoesNotDeleteCollectible()
    {
        // Arrange
        await using var context = CreateContext();

        context.Collectibles.Add(
            new Collectible
            {
                Id = 1,
                UserId = 1,
                Title = "Pokemon",
                Category = "Figure",
                Description = "Pokemon collectible",
                OriginalImageUrl = "/images/original.png",
                GeneratedImageUrl = "/images/generated.png",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        await context.SaveChangesAsync();

        var service = CreateService(context);

        // Act
        var deletedCollectible =
            await service.DeleteByIdAsync(
                id: 1,
                userId: 2
            );

        // Assert
        Assert.Null(deletedCollectible);

        Assert.Single(context.Collectibles);
    }
}