using Microsoft.AspNetCore.Mvc;
using MiniVault.Services;

namespace MiniVault.Controllers;
// 测试用，暂时留着

[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly ImageService _imageService;

    public ImagesController(ImageService imageService)
    {
        _imageService = imageService;
    }

    [HttpPost("capture")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        try
        {
            var imageUrl = await _imageService.UploadImageAsync(file);
            return Ok(new { imageUrl });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        ;
    }
}
