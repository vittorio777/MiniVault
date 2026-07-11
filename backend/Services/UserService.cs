using Microsoft.EntityFrameworkCore;

using MiniVault.Models;
using MiniVault.Data;
using MiniVault.DTOs;

using System.Security.Cryptography;
using System.Text;

namespace MiniVault.Services;


public class UserService
{

    private readonly AppDbContext _context;
    private readonly AchievementService _achievementService;

    public UserService(AppDbContext context, AchievementService achievementService)
    {
        _context = context;
        _achievementService = achievementService;
    }

    public async Task<UserResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Nickname == request.Nickname);

        if (existingUser != null)
        {
            throw new InvalidOperationException("Nickname already registered.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var user = new User
            {
                Nickname = request.Nickname,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var initialized = await _achievementService.InitializeUserAchievementsAsync(user.Id);

            if (!initialized)
            {
                throw new InvalidOperationException(
                    "Failed to initialize user achievements.");
            }

            await transaction.CommitAsync();

            return new UserResponse
            {
                Id = user.Id,
                Nickname = user.Nickname,
                Email = user.Email
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<UserResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Nickname == request.Nickname);

        if (user == null)
        {
            throw new InvalidOperationException("Invalid nickname or password.");
        }

        var passwordHash = HashPassword(request.Password);

        if (user.PasswordHash != passwordHash)
        {
            throw new InvalidOperationException("Invalid nickname or password.");
        }

        return new UserResponse
        {
            Id = user.Id,
            Nickname = user.Nickname,
            Email = user.Email
        };

    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();

        var bytes = Encoding.UTF8.GetBytes(password);
        var hashBytes = sha256.ComputeHash(bytes);

        return Convert.ToBase64String(hashBytes);
    }
}

