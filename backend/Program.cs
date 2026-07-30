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

builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddOpenApi();

builder.Services.AddScoped<CollectibleService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<GenerationService>();
builder.Services.AddHttpClient<BackgroundRemovalService>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(2);
});
builder.Services.AddScoped<AchievementService>();
builder.Services.AddScoped<JwtService>();

builder.Services.AddScoped<
    IImageStorageService,
    LocalImageStorageService
>();

builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName)
);

var jwtSettings = builder.Configuration
    .GetSection(JwtSettings.SectionName)
    .Get<JwtSettings>()
    ?? throw new InvalidOperationException(
        "JWT settings are missing from appsettings.json."
    );

if (string.IsNullOrWhiteSpace(jwtSettings.SecretKey))
{
    throw new InvalidOperationException(
        "JWT SecretKey is missing from appsettings.json."
    );
}

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
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.SecretKey)
            ),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://polite-coast-0b83c1900.7.azurestaticapps.net"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// if (app.Environment.IsDevelopment())
// {
//     using var scope = app.Services.CreateScope();

//     var dbContext =
//         scope.ServiceProvider.GetRequiredService<AppDbContext>();

//     await dbContext.Database.MigrateAsync();

//     app.MapOpenApi();
//     app.MapScalarApiReference();
// }

using (var scope = app.Services.CreateScope())
{
    var dbContext =
        scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await dbContext.Database.MigrateAsync();
}

app.MapOpenApi();
app.MapScalarApiReference();

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseStaticFiles();
}
else
{
    var uploadsDirectory = Path.Combine(
        "/home",
        "data",
        "minivault",
        "uploads"
    );

    Directory.CreateDirectory(uploadsDirectory);

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            uploadsDirectory
        ),
        RequestPath = "/uploads"
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/api/health", () => "MiniVault API Running");

app.Run();