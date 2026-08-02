using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

using MiniVault.Api.Settings;

namespace MiniVault.Services;

public sealed class JwtService
{
    private readonly JwtSettings _jwtSettings;

    public JwtService(IOptions<JwtSettings> jwtOptions)
    {
        _jwtSettings = jwtOptions.Value;
    }

    /// <summary>
    /// Generates a signed JWT containing the authenticated user's identity.
    /// </summary>
    public string GenerateToken(
        int userId,
        string email,
        string username)
    {
        // Include both standard JWT claims and ASP.NET identity claims
        // so the user can be identified consistently in API controllers.
        var claims = new List<Claim>
        {
            new(
                JwtRegisteredClaimNames.Sub,
                userId.ToString()),

            new(
                JwtRegisteredClaimNames.Email,
                email),

            new(
                ClaimTypes.NameIdentifier,
                userId.ToString()),

            new(
                ClaimTypes.Name,
                username),

            new(
                ClaimTypes.Email,
                email),

            new(
                "username",
                username),

            // Give each token a unique identifier.
            new(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString())
        };

        // Create the symmetric signing key from the configured secret.
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                _jwtSettings.SecretKey));

        // Sign the token with HMAC SHA-256 so its contents
        // cannot be modified without invalidating the signature.
        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            // The token lifetime is controlled through application settings.
            expires: DateTime.UtcNow.AddMinutes(
                _jwtSettings.ExpirationMinutes),
            signingCredentials: credentials
        );

        // Serialize the JWT object into the compact token string
        // returned to the frontend after authentication.
        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}