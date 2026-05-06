# JobPortal

A full-stack **Job Portal & Recruitment Management System** built for companies to manage the entire hiring lifecycle — from publishing job posts and collecting applications, to multi-step evaluation pipelines, approval workflows, and candidate re-engagement. Includes a public-facing company profile & careers page for employer branding.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Database ERD](#database-erd)
- [API Endpoints](#api-endpoints)
- [Coding Style & Conventions](#coding-style--conventions)
- [Getting Started (Local Dev)](#getting-started-local-dev)
- [Build](#build)
- [Dockerfile & Docker Compose](#dockerfile--docker-compose)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | ASP.NET Core 10, C# 13 |
| **Architecture** | Clean Architecture + CQRS (MediatR 11) |
| **Validation** | FluentValidation 12 |
| **ORM** | Entity Framework Core 9 + Pomelo (MySQL) |
| **Database** | MariaDB 10.6+ / MySQL 8.0+ |
| **Auth** | Keycloak 26+ (OIDC / JWT Bearer + TOTP 2FA) |
| **Storage** | MinIO / S3-compatible (AWS SDK) |
| **Email** | MailKit (SMTP) |
| **Logging** | Serilog (console + daily rolling file) |
| **API Docs** | Swashbuckle (Swagger UI) |
| **Frontend** | React 19 + TypeScript + Vite |
| **State** | Redux Toolkit + RTK Query |
| **Styling** | Tailwind CSS 4 |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Rich Text** | Tiptap (email template editor) |

---

## Architecture

```
JobPortal/
├── Core/
│   ├── JobPortal.Domain/          # Entities, base classes — zero external dependencies
│   └── JobPortal.Application/     # CQRS handlers, interfaces, DTOs, validators
│                                  # Organized by feature: Applications/, JobPosts/, TalentPool/, …
├── Infrastructure/
│   ├── JobPortal.Infrastructure/  # Email (MailKit), Storage (MinIO/S3)
│   └── JobPortal.Persistence/     # EF Core DbContext, repositories, migrations, audit interceptor
└── Presentation/
    └── JobPortal.Web/
        ├── Controllers/           # REST API (23 controllers)
        ├── Middleware/            # UserSync, SwaggerBasicAuth
        ├── Services/              # CurrentUserService, KeycloakClaimsTransformation
        └── ClientApp/             # React SPA (Vite + TypeScript)
            └── src/
                ├── app/           # Redux store
                ├── components/    # Shared UI components
                ├── contexts/      # Auth, Branding contexts
                ├── features/      # Feature slices (careers, applications, talentPool, …)
                └── pages/         # Top-level pages
```

**Request flow:**
```
React (RTK Query) → ASP.NET Controller → MediatR → Command/Query Handler
                                                  ↳ FluentValidation (pipeline)
                                                  ↳ Repository → EF Core → MariaDB
                                                  ↳ Email / Storage service (async)
```

**Authorization layers:**
```
JWT Bearer (Keycloak) → Policy: HrOrAdmin | AdminOnly | Authorize | AllowAnonymous
```

---

## Features

### Public / Candidate-facing
- **Company profile homepage** — Hero, services, projects, about, stats, careers preview, contact
- **Careers page** — Employer branding (Why Join Us, stats bar, Life at Company) + searchable, filterable job listings
- **Job detail page** — Full job description, requirements, hiring steps preview
- **Apply flow** — Document upload per required document type, privacy consent gate
- **My Applications** — Candidate tracks their own applications (status, step history)
- **Candidate Profile** — Personal info, highest education (level, major, institution name with autocomplete, start/end year), CV upload/download
- **Privacy consent** — UU PDP No. 27/2022 gate; configurable on/off per deployment

### HR / Admin
- **Job Management** — Draft → Submit for Approval → Published → Closed lifecycle
- **Multi-level Approval Workflow** — Configurable approver chain; email notification per step
- **Application Management** — Table view with filters; step pass/fail; bulk accept/reject
- **Application Detail** — Candidate info including education (level, major, institution, years) visible to HR
- **Step-based Hiring Pipeline** — Each job has ordered steps; sequential pass required; email sent on each outcome
- **Application Rating** — HR can rate (1–10) and add notes per application
- **Talent Pool** — Save rejected candidates; re-engage them for new positions (creates new application, removes from pool, sends email)
- **Analytics Dashboard** — Hiring funnel, application stats, charts by status
- **Hiring Templates** — Reusable pipeline templates with per-step email templates (rich text, placeholder support)

### Administration (Admin role only)
- **Master Data** — Department, Skill, Work Mode, Employment Type, Job Category, Job Level, Currency Type, Document Type, Education Level, Education Major, Approval Levels
- **Department Managers** — Assign one or more email addresses as department managers; each manager can oversee multiple departments (many-to-many). Managers can log in as candidates and access a scoped view of applications only from their assigned departments
- **Branding Settings** — Company name, logo, primary color, gradient colors, contact info, description (all via DB; no redeploy needed)
- **SMTP Settings** — Configure email host/port/sender via UI (ENV overrides UI for secrets)
- **Privacy Consent Settings** — Toggle privacy consent requirement on/off

### System
- **Keycloak SSO** — OIDC with mandatory TOTP (2FA) on first login; role sync on every request
- **Document Storage** — MinIO/S3 with presigned URLs (15-min expiry); per-user folder isolation
- **Email Notifications** — Application received, step pass/fail, direct reject, re-engage, approval; all wrapped in branded HTML container with company primary color
- **Swagger UI (protected)** — Available in all environments; Basic Auth via `SWAGGER_USERNAME` / `SWAGGER_PASSWORD` ENV vars; returns 404 if not configured
- **Audit Log** — Automatic change tracking on all `AuditableEntity` tables
- **Structured Logging** — Serilog to console + daily rolling file (`logs/web-log-YYYYMMDD.log`, 7-day retention)

---

## Database ERD

### Simplified Overview

```
MASTERS                          JOBS
──────────────────────           ────────────────────────────────
AppSettings                      JobPosts ──────────┬── JobSteps
Departments ────────────────────►│                  ├── JobPostSkills ──────────► Skills
Skills ──────────────────────────│                  ├── JobPostRequiredDocuments ► DocumentTypes
WorkModes ───────────────────────│                  ├── JobPostEducationMajors ──► EducationMajors
EmploymentTypes ─────────────────│                  └── JobApprovalInstances ─────► JobApprovalInstanceSteps
JobCategories ───────────────────│
JobLevels ───────────────────────│         HiringTemplates ── HiringTemplateSteps
CurrencyTypes ───────────────────┤         ApprovalLevels (config only)
EducationLevels ─────────────────┤
EducationMajors                  │    APPLICATIONS
DocumentTypes ─────────────────  │    ──────────────────────────────────
  └── DocumentTypeMimeTypes       │    Applications ──────────┬── ApplicationSteps ──► JobSteps
                                 │         │                  └── ApplicationDocuments ► Documents
USERS                            │         │
──────────────────────────────   ◄─────────┤
Users ─────────────────┬──────────────────►│
  ├── UserProfile       │         JobPosts ─┘
  ├── UserAddresses     │
  ├── UserEducationHistories       TALENT POOL
  ├── UserWorkHistories            ──────────────────────────────────
  ├── UserOrganizationHistories    TalentPoolEntries ──► Users (candidate)
  ├── UserSkills ──► Skills                          ──► Applications (original)
  └── UserDocuments ──► Documents                   ──► Users (addedBy)

Documents                        AUDIT
──────────────────               ──────────────────
Documents                        AuditLogs
```

### All Tables (38 total)

| Group | Table | Key Columns |
|-------|-------|-------------|
| **Masters** | `AppSettings` | `Id`, `Key`, `Value`, `UpdatedByUserId` |
| | `Departments` | `Id`, `Name` |
| | `Skills` | `Id`, `Name` |
| | `WorkModes` | `Id`, `Name` |
| | `EmploymentTypes` | `Id`, `Name` |
| | `JobCategories` | `Id`, `Name` |
| | `JobLevels` | `Id`, `Name` |
| | `CurrencyTypes` | `Id`, `Name`, `Prefix` |
| | `DocumentTypes` | `Id`, `Name`, `MaxFileSizeMb`, `IsDefaultRequired` |
| | `DocumentTypeMimeTypes` | `Id`, `DocumentTypeId`, `MimeType` |
| | `EducationLevels` | `Id`, `Name` |
| | `EducationMajors` | `Id`, `Name` |
| | `DepartmentManagers` | `Id`, `FullName`, `Position`, `Email` (unique) |
| | `DepartmentManagerDepartments` | `DepartmentManagerId`, `DepartmentId` (composite PK) |
| **Users** | `Users` | `Id`, `ExternalId` (Keycloak), `Email`, `FirstName`, `LastName`, `IsDeleted` |
| | `UserProfiles` | `Id`, `UserId`, `PhoneNumber`, `EducationLevelId`, `EducationMajorId`, `EducationMajorCustom`, `InstitutionName`, `EducationStartYear`, `EducationEndYear`, `CvDocumentId`, `HasConsentedToPrivacyPolicy` |
| | `UserAddresses` | `Id`, `UserId`, `Street`, `City`, `Province`, `Country`, `PostalCode` |
| | `UserEducationHistories` | `Id`, `UserId`, `EducationLevelId`, `EducationMajorId`, `InstitutionName`, `StartDate`, `EndDate`, `Grade` |
| | `UserWorkHistories` | `Id`, `UserId`, `Company`, `Title`, `StartDate`, `EndDate`, `IsCurrent` |
| | `UserOrganizationHistories` | `Id`, `UserId`, `Organization`, `Role`, `StartYear`, `EndYear` |
| | `UserSkills` | `Id`, `UserId`, `SkillId`, `SkillLevel` |
| | `UserDocuments` | `Id`, `UserId`, `DocumentId`, `DocumentTypeId` |
| **Documents** | `Documents` | `Id`, `OriginalFileName`, `FilePath`, `FileType`, `CreatedByUserId`, `CreatedAt` |
| **Jobs** | `JobPosts` | `Id`, `Slug`, `Title`, `Description`, `Status`, `City`, `Country`, `DepartmentId`, `WorkModeId`, `EmploymentTypeId`, `JobCategoryId`, `JobLevelId`, `CurrencyTypeId`, `MinSalary`, `MaxSalary`, `Quota`, `PublishDate`, `CloseDate`, `IsDeleted` |
| | `JobSteps` | `Id`, `JobPostId`, `Name`, `StepOrder`, `IsRequired`, `PassEmailSubject`, `PassEmailBody`, `FailEmailSubject`, `FailEmailBody` |
| | `JobPostSkills` | `Id`, `JobPostId`, `SkillId` |
| | `JobPostRequiredDocuments` | `Id`, `JobPostId`, `DocumentTypeId` |
| | `JobPostEducationMajors` | `Id`, `JobPostId`, `EducationMajorId` |
| | `HiringTemplates` | `Id`, `Name`, `Description` |
| | `HiringTemplateSteps` | `Id`, `HiringTemplateId`, `Name`, `StepOrder`, `IsRequired`, `PassEmailSubject`, `PassEmailBody`, `FailEmailSubject`, `FailEmailBody` |
| | `ApprovalLevels` | `Id`, `LevelOrder`, `ApproverName`, `ApproverEmail`, `IsActive` |
| | `JobApprovalInstances` | `Id`, `JobPostId`, `Status`, `CurrentStepOrder`, `StartedAt`, `CompletedAt` |
| | `JobApprovalInstanceSteps` | `Id`, `JobApprovalInstanceId`, `StepOrder`, `ApproverName`, `ApproverEmail`, `Status`, `Comment`, `ActionAt` |
| **Applications** | `Applications` | `Id`, `Code`, `JobPostId`, `UserId`, `Status`, `AppliedAt`, `Rating`, `RatingNote`, `RatedAt`, `IsDeleted` |
| | `ApplicationSteps` | `Id`, `ApplicationId`, `JobStepId`, `StepName`, `StepOrder`, `Status`, `CompletedAt` |
| | `ApplicationDocuments` | `Id`, `ApplicationId`, `DocumentId`, `DocumentType` |
| **TalentPool** | `TalentPoolEntries` | `Id`, `UserId` (unique), `OriginalApplicationId`, `Notes`, `AddedByUserId`, `AddedAt` |
| **Audit** | `AuditLogs` | `Id`, `EntityName`, `EntityId`, `Action`, `OldValues`, `NewValues`, `ChangedByUserId`, `ChangedAt` |

> All `AuditableEntity` tables also carry: `CreatedAt`, `CreatedByUserId`, `UpdatedAt`, `UpdatedByUserId`.

---

## API Endpoints

All endpoints are prefixed with `/api`. Auth column: **–** = public, **✓** = any authenticated user, **HR** = HR or Admin role, **A** = Admin role only.

### Masters (Admin-managed lookup data)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/departments` | – | List all |
| POST | `/departments` | HR | Create |
| PUT | `/departments/{id}` | HR | Update |
| DELETE | `/departments/{id}` | HR | Delete |
| _(same pattern)_ | `/skills` | | |
| _(same pattern)_ | `/work-modes` | | |
| _(same pattern)_ | `/employment-types` | | |
| _(same pattern)_ | `/job-categories` | | |
| _(same pattern)_ | `/job-levels` | | |
| _(same pattern)_ | `/currency-types` | | |
| _(same pattern)_ | `/document-types` | | |
| _(same pattern)_ | `/education-levels` | | |
| _(same pattern)_ | `/education-majors` | | |

### Job Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/job-posts` | HR | List all (with filters) |
| GET | `/job-posts/{id}` | HR | Get by ID |
| POST | `/job-posts` | HR | Create |
| PUT | `/job-posts/{id}` | HR | Update |
| DELETE | `/job-posts/{id}` | HR | Soft delete |
| POST | `/job-posts/{id}/publish` | HR | Publish directly (no approval) |
| POST | `/job-posts/{id}/submit-approval` | HR | Submit for multi-level approval |
| POST | `/job-posts/{id}/approve` | ✓ | Approve current step (approver only) |
| POST | `/job-posts/{id}/reject` | ✓ | Reject current step |
| POST | `/job-posts/{id}/cancel-approval` | A | Cancel active approval |
| GET | `/job-posts/{id}/approval-status` | HR | Get approval instance + steps |
| POST | `/job-posts/{id}/close` | HR | Close job post |

### Hiring Templates

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/hiring-templates` | HR | List all |
| GET | `/hiring-templates/{id}` | HR | Get with steps |
| POST | `/hiring-templates` | HR | Create |
| PUT | `/hiring-templates/{id}` | HR | Update |
| DELETE | `/hiring-templates/{id}` | HR | Delete |

### Applications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/applications` | HR | List all (`?jobPostId=&status=`) |
| GET | `/applications/{id}` | HR | Get by ID |
| GET | `/applications/code/{code}` | HR | Get by application code |
| POST | `/applications/{id}/steps/{stepId}/pass` | HR | Pass a step |
| POST | `/applications/{id}/steps/{stepId}/fail` | HR | Fail a step |
| POST | `/applications/{id}/accept` | HR | Directly accept |
| POST | `/applications/{id}/reject` | HR | Directly reject |
| POST | `/applications/{id}/rate` | HR | Set rating (1–10) and note |
| POST | `/applications/bulk-step` | HR | Bulk pass/fail current step |
| POST | `/applications/bulk-accept` | HR | Bulk accept |
| POST | `/applications/bulk-reject` | HR | Bulk reject |

### Approvals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/approvals/pending` | ✓ | My pending approval items |
| GET | `/approvals/is-approver` | ✓ | Check if current user is an approver |
| GET | `/approvals/{jobPostId}/job-post` | ✓ | Full job data for review page |

### Talent Pool

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/talent-pool` | HR | List all entries |
| POST | `/talent-pool` | HR | Add candidate (`{applicationId, notes?}`) |
| DELETE | `/talent-pool/{id}` | HR | Remove entry |
| POST | `/talent-pool/{id}/reengage` | HR | Re-engage for new job (`{jobPostId}`) |

### Careers (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/careers` | – | Published jobs (search + filters + pagination) |
| GET | `/careers/countries` | – | Distinct countries with open positions |
| GET | `/careers/{slug}` | – | Job detail by slug |
| POST | `/careers/{id}/apply` | ✓ | Submit application with documents |

### My Applications (Candidate)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/my-applications` | ✓ | Current user's applications |
| GET | `/my-applications/{code}` | ✓ | Detail by code (owner-verified) |

### Candidate Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/candidate-profile` | ✓ | Get own profile |
| PUT | `/candidate-profile` | ✓ | Upsert profile (personal info + highest education + CV) |
| GET | `/candidate-profile/institutions` | ✓ | Institution name autocomplete (`?q=keyword`) |
| POST | `/candidate-profile/cv` | ✓ | Upload CV (PDF/DOC/DOCX, max 3 MB) |
| DELETE | `/candidate-profile/cv` | ✓ | Remove CV |
| GET | `/candidate-profile/cv/download` | ✓ | Download CV (presigned URL) |

### Documents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/documents/upload` | ✓ | Upload document file |
| GET | `/documents/{id}/download` | ✓ | Download via presigned URL |

### App Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/app-settings/branding` | – | Branding config (colors, company info) |
| GET | `/app-settings/require-privacy-consent` | – | Whether privacy consent is required |
| PUT | `/app-settings/require-privacy-consent` | A | Toggle privacy consent |
| GET | `/app-settings/smtp` | ✓ | SMTP config (no password) |
| PUT | `/app-settings/smtp` | A | Update SMTP config (non-secret fields) |

### Privacy Consent

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/privacy-consent/status` | ✓ | Has current user consented? |
| POST | `/privacy-consent` | ✓ | Record consent |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | ✓ | Current user info |

### Approval Levels

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/approval-levels` | HR | List all levels |
| POST | `/approval-levels` | A | Create |
| PUT | `/approval-levels/{id}` | A | Update |
| DELETE | `/approval-levels/{id}` | A | Delete |

### Department Managers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/department-managers` | HR | List all managers (with departments) |
| GET | `/department-managers/{id}` | HR | Get by ID |
| GET | `/department-managers/is-department-manager` | ✓ | Check if current user is a manager; returns assigned department IDs & names |
| POST | `/department-managers` | A | Create manager with one or more departments |
| PUT | `/department-managers/{id}` | A | Update manager info and department assignments |
| DELETE | `/department-managers/{id}` | A | Remove manager |

### Department Applications (Manager-scoped)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/department-applications` | ✓ | Applications from all departments assigned to the current manager |
| GET | `/department-applications/{id}` | ✓ | Application detail (returns 403 if application is outside manager's departments) |

---

## Coding Style & Conventions

### Backend (C#)

- **Clean Architecture** — no upward dependencies; Domain has zero external packages
- **CQRS** — every use case is a `IRequest<T>` handled by a dedicated `IRequestHandler<,>` via MediatR
- **One handler per file** — `CreateJobPostCommandHandler.cs`, `GetAllApplicationsQueryHandler.cs`
- **FluentValidation** — validators in the same folder as the command/query
- **Repository pattern** — interfaces in `Application`, implementations in `Persistence`
- **No business logic in controllers** — controllers dispatch to MediatR and return results
- **Fire-and-forget emails** — emails run in `Task.Run` and never block the HTTP response
- **`AuditableEntity`** — base class for entities needing `CreatedAt/By`, `UpdatedAt/By`
- **`SoftDeletableEntity`** — extends `AuditableEntity` with `IsDeleted`, `DeletedAt/By`
- **Naming** — PascalCase everywhere; `async`/`await` throughout; `cancellationToken` always passed
- **Minimal comments** — code is self-documenting; comments only for non-obvious WHY

### Frontend (TypeScript / React)

- **Feature-sliced structure** — each feature owns its `api/`, `pages/`, `components/`
- **RTK Query** — all API calls via typed query/mutation hooks; automatic cache invalidation via tags
- **Tailwind CSS** — utility-first; custom colors via CSS variables (`var(--primary)`)
- **CSS variables from AppSetting** — `BrandingContext` fetches branding on load and sets `--primary`, `--gradient-mid`, etc. on `:root`
- **No hardcoded colors** — all theme colors reference `var(--primary)` or Tailwind semantic classes
- **`cn()` helper** — `clsx` + `tailwind-merge` for conditional class composition

---

## Getting Started (Local Dev)

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org)
- [MariaDB 10.6+](https://mariadb.org) or MySQL 8.0+
- [Keycloak 26+](https://www.keycloak.org)
- [MinIO](https://min.io) or any S3-compatible storage
- [Docker](https://www.docker.com) (recommended for Keycloak + MinIO)

### 1. Clone

```bash
git clone <repo-url>
cd JobPortal
```

### 2. Start dependencies (Docker)

```bash
# Keycloak
docker run -d --name keycloak \
  -p 9090:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev

# MinIO
docker run -d --name minio \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# Mailpit (local SMTP for testing)
docker run -d --name mailpit \
  -p 1025:1025 -p 8025:8025 \
  axllent/mailpit
```

### 3. Configure Keycloak

In Keycloak Admin (`http://localhost:9090`):
1. Create realm: `job-portal`
2. Create client: `job-portal-web` — Public, Standard flow, redirect URI `http://localhost:5167/*`
3. Enable **User Registration** in realm Login settings
4. Enable **OTP Policy** (TOTP, SHA1, 6 digits, 30s)
5. Set **Configure OTP** as Default Required Action
6. Create roles: `Admin`, `HR`
7. Create MinIO bucket: `job-portal-documents` (public-read or presigned-URL policy)

### 4. Configure appsettings

Edit `Presentation/JobPortal.Web/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=127.0.0.1;Port=3306;Database=JobPortal;User Id=root;Password=yourpass;CharSet=utf8mb4;"
  },
  "Keycloak": {
    "Authority": "http://localhost:9090/realms/job-portal"
  },
  "Storage": {
    "Endpoint": "http://localhost:9000",
    "AccessKey": "minioadmin",
    "SecretKey": "minioadmin",
    "BucketName": "job-portal-documents",
    "UseSSL": false,
    "ForcePathStyle": true
  },
  "App": {
    "BaseUrl": "http://localhost:5167"
  },
  "Smtp": {
    "Host": "localhost",
    "Port": 1025,
    "FromAddress": "noreply@jobportal.local",
    "FromName": "JobPortal"
  }
}
```

### 5. Apply migrations

```bash
dotnet ef database update \
  --project Infrastructure/JobPortal.Persistence \
  --startup-project Presentation/JobPortal.Web
```

### 6. Install frontend dependencies

```bash
cd Presentation/JobPortal.Web/ClientApp
npm install
cd ../../..
```

### 7. Run

```bash
dotnet run --project Presentation/JobPortal.Web
```

- **API:** `http://localhost:5067`
- **Frontend (Vite dev server):** `http://localhost:5167`
- **Swagger UI:** `http://localhost:5067/swagger` _(set `SWAGGER_USERNAME` + `SWAGGER_PASSWORD` env vars to enable)_
- **Mailpit inbox:** `http://localhost:8025`
- **MinIO console:** `http://localhost:9001`

> In development, the SpaProxy (`Microsoft.AspNetCore.SpaProxy`) automatically forwards non-API requests to the Vite dev server on port 5167.

---

## Build

### Publish (single command — includes React build)

`dotnet publish` automatically runs `npm install && npm run build` inside the MSBuild target, copies the React output (`dist/`) into `wwwroot/`, and produces a self-contained publish folder.

```bash
dotnet publish Presentation/JobPortal.Web/JobPortal.Web.csproj \
  -c Release -o ./publish
```

> Node.js 22+ must be available on the build machine (or in the Docker image). No separate frontend build step needed.

### Add a migration

```bash
dotnet ef migrations add <MigrationName> \
  --project Infrastructure/JobPortal.Persistence \
  --startup-project Presentation/JobPortal.Web
```

### Rollback migration

```bash
dotnet ef database update <PreviousMigrationName> \
  --project Infrastructure/JobPortal.Persistence \
  --startup-project Presentation/JobPortal.Web
```

---

## Dockerfile & Docker Compose

The production setup uses a **single container**: `dotnet publish` triggers `npm install && npm run build` internally, and the resulting `wwwroot/` is served directly by ASP.NET Core — no Nginx or separate frontend container needed.

### `Dockerfile`

Multi-stage build — the `build` stage compiles everything (C# + React); only the compiled output is copied to the lean `runtime` stage. The server only needs Docker — no .NET SDK or Node.js required.

```dockerfile
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

RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid 1001 --no-create-home appuser

COPY --from=build /app/publish .

USER appuser

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "JobPortal.Web.dll"]
```

### `docker-compose.yml`

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "80:8080"
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:8080
      ConnectionStrings__DefaultConnection: "Server=db;Port=3306;Database=JobPortal;User Id=jobportal;Password=${DB_PASSWORD};CharSet=utf8mb4;"
      Keycloak__Authority: ${KEYCLOAK_AUTHORITY}
      Storage__Endpoint: ${STORAGE_ENDPOINT}
      Storage__AccessKey: ${STORAGE_ACCESS_KEY}
      Storage__SecretKey: ${STORAGE_SECRET_KEY}
      Storage__BucketName: job-portal-documents
      Storage__UseSSL: "true"
      App__BaseUrl: ${APP_BASE_URL}
      Smtp__Host: ${SMTP_HOST}
      Smtp__Port: ${SMTP_PORT}
      Smtp__FromAddress: ${SMTP_FROM_ADDRESS}
      Smtp__FromName: ${SMTP_FROM_NAME}
      SMTP_USERNAME: ${SMTP_USERNAME}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      SWAGGER_USERNAME: ${SWAGGER_USERNAME}
      SWAGGER_PASSWORD: ${SWAGGER_PASSWORD}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: mariadb:11
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: JobPortal
      MARIADB_USER: jobportal
      MARIADB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db_data:
```

> **Note:** Run `dotnet ef database update` (or apply migrations via startup) after first deploy. Keycloak and MinIO/S3 must be provisioned separately.

---

## Environment Variables

### Required — always set in production

| Variable | Example | Description |
|----------|---------|-------------|
| `ConnectionStrings__DefaultConnection` | `Server=db;Port=3306;Database=JobPortal;User Id=...;Password=...;CharSet=utf8mb4;` | MariaDB connection string |
| `Keycloak__Authority` | `https://auth.example.com/realms/job-portal` | Keycloak realm URL for JWT validation |
| `Storage__Endpoint` | `https://s3.example.com` | MinIO / S3 endpoint |
| `Storage__AccessKey` | `AKIAIOSFODNN7EXAMPLE` | S3 access key |
| `Storage__SecretKey` | `wJalrXUtnFEMI/...` | S3 secret key |
| `Storage__BucketName` | `job-portal-documents` | Target bucket name |
| `Storage__UseSSL` | `true` | HTTPS for storage |
| `Storage__ForcePathStyle` | `false` | `true` for MinIO, `false` for AWS S3 |
| `App__BaseUrl` | `https://app.example.com` | Public URL (used in email links) |

### SMTP — can configure via UI too, ENV always wins

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | Override SMTP host (takes priority over DB setting) |
| `SMTP_PORT` | Override SMTP port |
| `SMTP_SENDER_NAME` | Override sender display name |
| `SMTP_SENDER_EMAIL` | Override sender email address |
| `SMTP_USERNAME` | SMTP auth username (**secret — only settable via ENV, never stored in DB**) |
| `SMTP_PASSWORD` | SMTP auth password (**secret — only settable via ENV, never stored in DB**) |
| `SMTP_ENABLE_SSL` | `true`/`false` override |

> SMTP host/port/sender can also be configured via the UI at `/master/smtp-settings`. ENV always overrides the UI value. Password is **never** stored in the database.

### Swagger — optional, but required to enable Swagger UI

| Variable | Description |
|----------|-------------|
| `SWAGGER_USERNAME` | Username for Swagger Basic Auth. If not set, `/swagger` returns 404. |
| `SWAGGER_PASSWORD` | Password for Swagger Basic Auth. |

### appsettings.json (non-secret defaults you can override)

| Config key | Default | Description |
|------------|---------|-------------|
| `Storage__PresignExpireMinutes` | `15` | Presigned URL expiry |
| `Smtp__Port` | `587` | SMTP port |
| `Smtp__FromName` | `"Job Portal"` | Sender display name |
| `ASPNETCORE_URLS` | `http://+:8080` | Listening address inside container |
| `ASPNETCORE_ENVIRONMENT` | `Development` | Set to `Production` in production |

---

## Database Migrations

Migrations live in `Infrastructure/JobPortal.Persistence/Migrations/`.

| # | Migration | What was added |
|---|-----------|---------------|
| 1 | `InitialCreate` | Core domain: Users, Jobs, Applications, Masters |
| 2 | `AuditRefactor` | Audit log + AuditableEntity base |
| 3 | `AddDocumentTypeMimeTypes` | Allowed MIME types per document type |
| 4 | `AddDocumentTypeMaxFileSizeMb` | File size limits per type |
| 5 | `AddJobPostSkills` | JobPost ↔ Skills many-to-many |
| 6 | `AddHiringTemplates` | HiringTemplates + HiringTemplateSteps |
| 7 | `AddOriginalFileNameToDocuments` | Preserve original file name |
| 8 | `AddCandidateProfileEducationAndJobRequiredDocuments` | Candidate education + required docs per job |
| 9 | `AddDocumentTypeIsDefaultRequired` | Flag doc types as default-required |
| 10 | `RefactorUserProfileAndAddCv` | CV upload on UserProfile |
| 11 | `RemoveCvDocumentTypeIdFromUserProfile` | CV relationship cleanup |
| 12 | `AddEmailTemplatesToSteps` | Pass/fail email templates per job step |
| 13 | `AddApprovalWorkflow` | Multi-level job post approval instances |
| 14 | `AddJobPostPreferredMajors` | Preferred education majors per job |
| 15 | `AddApplicationRating` | Rating (1–10) + note on applications |
| 16 | `AddUserProfileEducationMajor` | Education major on candidate profile |
| 17 | `AddPrivacyConsent` | UU PDP consent tracking on UserProfile |
| 18 | `SplitLocationToCityCountry` | Split `Location` string into `City` + `Country` |
| 19 | `AddTalentPool` | TalentPoolEntries table (unique per user) |
| 20 | `AddEducationYearsToUserProfile` | `EducationStartYear`, `EducationEndYear` on UserProfile |
| 21 | `AddInstitutionNameToUserProfile` | `InstitutionName` (max 255, ToTitleCase on save) on UserProfile |
| 22 | `ExpandAppSettingValueToLongText` | Expand `AppSettings.Value` column to `LONGTEXT` |
| 23 | `AddDepartmentManagers` | `DepartmentManagers` table with unique email index |
| 24 | `FixDepartmentManagerSnapshot` | EF Core model snapshot reconciliation (no schema change) |
| 25 | `AddDepartmentManagerDepartments` | `DepartmentManagerDepartments` junction table; drop old `DepartmentId` column from `DepartmentManagers` |
