# JobPortal

A modern job portal platform built with **Clean Architecture**, designed for both HR administrators and job applicants. Features secure authentication via Keycloak with TOTP (2FA), full CRUD management for HR, and a responsive React frontend.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | ASP.NET Core 10, C# |
| **ORM** | Entity Framework Core 9 + Pomelo (MySQL) |
| **CQRS** | MediatR 14 + FluentValidation |
| **Database** | MariaDB / MySQL 8.0+ |
| **Auth** | Keycloak (OIDC + TOTP/2FA) |
| **Frontend** | React 19 + TypeScript + Vite |
| **State** | Redux Toolkit + RTK Query |
| **Styling** | Tailwind CSS 4 |
| **Icons** | Lucide React |

---

## Architecture

```
JobPortal/
├── Core/
│   ├── JobPortal.Domain/          # Entities, base classes
│   └── JobPortal.Application/     # CQRS, interfaces, DTOs, validators
├── Infrastructure/
│   ├── JobPortal.Infrastructure/  # External services (email, etc.)
│   └── JobPortal.Persistence/     # EF Core, repositories, migrations
└── Presentation/
    └── JobPortal.Web/
        ├── Controllers/           # REST API
        └── ClientApp/             # React SPA (Vite)
```

**Data flow:**
```
React (RTK Query) → ASP.NET Controller → MediatR → Handler → Repository → MariaDB
                                                  ↳ FluentValidation
```

---

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org)
- [MariaDB 10.6+](https://mariadb.org) or MySQL 8.0+
- [Keycloak 26+](https://www.keycloak.org) (running on port 9090)
- [Docker](https://www.docker.com) (optional, for Keycloak)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd JobPortal
```

### 2. Configure environment

Update `Presentation/JobPortal.Web/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=JobPortal;User Id=your_user;Password=your_password;CharSet=utf8mb4;"
  },
  "Keycloak": {
    "Authority": "http://localhost:9090/realms/job-portal",
    "ClientId": "job-portal-web",
    "Audience": "job-portal-web"
  }
}
```

### 3. Start Keycloak (Docker)

```bash
docker run -d --name keycloak \
  -p 9090:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

Then configure in Keycloak Admin (`http://localhost:9090`):
- Create realm: `job-portal`
- Create client: `job-portal-web` (Public, redirect URI: `http://localhost:5167/*`)
- Enable **User Registration** in Login settings
- Enable **OTP Policy** (TOTP, SHA1, 6 digits, 30s)
- Set **Configure OTP** as Default Required Action

### 4. Apply database migrations

```bash
dotnet ef database update \
  --project Infrastructure/JobPortal.Persistence \
  --startup-project Presentation/JobPortal.Web
```

### 5. Install frontend dependencies

```bash
cd Presentation/JobPortal.Web/ClientApp
npm install
```

### 6. Run the application

```bash
# From root directory
dotnet run --project Presentation/JobPortal.Web
```

- **Backend API:** `http://localhost:5067`
- **Frontend (Vite):** `http://localhost:5167`
- **Swagger UI:** `http://localhost:5067/swagger`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/departments` | Public | List all departments |
| GET | `/api/departments/{id}` | Public | Get department by ID |
| POST | `/api/departments` | Required | Create department |
| PUT | `/api/departments/{id}` | Required | Update department |
| DELETE | `/api/departments/{id}` | Required | Delete department |

---

## Features

- **Authentication:** Keycloak OIDC with mandatory TOTP (2FA) setup on first login
- **HR Admin Panel:** Responsive sidebar layout for managing master data, jobs, and applications
- **Master Settings:** CRUD for Department, Skill, Work Mode, Employment Type, and more
- **Role-based access:** Roles managed through Keycloak (HR Admin, Applicant)
- **Optimistic UI:** RTK Query handles caching and automatic cache invalidation

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request
