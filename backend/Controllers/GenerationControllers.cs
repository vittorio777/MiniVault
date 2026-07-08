using Microsoft.AspNetCore.Mvc;
using MiniVault.Services;
using MiniVault.DTOs;
using MiniVault.Models;

namespace MiniVault.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GenerationController : ControllerBase
{
    private readonly GenerationService _generationService;

    public GenerationController(GenerationService generationService)
    {
        _generationService = generationService;
    }

    [HttpPost("capture")]
    public async Task<IActionResult> CaptureImage(IFormFile file)
    {
        try
        {
            var response = await _generationService.CaptureAsync(file);

            return Ok(ToResponse(response));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        ;
    }

    private static CollectibleResponse ToResponse(Collectible collectible)
    {
        return new CollectibleResponse
        {
            Id = collectible.Id,
            UserId = collectible.UserId,
            Title = collectible.Title,
            Category = collectible.Category,
            Description = collectible.Description,
            OriginalImageUrl = collectible.OriginalImageUrl,
            GeneratedImageUrl = collectible.GeneratedImageUrl,
            CreatedAt = collectible.CreatedAt,
            UpdatedAt = collectible.UpdatedAt
        };
    }
}
