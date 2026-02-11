using Hangfire.Dashboard;
using Microsoft.AspNetCore.Http;

namespace Carmen.Infrastructure.Jobs;

/// <summary>
/// Authorization filter for Hangfire dashboard access.
/// In development, allows all access. In production, requires System.Admin role.
/// </summary>
public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // In development, allow all access for easier debugging
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (environment == "Development")
        {
            return true;
        }

        // In production, require authentication and System.Admin role
        if (httpContext.User.Identity?.IsAuthenticated != true)
        {
            return false;
        }

        // Check for System.Admin role or Job.Admin permission
        return httpContext.User.IsInRole("System.Admin")
            || httpContext.User.HasClaim("permission", "Job.Admin");
    }
}
