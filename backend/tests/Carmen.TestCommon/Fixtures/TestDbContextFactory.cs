using Carmen.Infrastructure.Data;
using Carmen.TestCommon.Constants;
using Microsoft.EntityFrameworkCore;

namespace Carmen.TestCommon.Fixtures;

/// <summary>
/// Factory for creating InMemory CarmenDbContext instances for unit tests
/// </summary>
public static class TestDbContextFactory
{
    /// <summary>
    /// Creates a new InMemory CarmenDbContext with the specified tenant ID
    /// </summary>
    public static CarmenDbContext Create(Guid? tenantId = null, string? databaseName = null)
    {
        tenantId ??= TestConstants.DefaultTenantId;
        databaseName ??= Guid.NewGuid().ToString();

        var options = new DbContextOptionsBuilder<CarmenDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        return new CarmenDbContext(options, tenantId);
    }

    /// <summary>
    /// Creates a pair of contexts sharing the same database but with different tenant IDs.
    /// Useful for testing tenant isolation.
    /// </summary>
    public static (CarmenDbContext Tenant1Context, CarmenDbContext Tenant2Context) CreatePair()
    {
        var dbName = Guid.NewGuid().ToString();
        var ctx1 = Create(TestConstants.DefaultTenantId, dbName);
        var ctx2 = Create(TestConstants.SecondTenantId, dbName);
        return (ctx1, ctx2);
    }

    /// <summary>
    /// Creates a new context pointing to an existing database (same InMemory store)
    /// </summary>
    public static CarmenDbContext CreateWithSameDb(string databaseName, Guid? tenantId = null)
    {
        tenantId ??= TestConstants.DefaultTenantId;

        var options = new DbContextOptionsBuilder<CarmenDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        return new CarmenDbContext(options, tenantId);
    }
}
