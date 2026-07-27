using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniVault.DTOs;
using MiniVault.Extensions;
using MiniVault.Models;
using MiniVault.Services;

namespace MiniVault.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CollectiblesController : ControllerBase
{
    private readonly CollectibleService _collectibleService;

    public CollectiblesController(
        CollectibleService collectibleService)
    {
        _collectibleService = collectibleService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CollectibleResponse>>> GetCollectibles()
    {
        var userId = User.GetUserId();

        var collectibles =
            await _collectibleService.GetByUserIdAsync(userId);

        var response = collectibles
            .Select(ToResponse)
            .ToList();

        return Ok(response);
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<List<CollectibleResponse>>> GetCollectiblesByCategory(
        string category)
    {
        var userId = User.GetUserId();

        var collectibles =
            await _collectibleService.GetSelectedCategoryAsync(
                userId,
                category
            );

        var response = collectibles
            .Select(ToResponse)
            .ToList();

        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CollectibleResponse>> GetCollectibleById(
        int id)
    {
        var userId = User.GetUserId();

        var collectible =
            await _collectibleService.GetByIdAsync(
                id,
                userId
            );

        if (collectible == null)
        {
            return NotFound();
        }

        return Ok(ToResponse(collectible));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCollectibleById(
        int id,
        UpdateCollectibleRequest request)
    {
        var userId = User.GetUserId();

        var collectible = new Collectible
        {
            Title = request.Title,
            Category = request.Category,
            Description = request.Description
        };

        var success =
            await _collectibleService.UpdateByIdAsync(
                id,
                userId,
                collectible
            );

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCollectibleById(
        int id)
    {
        var userId = User.GetUserId();

        var deletedCollectible =
            await _collectibleService.DeleteByIdAsync(
                id,
                userId
            );

        if (deletedCollectible == null)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<CollectibleResponse>> CreateCollectible(
        CreateCollectibleRequest request)
    {
        var userId = User.GetUserId();

        var collectible = new Collectible
        {
            UserId = userId,
            Title = request.Title,
            Category = request.Category,
            Description = request.Description,
            OriginalImageUrl = request.OriginalImageUrl,
            GeneratedImageUrl = request.GeneratedImageUrl
        };

        var createdCollectible =
            await _collectibleService.CreateAsync(
                collectible
            );

        var response =
            ToResponse(createdCollectible);

        return CreatedAtAction(
            nameof(GetCollectibleById),
            new { id = response.Id },
            response
        );
    }

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