using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using MiniVault.Models;
using MiniVault.Data;

using System.Security.Cryptography;
using System.Text;

namespace MiniVault.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register(RegisterRequest request)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Nickname == request.Nickname);

        if (existingUser != null)
        {
            return BadRequest("Nickname already registered.");
        }

        var user = new User
        {
            Nickname = request.Nickname,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new UserResponse
        {
            Id = user.Id,
            Nickname = user.Nickname,
            Email = user.Email
        });

    }

    [HttpPost("login")]
    public async Task<ActionResult<UserResponse>> Login(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Nickname == request.Nickname);

        if (user == null)
        {
           return Unauthorized("Invalid nickname or password."); 
        }

        var passwordHash = HashPassword(request.Password);

        if (user.PasswordHash != passwordHash)
        {
            return Unauthorized("Invalid nickname or password.");
        }

        return Ok(new UserResponse
        {
            Id = user.Id,
            Nickname = user.Nickname,
            Email = user.Email
        });

    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();

        var bytes = Encoding.UTF8.GetBytes(password);
        var hashBytes = sha256.ComputeHash(bytes);

        return Convert.ToBase64String(hashBytes);
    }
}


public class UserResponse
{
    public int Id {get; set; }
    public string Nickname {get; set; } = string.Empty;
    public string Email {get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Nickname {get; set; } = string.Empty;
    public string Email {get; set; } = string.Empty;
    public string Password {get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Nickname {get; set; } = string.Empty;
    public string Password {get; set; } = string.Empty;
}