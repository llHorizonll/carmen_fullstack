using Carmen.Infrastructure.Data;
using Carmen.Infrastructure.Services;
using Carmen.TestCommon.Fixtures;
using FluentAssertions;
using Xunit;

namespace Carmen.Infrastructure.Tests.Services;

/// <summary>
/// DashboardService uses complex GroupBy + Sum LINQ queries over navigation properties
/// (GetTopExpenseAccountsAsync) that the EF Core InMemory provider cannot translate.
/// Full dashboard testing is covered in Carmen.WebApi.Tests integration tests
/// using WebApplicationFactory with a real database provider.
/// This file contains only instantiation/smoke tests.
/// </summary>
public class DashboardServiceTests : IDisposable
{
    private readonly CarmenDbContext _context;
    private readonly DashboardService _service;

    public DashboardServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _service = new DashboardService(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public void Constructor_CreatesService()
    {
        _service.Should().NotBeNull();
    }
}
