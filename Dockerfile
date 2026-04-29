FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Install Node.js 22 LTS
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Restore NuGet — invalidated only when a .csproj changes
COPY JobPortal.slnx .
COPY Core/JobPortal.Domain/JobPortal.Domain.csproj              Core/JobPortal.Domain/
COPY Core/JobPortal.Application/JobPortal.Application.csproj    Core/JobPortal.Application/
COPY Infrastructure/JobPortal.Infrastructure/JobPortal.Infrastructure.csproj   Infrastructure/JobPortal.Infrastructure/
COPY Infrastructure/JobPortal.Persistence/JobPortal.Persistence.csproj         Infrastructure/JobPortal.Persistence/
COPY Presentation/JobPortal.Web/JobPortal.Web.csproj             Presentation/JobPortal.Web/
RUN dotnet restore Presentation/JobPortal.Web/JobPortal.Web.csproj

# Install npm packages — invalidated only when package-lock.json changes
COPY Presentation/JobPortal.Web/ClientApp/package.json      Presentation/JobPortal.Web/ClientApp/
COPY Presentation/JobPortal.Web/ClientApp/package-lock.json Presentation/JobPortal.Web/ClientApp/
RUN cd Presentation/JobPortal.Web/ClientApp && npm ci

# Copy source and publish; MSBuild PublishRunWebpack runs npm install + build
COPY . .
RUN dotnet publish Presentation/JobPortal.Web/JobPortal.Web.csproj \
    -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup --no-create-home appuser

COPY --from=build /app/publish .

USER appuser

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "JobPortal.Web.dll"]
