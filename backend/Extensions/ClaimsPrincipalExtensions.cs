using System.Security.Claims;

namespace MiniVault.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(value, out var userId))
        {
            throw new UnauthorizedAccessException(
                "User is not authenticated.");
        }

        return userId;
    }

    public static string GetUsername(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Name)
            ?? throw new UnauthorizedAccessException(
                "User is not authenticated.");
    }

    public static string GetEmail(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Email)
            ?? throw new UnauthorizedAccessException(
                "User is not authenticated.");
    }
}