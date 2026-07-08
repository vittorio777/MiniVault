using Microsoft.EntityFrameworkCore;
using MiniVault.Models;
using MiniVault.Data;

namespace MiniVault.Services;

public class CollectibleService
{
    private readonly AppDbContext _context;
    public CollectibleService(AppDbContext context)
    {
        _context = context;
    }

    // 查询用户全部收藏
    public async Task<List<Collectible>> GetByUserIdAsync(int userId)
    {
        return await _context.Collectibles
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // 查询用户某类收藏
    public async Task<List<Collectible>> GetSelectedCategoryAsync(int userId, string category)
    {
        return await _context.Collectibles
            .Where(c => c.UserId == userId && c.Category == category)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // 查询指定id收藏
    public async Task<Collectible?> GetByIdAsync(int id)
    {
        return await _context.Collectibles.FindAsync(id);
    }

    // 修改指定id收藏的信息
    public async Task<bool> UpdateByIdAsync(int id, Collectible updatedCollectible)
    {
        var collectible = await _context.Collectibles.FindAsync(id);
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

    // 删除某id收藏
    public async Task<bool> DeleteByIdAsync(int id)
    {
        var collectible = await _context.Collectibles.FindAsync(id);
        if (collectible == null)
        {
            return false;
        }

        _context.Collectibles.Remove(collectible);
        await _context.SaveChangesAsync();
        return true;
    }

    // 创建新的收藏
    public async Task<Collectible> CreateAsync(Collectible collectible)
    {
        collectible.UpdatedAt = DateTime.UtcNow;
        collectible.CreatedAt = DateTime.UtcNow;

        _context.Collectibles.Add(collectible);
        await _context.SaveChangesAsync();

        return collectible;
    }
}

