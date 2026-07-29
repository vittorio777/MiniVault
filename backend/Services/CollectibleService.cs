using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using MiniVault.Data;
using MiniVault.Models;

namespace MiniVault.Services;

public class CollectibleService
{
    private readonly AppDbContext _context;
    private readonly AchievementService _achievementService;
    private readonly IMemoryCache _cache;

    public CollectibleService(
        AppDbContext context,
        AchievementService achievementService,
        IMemoryCache cache)
    {
        _context = context;
        _achievementService = achievementService;
        _cache = cache;
    }

    public async Task<List<Collectible>> GetByUserIdAsync(
        int userId)
    {
        var cacheKey = $"collectibles_{userId}";

        if (_cache.TryGetValue(
            cacheKey,
            out List<Collectible>? cachedCollectibles))
        {
            return cachedCollectibles!;
        }

        var collectibles = await _context.Collectibles
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        _cache.Set(
            cacheKey,
            collectibles,
            TimeSpan.FromMinutes(5));

        return collectibles;
    }

    public async Task<List<Collectible>> GetSelectedCategoryAsync(
        int userId,
        string category)
    {
        return await _context.Collectibles
            .AsNoTracking()
            .Where(c =>
                c.UserId == userId &&
                c.Category == category)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Collectible?> GetByIdAsync(
        int id,
        int userId)
    {
        return await _context.Collectibles
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Id == id &&
                c.UserId == userId);
    }

    public async Task<bool> UpdateByIdAsync(
        int id,
        int userId,
        Collectible updatedCollectible)
    {
        var collectible = await _context.Collectibles
            .FirstOrDefaultAsync(c =>
                c.Id == id &&
                c.UserId == userId);

        if (collectible == null)
        {
            return false;
        }

        collectible.Title =
            updatedCollectible.Title.Trim();

        collectible.Category =
            updatedCollectible.Category.Trim();

        collectible.Description =
            updatedCollectible.Description.Trim();

        collectible.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _cache.Remove($"collectibles_{userId}");

        await UpdateAchievementsSafelyAsync(userId);

        return true;
    }

    public async Task<Collectible?> DeleteByIdAsync(
        int id,
        int userId)
    {
        var collectible = await _context.Collectibles
            .FirstOrDefaultAsync(c =>
                c.Id == id &&
                c.UserId == userId);

        if (collectible == null)
        {
            return null;
        }

        _context.Collectibles.Remove(collectible);

        await _context.SaveChangesAsync();

        _cache.Remove($"collectibles_{userId}");

        await UpdateAchievementsSafelyAsync(userId);

        return collectible;
    }

    public async Task<Collectible> CreateAsync(
        Collectible collectible)
    {
        if (collectible.UserId <= 0)
        {
            throw new InvalidOperationException(
                "A valid user ID is required."
            );
        }

        var userExists = await _context.Users
            .AnyAsync(u =>
                u.Id == collectible.UserId);

        if (!userExists)
        {
            throw new InvalidOperationException(
                "The authenticated user does not exist."
            );
        }

        collectible.Title =
            collectible.Title.Trim();

        collectible.Category =
            collectible.Category.Trim();

        collectible.Description =
            collectible.Description.Trim();

        var now = DateTime.UtcNow;

        collectible.CreatedAt = now;
        collectible.UpdatedAt = now;

        _context.Collectibles.Add(collectible);

        await _context.SaveChangesAsync();

        _cache.Remove($"collectibles_{collectible.UserId}");

        return collectible;
    }

    private async Task UpdateAchievementsSafelyAsync(
        int userId)
    {
        try
        {
            await _achievementService
                .UpdateAchievementsAsync(userId);
        }
        catch (Exception exception)
        {
            Console.WriteLine(
                $"Failed to update achievements for user " +
                $"{userId}: {exception.Message}"
            );
        }
    }
}