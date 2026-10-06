using Microsoft.Extensions.FileProviders;
using MiniVault.Services.Storage;

namespace MiniVault.Extensions;

public static class ImageStorageExtensions
{
    public static WebApplication UseUploadedImages(this WebApplication app)
    {
        var uploadsDirectory =
            LocalImageStorageService.GetUploadsDirectory(app.Environment);

        Directory.CreateDirectory(uploadsDirectory);

        // A fresh checkout has no wwwroot, so use an explicit provider
        // instead of the default provider captured during host creation.
        var provider = new PhysicalFileProvider(uploadsDirectory);
        app.Lifetime.ApplicationStopped.Register(provider.Dispose);

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = provider,
            RequestPath = "/uploads"
        });

        return app;
    }
}
