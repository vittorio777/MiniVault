using Microsoft.EntityFrameworkCore;
using MiniVault.Data;
using MiniVault.Models;

namespace MiniVault.Services;

public class CollectibleService
{
    private readonly AppDbContext _context;

    public CollectibleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Collectible>> GetByUserIdAsync(
        int userId)
    {
        return await _context.Collectibles
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
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

        collectible.Title = updatedCollectible.Title;
        collectible.Category = updatedCollectible.Category;
        collectible.Description = updatedCollectible.Description;
        collectible.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

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
            .AnyAsync(u => u.Id == collectible.UserId);

        if (!userExists)
        {
            throw new InvalidOperationException(
                "The authenticated user does not exist."
            );
        }

        var now = DateTime.UtcNow;

        collectible.CreatedAt = now;
        collectible.UpdatedAt = now;

        _context.Collectibles.Add(collectible);

        await _context.SaveChangesAsync();

        return collectible;
    }
}