# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY src/Carmen.Domain/*.csproj Carmen.Domain/
COPY src/Carmen.Application/*.csproj Carmen.Application/
COPY src/Carmen.Infrastructure/*.csproj Carmen.Infrastructure/
COPY src/Carmen.WebApi/*.csproj Carmen.WebApi/
COPY Carmen.sln .

RUN dotnet restore

# Copy everything else and build
COPY src/ .
RUN dotnet publish Carmen.WebApi/Carmen.WebApi.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create non-root user for security
RUN adduser --disabled-password --gecos "" appuser

# Copy published files
COPY --from=build /app/publish .

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1

# Start the application
ENTRYPOINT ["dotnet", "Carmen.WebApi.dll"]
