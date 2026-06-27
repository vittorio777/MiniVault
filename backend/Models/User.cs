namespace MiniVault.Models;

public class User
{
    public int Id {get; set; }
    public string Nickname {get; set; } = string.Empty;
    public string Email {get; set; } = string.Empty;
    public string PasswordHash {get; set; } = string.Empty;
    public DateTime CreateAt {get; set; } = DateTime.UtcNow;
}