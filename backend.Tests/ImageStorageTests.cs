using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using MiniVault.Extensions;
using MiniVault.Services.Storage;

namespace backend.Tests;

public class ImageStorageTests
{
    [Fact]
    public async Task UploadedImages_WithInitiallyMissingWebRoot_AreServedFromStorage()
    {
        var root = Path.Combine(Path.GetTempPath(), $"minivault-images-{Guid.NewGuid()}");
        Directory.CreateDirectory(root);

        try
        {
            var builder = WebApplication.CreateBuilder(new WebApplicationOptions
            {
                ContentRootPath = root,
                EnvironmentName = "Development"
            });

            Assert.False(Directory.Exists(Path.Combine(root, "wwwroot")));
            Assert.IsType<NullFileProvider>(builder.Environment.WebRootFileProvider);

            await using var app = builder.Build();
            var defaultPipeline = new ApplicationBuilder(app.Services)
                .UseStaticFiles()
                .Build();
            app.UseUploadedImages();

            var pipeline = ((IApplicationBuilder)app).Build();
            var storage = new LocalImageStorageService(app.Environment);
            var imageBytes = Convert.FromBase64String(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWWQAAAAASUVORK5CYII=");

            using var source = new MemoryStream(imageBytes);
            var imageUrl = await storage.UploadAsync(
                source, "test.png", "image/png", "generated");

            var originalBehavior = new DefaultHttpContext();
            originalBehavior.RequestServices = app.Services;
            originalBehavior.Request.Method = "GET";
            originalBehavior.Request.Path = imageUrl;
            await defaultPipeline(originalBehavior);
            Assert.Equal(StatusCodes.Status404NotFound, originalBehavior.Response.StatusCode);

            var context = new DefaultHttpContext();
            context.RequestServices = app.Services;
            context.Request.Method = "GET";
            context.Request.Path = imageUrl;
            using var response = new MemoryStream();
            context.Response.Body = response;

            await pipeline(context);

            Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
            Assert.Equal("image/png", context.Response.ContentType);
            Assert.Equal(imageBytes, response.ToArray());

            var missing = new DefaultHttpContext();
            missing.RequestServices = app.Services;
            missing.Request.Method = "GET";
            missing.Request.Path = "/uploads/missing.png";
            await pipeline(missing);
            Assert.Equal(StatusCodes.Status404NotFound, missing.Response.StatusCode);

            var outsideUploads = new DefaultHttpContext();
            outsideUploads.RequestServices = app.Services;
            outsideUploads.Request.Method = "GET";
            outsideUploads.Request.Path = imageUrl.Replace("/uploads", "");
            await pipeline(outsideUploads);
            Assert.Equal(StatusCodes.Status404NotFound, outsideUploads.Response.StatusCode);
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }

    [Theory]
    [InlineData("Production")]
    [InlineData("Staging")]
    public void UploadsDirectory_OutsideDevelopment_PreservesAzurePath(string environmentName)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            EnvironmentName = environmentName
        });

        Assert.Equal(
            Path.Combine("/home", "data", "minivault", "uploads"),
            LocalImageStorageService.GetUploadsDirectory(builder.Environment));
    }
}
