using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.FileProviders;

using MiniVault.Api.Settings;
using MiniVault.Data;
using MiniVault.Services;
using MiniVault.Services.Storage;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Register API controllers, in-memory caching, and OpenAPI documentation.
builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddOpenApi();

// Register application services with scoped lifetime.
builder.Services.AddScoped<CollectibleService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<GenerationService>();

// Use a longer timeout because external background-removal requests
// may take more time when processing large images.
builder.Services.AddHttpClient<BackgroundRemovalService>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(2);
});
builder.Services.AddScoped<AchievementService>();
builder.Services.AddScoped<JwtService>();

// Register the local file-system implementation of image storage.
builder.Services.AddScoped<
    IImageStorageService,
    LocalImageStorageService
>();

// Bind the Jwt section from configuration to JwtSettings.
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName)
);

var jwtSettings = builder.Configuration
    .GetSection(JwtSettings.SectionName)
    .Get<JwtSettings>()
    ?? throw new InvalidOperationException(
        "JWT settings are missing from appsettings.json."
    );

// Stop the application during startup if the signing key is not configured.
if (string.IsNullOrWhiteSpace(jwtSettings.SecretKey))
{
    throw new InvalidOperationException(
        "JWT SecretKey is missing from appsettings.json."
    );
}

// Configure JWT bearer authentication for protected API endpoints.
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            // Ensure that the token was issued by the configured issuer.
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,

            // Ensure that the token is intended for this application.
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,

            // Validate the token signature using the configured secret key.
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.SecretKey)
            ),
            // Reject expired tokens without applying the default grace period.
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Configure Entity Framework Core to use PostgreSQL.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// Allow requests from the local frontend, Azure Static Web App,
// and the production custom domains.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://polite-coast-0b83c1900.7.azurestaticapps.net",
                "https://minivault.online",
                "https://www.minivault.online"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Apply pending EF Core migrations automatically when the API starts.
// This ensures that the deployed database schema matches the application.
using (var scope = app.Services.CreateScope())
{
    var dbContext =
        scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await dbContext.Database.MigrateAsync();
}

// Expose OpenAPI metadata and the Scalar API documentation interface.
app.MapOpenApi();
app.MapScalarApiReference();

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    // During local development, static files are served from wwwroot.
    app.UseStaticFiles();
}
else
{
    // Azure App Service deployments may replace files inside wwwroot.
    // Store uploaded images under /home so that they persist across deployments.
    var uploadsDirectory = Path.Combine(
        "/home",
        "data",
        "minivault",
        "uploads"
    );

    Directory.CreateDirectory(uploadsDirectory);

    // Map requests beginning with /uploads to the persistent Azure directory.
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            uploadsDirectory
        ),
        RequestPath = "/uploads"
    });
}

// Authentication must run before authorization so that
// the current user's identity can be established from the JWT.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Lightweight endpoint used to verify that the deployed API is running.
app.MapGet("/api/health", () => "MiniVault API Running");

app.Run();