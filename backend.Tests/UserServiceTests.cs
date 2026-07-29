using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

using MiniVault.Data;
using MiniVault.DTOs;
using MiniVault.Services;

namespace backend.Tests;

public class UserServiceTests
{
    private static async Task<(
        AppDbContext Context,
        SqliteConnection Connection)> CreateContextAsync()
    {
        var connection = new SqliteConnection(
            "Data Source=:memory:"
        );

        await connection.OpenAsync();

        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite(connection)
                .Options;

        var context = new AppDbContext(options);

        await context.Database.EnsureCreatedAsync();

        return (context, connection);
    }

    [Fact]
    public async Task RegisterAsync_WithValidRequest_CreatesUser()
    {
        // Arrange
        var setup = await CreateContextAsync();

        await using var context = setup.Context;
        await using var connection = setup.Connection;

        var achievementService =
            new AchievementService(context);

        var service = new UserService(
            context,
            achievementService
        );

        var request = new RegisterRequest
        {
            Nickname = "  wayne  ",
            Email = "  WAYNE@EXAMPLE.COM  ",
            Password = "Password123!"
        };

        // Act
        var result =
            await service.RegisterAsync(request);

        // Assert
        Assert.True(result.Id > 0);

        Assert.Equal(
            "wayne",
            result.Nickname
        );

        Assert.Equal(
            "wayne@example.com",
            result.Email
        );

        var storedUser =
            await context.Users.SingleAsync();

        Assert.Equal(
            "wayne",
            storedUser.Nickname
        );

        Assert.Equal(
            "wayne@example.com",
            storedUser.Email
        );

        Assert.NotEqual(
            "Password123!",
            storedUser.PasswordHash
        );

        Assert.StartsWith(
            "PBKDF2.",
            storedUser.PasswordHash
        );
    }

    [Fact]
    public async Task RegisterAsync_WithDuplicateEmail_ThrowsException()
    {
        // Arrange
        var setup = await CreateContextAsync();

        await using var context = setup.Context;
        await using var connection = setup.Connection;

        var achievementService =
            new AchievementService(context);

        var service = new UserService(
            context,
            achievementService
        );

        await service.RegisterAsync(
            new RegisterRequest
            {
                Nickname = "wayne",
                Email = "wayne@example.com",
                Password = "Password123!"
            }
        );

        var duplicateRequest =
            new RegisterRequest
            {
                Nickname = "another-user",
                Email = "WAYNE@EXAMPLE.COM",
                Password = "AnotherPassword123!"
            };

        // Act
        var exception =
            await Assert.ThrowsAsync<
                InvalidOperationException>(
                () => service.RegisterAsync(
                    duplicateRequest
                )
            );

        // Assert
        Assert.Equal(
            "Email already registered.",
            exception.Message
        );

        Assert.Equal(
            1,
            await context.Users.CountAsync()
        );
    }

    [Fact]
    public async Task LoginAsync_WithCorrectPassword_ReturnsUser()
    {
        // Arrange
        var setup = await CreateContextAsync();

        await using var context = setup.Context;
        await using var connection = setup.Connection;

        var achievementService =
            new AchievementService(context);

        var service = new UserService(
            context,
            achievementService
        );

        await service.RegisterAsync(
            new RegisterRequest
            {
                Nickname = "wayne",
                Email = "wayne@example.com",
                Password = "Password123!"
            }
        );

        var loginRequest =
            new LoginRequest
            {
                Nickname = "wayne",
                Password = "Password123!"
            };

        // Act
        var result =
            await service.LoginAsync(loginRequest);

        // Assert
        Assert.True(result.Id > 0);

        Assert.Equal(
            "wayne",
            result.Nickname
        );

        Assert.Equal(
            "wayne@example.com",
            result.Email
        );
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_ThrowsException()
    {
        // Arrange
        var setup = await CreateContextAsync();

        await using var context = setup.Context;
        await using var connection = setup.Connection;

        var achievementService =
            new AchievementService(context);

        var service = new UserService(
            context,
            achievementService
        );

        await service.RegisterAsync(
            new RegisterRequest
            {
                Nickname = "wayne",
                Email = "wayne@example.com",
                Password = "Password123!"
            }
        );

        var loginRequest =
            new LoginRequest
            {
                Nickname = "wayne",
                Password = "WrongPassword!"
            };

        // Act
        var exception =
            await Assert.ThrowsAsync<
                InvalidOperationException>(
                () => service.LoginAsync(
                    loginRequest
                )
            );

        // Assert
        Assert.Equal(
            "Invalid nickname or password.",
            exception.Message
        );
    }
}