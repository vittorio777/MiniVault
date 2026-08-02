using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniVault.DTOs;
using MiniVault.Extensions;
using MiniVault.Models;
using MiniVault.Services;

namespace MiniVault.Controllers;

/// <summary>
/// Provides AI image generation endpoints.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GenerationController : ControllerBase
{
    private readonly GenerationService _generationService;

    public GenerationController(GenerationService generationService)
    {
        _generationService = generationService;
    }

    /// <summary>
    /// Uploads an image and generates a miniature collectible.
    /// </summary>
    [HttpPost("capture")]
    public async Task<ActionResult<CollectibleResponse>> CaptureImage(
        IFormFile file)
    {
        try
        {
            // Read the authenticated user's ID from the validated JWT.
            var userId = User.GetUserId();

            var collectible = await _generationService.CaptureAsync(
                file,
                userId
            );

            return Ok(ToResponse(collectible));
        }
        // Return user-friendly responses for expected validation
        // and authorization failures.
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // Convert the domain model into the API response model.
    private static CollectibleResponse ToResponse(
        Collectible collectible)
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