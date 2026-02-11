using Carmen.Application.DTOs.Auth;

namespace Carmen.Application.Services.Auth;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task<UserDto> RegisterAsync(RegisterRequest request);
    Task<UserDto> GetCurrentUserAsync(Guid userId);
    Task LogoutAsync(Guid userId, string refreshToken);
}
