using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Carmen.Infrastructure.Data;

public class CarmenDbContextFactory : IDesignTimeDbContextFactory<CarmenDbContext>
{
    public CarmenDbContext CreateDbContext(string[] args)
    {
        // Design-time connection string - only used for migrations
        var connectionString = "Server=127.0.0.1;Port=3336;Database=Carmen_Dev;Uid=root;Pwd=123456;";

        var optionsBuilder = new DbContextOptionsBuilder<CarmenDbContext>();

        // Use a specific MySQL version to avoid auto-detection (which requires connection)
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 0));
        optionsBuilder.UseMySql(connectionString, serverVersion);

        return new CarmenDbContext(optionsBuilder.Options);
    }
}
