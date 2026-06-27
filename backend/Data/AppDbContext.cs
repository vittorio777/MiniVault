using Microsoft.EntityFrameworkCore;
using MiniVault.Models;

namespace MiniVault.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) 
        : base (options)
    {
        
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Collectible> Collectibles => Set<Collectible>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<UserAchievement> UserAchievements => Set<UserAchievement>();
    public DbSet<GenerationJob> GenerationJobs => Set<GenerationJob>();

}
