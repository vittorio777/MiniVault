namespace MiniVault.DTOs;

using System.ComponentModel.DataAnnotations;

public class UserResponse
{
    public int Id { get; set; }

    public string Nickname { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;

    public UserResponse User { get; set; } = new();
}

public class RegisterRequest
{
    [Required]
    [StringLength(30, MinimumLength = 2)]
    public string Nickname { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required]
    public string Nickname { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}