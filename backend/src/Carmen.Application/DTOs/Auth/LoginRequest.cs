namespace Carmen.Application.DTOs.Auth;

public record LoginRequest(
    string Email,
    string Password,
    string? TenantCode = null  // Optional: For users with access to multiple tenants
);
