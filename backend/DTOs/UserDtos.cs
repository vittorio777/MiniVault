namespace MiniVault.DTOs;

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
    public string Nickname { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Nickname { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}