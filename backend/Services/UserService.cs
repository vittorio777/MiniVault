using System.Security.Cryptography;
using System.Text;

using Microsoft.EntityFrameworkCore;

using MiniVault.Data;
using MiniVault.DTOs;
using MiniVault.Models;

namespace MiniVault.Services;

public class UserService
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;

    private readonly AppDbContext _context;
    private readonly AchievementService _achievementService;

    public UserService(
        AppDbContext context,
        AchievementService achievementService)
    {
        _context = context;
        _achievementService = achievementService;
    }

    public async Task<UserResponse> RegisterAsync(
        RegisterRequest request)
    {
        var nickname = request.Nickname.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(nickname))
        {
            throw new InvalidOperationException(
                "Nickname is required."
            );
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new InvalidOperationException(
                "Email is required."
            );
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new InvalidOperationException(
                "Password is required."
            );
        }

        var nicknameExists = await _context.Users
            .AnyAsync(user =>
                user.Nickname == nickname
            );

        if (nicknameExists)
        {
            throw new InvalidOperationException(
                "Nickname already registered."
            );
        }

        var emailExists = await _context.Users
            .AnyAsync(user =>
                user.Email == email
            );

        if (emailExists)
        {
            throw new InvalidOperationException(
                "Email already registered."
            );
        }

        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();

        try
        {
            var user = new User
            {
                Nickname = nickname,
                Email = email,
                PasswordHash =
                    HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            await _achievementService
                .InitializeUserAchievementsAsync(
                    user.Id
                );

            await transaction.CommitAsync();

            return ToResponse(user);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<UserResponse> LoginAsync(
        LoginRequest request)
    {
        var nickname = request.Nickname.Trim();

        var user = await _context.Users
            .FirstOrDefaultAsync(
                storedUser =>
                    storedUser.Nickname == nickname
            );

        if (user is null)
        {
            throw new InvalidOperationException(
                "Invalid nickname or password."
            );
        }

        var passwordIsValid = VerifyPassword(
            request.Password,
            user.PasswordHash,
            out var usesLegacyHash
        );

        if (!passwordIsValid)
        {
            throw new InvalidOperationException(
                "Invalid nickname or password."
            );
        }

        if (usesLegacyHash)
        {
            user.PasswordHash =
                HashPassword(request.Password);

            await _context.SaveChangesAsync();
        }

        await _achievementService
            .InitializeUserAchievementsAsync(
                user.Id
            );

        return ToResponse(user);
    }

    private static UserResponse ToResponse(
        User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Nickname = user.Nickname,
            Email = user.Email
        };
    }

    private static string HashPassword(
        string password)
    {
        var salt =
            RandomNumberGenerator.GetBytes(
                SaltSize
            );

        var hash =
            Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                Iterations,
                HashAlgorithmName.SHA256,
                HashSize
            );

        return string.Join(
            ".",
            "PBKDF2",
            Iterations,
            Convert.ToBase64String(salt),
            Convert.ToBase64String(hash)
        );
    }

    private static bool VerifyPassword(
        string password,
        string storedHash,
        out bool usesLegacyHash)
    {
        usesLegacyHash = false;

        if (storedHash.StartsWith(
                "PBKDF2.",
                StringComparison.Ordinal))
        {
            return VerifyPbkdf2Password(
                password,
                storedHash
            );
        }

        usesLegacyHash = true;

        return VerifyLegacyPassword(
            password,
            storedHash
        );
    }

    private static bool VerifyPbkdf2Password(
        string password,
        string storedHash)
    {
        try
        {
            var parts =
                storedHash.Split('.');

            if (parts.Length != 4)
            {
                return false;
            }

            if (!int.TryParse(
                    parts[1],
                    out var iterations))
            {
                return false;
            }

            var salt =
                Convert.FromBase64String(
                    parts[2]
                );

            var expectedHash =
                Convert.FromBase64String(
                    parts[3]
                );

            var actualHash =
                Rfc2898DeriveBytes.Pbkdf2(
                    password,
                    salt,
                    iterations,
                    HashAlgorithmName.SHA256,
                    expectedHash.Length
                );

            return CryptographicOperations
                .FixedTimeEquals(
                    actualHash,
                    expectedHash
                );
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private static bool VerifyLegacyPassword(
        string password,
        string storedHash)
    {
        using var sha256 =
            SHA256.Create();

        var passwordBytes =
            Encoding.UTF8.GetBytes(
                password
            );

        var hashBytes =
            sha256.ComputeHash(
                passwordBytes
            );

        var legacyHash =
            Convert.ToBase64String(
                hashBytes
            );

        var actualBytes =
            Encoding.UTF8.GetBytes(
                legacyHash
            );

        var expectedBytes =
            Encoding.UTF8.GetBytes(
                storedHash
            );

        return actualBytes.Length ==
               expectedBytes.Length &&
               CryptographicOperations
                   .FixedTimeEquals(
                       actualBytes,
                       expectedBytes
                   );
    }
}