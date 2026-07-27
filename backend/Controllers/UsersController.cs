using Microsoft.AspNetCore.Mvc;

using MiniVault.DTOs;
using MiniVault.Services;

namespace MiniVault.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly JwtService _jwtService;

    public UsersController(
        UserService userService,
        JwtService jwtService)
    {
        _userService = userService;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        [FromBody] RegisterRequest request)
    {
        try
        {
            var user =
                await _userService.RegisterAsync(request);

            var token = _jwtService.GenerateToken(
                user.Id,
                user.Email,
                user.Nickname);

            var response = new AuthResponse
            {
                Token = token,
                User = user
            };

            return Ok(response);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        [FromBody] LoginRequest request)
    {
        try
        {
            var user =
                await _userService.LoginAsync(request);

            var token = _jwtService.GenerateToken(
                user.Id,
                user.Email,
                user.Nickname);

            var response = new AuthResponse
            {
                Token = token,
                User = user
            };

            return Ok(response);
        }
        catch (InvalidOperationException exception)
        {
            return Unauthorized(new
            {
                message = exception.Message
            });
        }
    }
}