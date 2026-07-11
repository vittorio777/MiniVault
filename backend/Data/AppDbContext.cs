using Microsoft.EntityFrameworkCore;
using MiniVault.Models;

namespace MiniVault.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {

    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Collectible> Collectibles => Set<Collectible>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<UserAchievement> UserAchievements => Set<UserAchievement>();
    public DbSet<GenerationJob> GenerationJobs => Set<GenerationJob>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Achievement>().HasData(
            new Achievement
            {
                Id = 1,
                Name = "First Capture",
                Description = "Create your first collectible.",
                Icon = "first-capture",
                Category = "All",
                TargetValue = 1
            },
            new Achievement
            {
                Id = 2,
                Name = "Collector",
                Description = "Create 10 collectibles.",
                Icon = "collector",
                Category = "All",
                TargetValue = 10
            },
            new Achievement
            {
                Id = 3,
                Name = "Food Hunter",
                Description = "Collect 5 food items.",
                Icon = "food-hunter",
                Category = "Food",
                TargetValue = 5
            },
            new Achievement
            {
                Id = 4,
                Name = "Vehicle Collector",
                Description = "Collect 5 vehicles.",
                Icon = "vehicle-collector",
                Category = "Vehicle",
                TargetValue = 5
            },
            new Achievement
            {
                Id = 5,
                Name = "World Explorer",
                Description = "Collect 5 places or buildings.",
                Icon = "world-explorer",
                Category = "Building",
                TargetValue = 5
            }
        );
    }
}
