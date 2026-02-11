using Carmen.Application.Interfaces;
using Carmen.Infrastructure.Data;
using Hangfire;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;

namespace Carmen.WebApi.Tests;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Remove ALL DbContext-related registrations (including the InMemory one from Program.cs)
            var descriptorsToRemove = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions<CarmenDbContext>) ||
                    d.ServiceType == typeof(CarmenDbContext) ||
                    d.ServiceType.FullName?.Contains("DbContextOptions") == true ||
                    d.ServiceType.FullName?.Contains("IDbContextPool") == true ||
                    d.ServiceType.FullName?.Contains("IDbContextFactory") == true)
                .ToList();
            foreach (var descriptor in descriptorsToRemove)
                services.Remove(descriptor);

            // Register DbContextOptions with InMemory database
            var dbName = _databaseName;
            services.AddSingleton(sp =>
            {
                var optionsBuilder = new DbContextOptionsBuilder<CarmenDbContext>();
                optionsBuilder.UseInMemoryDatabase(dbName);
                return optionsBuilder.Options;
            });

            // Register CarmenDbContext with tenant-aware factory
            // This ensures query filters are active based on the current user's JWT claims
            services.AddScoped<CarmenDbContext>(provider =>
            {
                var options = provider.GetRequiredService<DbContextOptions<CarmenDbContext>>();
                var currentUserService = provider.GetRequiredService<ICurrentUserService>();
                return new CarmenDbContext(options, currentUserService.TenantId);
            });

            // Register mock IBackgroundJobClient (Hangfire dependency for NotificationService)
            services.AddSingleton(Substitute.For<IBackgroundJobClient>());
        });
    }

    /// <summary>
    /// Creates an unfiltered DbContext for test data seeding (bypasses tenant query filters).
    /// </summary>
    public CarmenDbContext CreateSeedContext()
    {
        var scope = Services.CreateScope();
        var options = scope.ServiceProvider.GetRequiredService<DbContextOptions<CarmenDbContext>>();
        return new CarmenDbContext(options); // No tenantId = no query filters
    }
}
