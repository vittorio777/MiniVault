using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniVault.Data;
using MiniVault.Models;

namespace MiniVault.Services;

public class ImageService
{
    private readonly IWebHostEnvironment _environment;

    public ImageService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("No file uploaded.");
        }

        // 检查后缀名
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

        var imageFileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(imageFileExtension))
        {
            throw new ArgumentException("Only JPG, PNG, and WEBP images are allowed.");
        }

        // 检查文件大小
        var maxFileSize = 5 * 1024 * 1024; // 5MB

        if (file.Length > maxFileSize)
        {
            throw new ArgumentException("File size must under 5MB");
        }

        // 拼接上传路径
        var uploadFolder = Path.Combine(_environment.WebRootPath ?? "wwwroot", "uploads");

        if (!Directory.Exists(uploadFolder))
        {
            Directory.CreateDirectory(uploadFolder);
        }

        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadFolder, fileName);

        // 拷贝文件
        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var imageUrl = $"/uploads/{fileName}";

        return imageUrl;
    }
}