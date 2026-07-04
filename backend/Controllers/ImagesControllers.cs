using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

using MiniVault.Models;
using MiniVault.Data;

namespace MiniVault.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController: ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public ImagesController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

        var imageFileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(imageFileExtension))
        {
            return BadRequest("Only JPG, PNG, and WEBP images are allowed.");
        }

        var maxFileSize = 5 * 1024 * 1024; // 5MB

        if (file.Length > maxFileSize)
        {
            return BadRequest("File size must under 5MB");
        }

        var uploadFolder = Path.Combine(_environment.WebRootPath ?? "wwwroot", "uploads");

        if (!Directory.Exists(uploadFolder))
        {
            Directory.CreateDirectory(uploadFolder);
        }

        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadFolder, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var imageUrl = $"/uploads/{fileName}";
        
        return Ok(new {imageUrl});
    }
}
