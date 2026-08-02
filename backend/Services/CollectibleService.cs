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

    /// <summary>
    /// Returns all collectibles owned by a user, using a short-lived cache
    /// to reduce repeated database queries.
    /// </summary>
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

        // Read-only queries use AsNoTracking to avoid unnecessary
        // Entity Framework change-tracking overhead.
        var collectibles = await _context.Collectibles
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        // Cache each user's collection separately for five minutes.
        _cache.Set(
            cacheKey,
            collectibles,
            TimeSpan.FromMinutes(5));

        return collectibles;
    }

    /// <summary>
    /// Returns the collectibles owned by a user within a selected category.
    /// </summary>
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

    /// <summary>
    /// Returns a collectible only when it belongs to the authenticated user.
    /// </summary>
    public async Task<Collectible?> GetByIdAsync(
        int id,
        int userId)
    {
        // Including userId in the query prevents one user
        // from accessing another user's collectible by ID.
        return await _context.Collectibles
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Id == id &&
                c.UserId == userId);
    }

    /// <summary>
    /// Updates a collectible owned by the authenticated user.
    /// </summary>
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

        // Remove stale cached data after the user's collection changes.
        _cache.Remove($"collectibles_{userId}");

        // Achievement failure should not cause the completed update
        // operation to be reported as unsuccessful.
        await UpdateAchievementsSafelyAsync(userId);

        return true;
    }

    /// <summary>
    /// Deletes a collectible owned by the authenticated user.
    /// </summary>
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

        // Invalidate the cached collection so the deleted item
        // is not returned by later requests.
        _cache.Remove($"collectibles_{userId}");

        await UpdateAchievementsSafelyAsync(userId);

        // Return the deleted entity so the caller can perform
        // related cleanup, such as removing stored image files.
        return collectible;
    }

    /// <summary>
    /// Creates a new collectible for an existing user.
    /// </summary>
    public async Task<Collectible> CreateAsync(
        Collectible collectible)
    {
        if (collectible.UserId <= 0)
        {
            throw new InvalidOperationException(
                "A valid user ID is required."
            );
        }

        // Verify that the supplied user ID refers to a real account
        // before saving the collectible.
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

        // Remove any cached collection created before this item was added.
        _cache.Remove($"collectibles_{collectible.UserId}");

        return collectible;
    }

    // Achievement updates are treated as a secondary operation.
    // Database changes to collectibles remain successful if this step fails.
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