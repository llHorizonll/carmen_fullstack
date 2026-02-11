namespace Carmen.Application.DTOs.Auth;

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Phone,
    Guid? TenantId,
    List<Guid>? RoleIds
);
