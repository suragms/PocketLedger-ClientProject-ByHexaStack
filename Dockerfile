FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY PocketLedger.slnx ./
COPY src/PocketLedger.Domain/PocketLedger.Domain.csproj src/PocketLedger.Domain/
COPY src/PocketLedger.Application/PocketLedger.Application.csproj src/PocketLedger.Application/
COPY src/PocketLedger.Infrastructure/PocketLedger.Infrastructure.csproj src/PocketLedger.Infrastructure/
COPY src/PocketLedger.API/PocketLedger.API.csproj src/PocketLedger.API/

RUN dotnet restore

COPY src/ src/

RUN dotnet publish src/PocketLedger.API/PocketLedger.API.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "PocketLedger.API.dll"]
