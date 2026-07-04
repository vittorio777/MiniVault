using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniVault.Models;
using MiniVault.Data;

namespace MiniVault.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CollectiblesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CollectiblesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Collectible>>> GetCollectibles([FromQuery] int? userId)
    {
        var query = _context.Collectibles.AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(c => c.UserId == userId.Value);
        }
        
        var collectibles = await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(collectibles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Collectible>> GetCollectible(int id)
    {
        var collectible = await _context.Collectibles.FindAsync(id);

        if (collectible == null)
        {
            return NotFound();
        }

        return Ok(collectible);
    }

    [HttpPost]
    public async Task<ActionResult<Collectible>> CreateCollectible(Collectible collectible)
    {
        collectible.CreatedAt = DateTime.UtcNow;
        collectible.UpdatedAt = DateTime.UtcNow;

        _context.Collectibles.Add(collectible);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCollectible),
            new {id = collectible.Id},
            collectible
        );
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCollectible(int id)
    {
        var collectible = await _context.Collectibles.FindAsync(id);

        if (collectible == null)
        {
            return NotFound();
        }

        _context.Collectibles.Remove(collectible);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCollectible(int id, Collectible updatedCollectible)
    {
         var collectible = await _context.Collectibles.FindAsync(id);

        if (collectible == null)
        {
            return NotFound();
        }

        collectible.Title = updatedCollectible.Title;
        collectible.Category = updatedCollectible.Category;
        collectible.Description = updatedCollectible.Description;
        collectible.OriginalImageUrl = updatedCollectible.OriginalImageUrl;
        collectible.GeneratedImageUrl = updatedCollectible.GeneratedImageUrl;
        collectible.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
