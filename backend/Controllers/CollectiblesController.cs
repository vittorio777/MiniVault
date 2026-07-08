using Microsoft.AspNetCore.Mvc;
using MiniVault.DTOs;
using MiniVault.Models;
using MiniVault.Services;

namespace MiniVault.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CollectiblesController : ControllerBase
{
    private readonly CollectibleService _collectibleService;

    public CollectiblesController(CollectibleService collectibleService)
    {
        _collectibleService = collectibleService;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<CollectibleResponse>>> GetCollectiblesByUserId(int userId)
    {
        var collectibles = await _collectibleService.GetByUserIdAsync(userId);

        var response = collectibles
            .Select(ToResponse)
            .ToList();

        return Ok(response);
    }

    [HttpGet("user/{userId}/category/{category}")]
    public async Task<ActionResult<List<CollectibleResponse>>> GetCollectiblesByUserIdAndCategory(int userId, string category)
    {
        var collectibles = await _collectibleService.GetSelectedCategoryAsync(userId, category);

        var response = collectibles
            .Select(c => ToResponse(c))
            .ToList();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CollectibleResponse>> GetCollectibleById(int id)
    {
        var collectible = await _collectibleService.GetByIdAsync(id);

        if (collectible == null)
        {
            return NotFound();
        }

        var response = ToResponse(collectible);

        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCollectibleById(int id, UpdateCollectibleRequest request)
    {
        var collectible = new Collectible
        {
            Title = request.Title,
            Category = request.Category,
            Description = request.Description,
            OriginalImageUrl = request.OriginalImageUrl,
            GeneratedImageUrl = request.GeneratedImageUrl,
        };
        var success = await _collectibleService.UpdateByIdAsync(id, collectible);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCollectibleById(int id)
    {
        var success = await _collectibleService.DeleteByIdAsync(id);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<CollectibleResponse>> CreateCollectible(CreateCollectibleRequest request)
    {
        var collectible = new Collectible
        {
            UserId = request.UserId,
            Title = request.Title,
            Category = request.Category,
            Description = request.Description,
            OriginalImageUrl = request.OriginalImageUrl,
            GeneratedImageUrl = request.GeneratedImageUrl,
        };

        var createdCollectible = await _collectibleService.CreateAsync(collectible);

        var response = ToResponse(createdCollectible);

        return CreatedAtAction(
            nameof(GetCollectibleById),
            new { id = response.Id },
            response
        );
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
