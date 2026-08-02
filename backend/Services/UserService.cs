using System.Security.Cryptography;
using System.Text;

using Microsoft.EntityFrameworkCore;

using MiniVault.Data;
using MiniVault.DTOs;
using MiniVault.Models;

namespace MiniVault.Services;

public class UserService
{
    // PBKDF2 configuration used for newly created and upgraded passwords.
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

    /// <summary>
    /// Creates a new user and initializes their achievement records.
    /// </summary>
    public async Task<UserResponse> RegisterAsync(
        RegisterRequest request)
    {
        // Normalize user input before validating uniqueness.
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

        // User creation and achievement initialization must either
        // both succeed or both be rolled back.
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

    /// <summary>
    /// Validates user credentials and upgrades legacy password hashes when required.
    /// </summary>
    public async Task<UserResponse> LoginAsync(
        LoginRequest request)
    {
        var nickname = request.Nickname.Trim();

        var user = await _context.Users
            .FirstOrDefaultAsync(
                storedUser =>
                    storedUser.Nickname == nickname
            );

        // Return the same message for unknown users and invalid passwords
        // to avoid revealing whether an account exists.
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

        // Transparently migrate older SHA-256 hashes to salted PBKDF2
        // after the user successfully authenticates.
        if (usesLegacyHash)
        {
            user.PasswordHash =
                HashPassword(request.Password);

            await _context.SaveChangesAsync();
        }

        // Ensure older accounts also receive any achievement records
        // introduced after their original registration.
        await _achievementService
            .InitializeUserAchievementsAsync(
                user.Id
            );

        return ToResponse(user);
    }

    // Convert the database entity into the limited user data
    // that is safe to return to the client.
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

    // Generate a unique random salt and derive the password hash
    // using PBKDF2 with SHA-256.
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

        // Store the algorithm, iteration count, salt, and derived hash
        // so the password can be verified and upgraded later.
        return string.Join(
            ".",
            "PBKDF2",
            Iterations,
            Convert.ToBase64String(salt),
            Convert.ToBase64String(hash)
        );
    }

    // Detect the stored hash format and select the matching
    // verification method.
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

            // Fixed-time comparison reduces timing information
            // that could otherwise leak details about the hash.
            return CryptographicOperations
                .FixedTimeEquals(
                    actualHash,
                    expectedHash
                );
        }
        catch (FormatException)
        {
            // Treat malformed stored password data as an invalid password.
            return false;
        }
    }

    // Verify passwords created by the previous unsalted SHA-256 implementation.
    // Successful legacy logins are upgraded to PBKDF2 in LoginAsync.
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