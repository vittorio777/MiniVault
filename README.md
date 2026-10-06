# MiniVault

MiniVault turns photos into AI-generated miniature collectibles that users can browse, organize, and manage in a personal collection.

**[Live Demo](https://minivault.online)** | **[API Reference](https://minivault-api-ejf7d3g8awahg4ev.australiaeast-01.azurewebsites.net/scalar/v1)**

Choose **Continue with demo account** to explore the application without registering.

![MiniVault homepage](docs/images/home-current.jpg)

## Features

- Generate miniature artwork from a photo, with an AI-generated title, category, and description.
- Browse a collection by category, view individual collectibles, and edit or delete items.
- Register and log in to manage your own collection.
- Unlock achievements based on collection size and categories.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, React Router, React Bootstrap |
| Backend | C#, ASP.NET Core / .NET 10, Entity Framework Core 10 |
| Database | PostgreSQL, Npgsql |
| AI services | OpenAI, Google AI, remove.bg |
| Testing | Vitest, React Testing Library, xUnit, SQLite in-memory, EF InMemory |
| Deployment | GitHub Actions, Azure Static Web Apps, Azure App Service |
| API documentation | OpenAPI, Scalar |

## Screenshots

### Photo to Miniature

| Original photo | Generated collectible |
| --- | --- |
| <img src="docs/images/original-photo.jpg" alt="Original Melbourne tram photo" width="300"> | <img src="docs/images/miniature-result.png" alt="Generated miniature tram" width="300"> |

### Collection

![MiniVault collection](docs/images/collection-current.jpg)

### Collectible Details

![MiniVault collectible details](docs/images/detail-current.jpg)

## Project Structure

The React client communicates with an ASP.NET Core API. Controllers handle requests, application services implement business logic, and EF Core accesses PostgreSQL.

During capture, the backend stores the uploaded photo, generates metadata with OpenAI and artwork with Google AI, removes the background, saves the collectible, and updates achievements. Selected Google AI failures are retried with exponential backoff; unsuccessful captures clean up partially stored files.

JWT authentication and ownership checks protect collection endpoints. Passwords use salted PBKDF2, and collection lists use a five-minute per-user memory cache that is invalidated after changes.

Images are served through `/uploads` and stored in `backend/wwwroot/uploads` during development or `/home/data/minivault/uploads` outside development.

The main repository directories are:

```text
MiniVault/
|-- frontend/
|   |-- src/
|   |   |-- pages/                  Collection homepage and collectible viewer
|   |   |-- components/
|   |   |   |-- collection/         Collection grid and cards
|   |   |   |-- user/               Login, registration, and account controls
|   |   |   |-- viewer/             Details, editing, and deletion dialogs
|   |   |   |-- achievement/        Achievement drawer and progress items
|   |   |   |-- CategoryMenu.tsx    Category filtering
|   |   |   `-- UploadButton.tsx    Photo upload and generation
|   |   |-- api/                    HTTP client and endpoint helpers
|   |   |-- types/                  Collectible and achievement types
|   |   |-- utils/                  Image URLs and achievement notifications
|   |   |-- test/                   Shared test setup
|   |   `-- App.tsx                 Application routes
|   |-- public/                     Favicons and static assets
|   |-- package.json                Dependencies and development commands
|   `-- vite.config.ts              Vite and Vitest configuration
|-- backend/
|   |-- Controllers/                User, collection, generation, and achievement APIs
|   |-- Services/
|   |   |-- Storage/                Image storage interface and filesystem implementation
|   |   `-- *.cs                    Authentication, generation, collection, and achievements
|   |-- Data/                       EF Core database context
|   |-- Models/                     Database entities
|   |-- DTOs/                       Request validation and response types
|   |-- Migrations/                 Database schema changes and achievement seeds
|   |-- Extensions/                 User identity helpers and image-serving setup
|   |-- Settings/                   JWT configuration types
|   |-- Properties/                 Local launch profiles
|   |-- wwwroot/uploads/            Local images, created at runtime and ignored by Git
|   |-- appsettings.json            Application configuration
|   `-- Program.cs                  Service registration and request pipeline
|-- backend.Tests/                  User, collection, achievement, and image-serving tests
|-- .github/workflows/              Azure build and deployment workflows
|-- docs/
|   |-- images/                     Screenshots and photo-to-miniature examples
|   |-- index.html                  Presentation page
|   `-- style.css                   Presentation styling
|-- specs/                          AI-assisted development prompt notes
`-- README.md                       Project overview and development guide
```

## Getting Started

### Prerequisites

- Node.js 22.13 or later in the 22.x series, with npm.
- .NET 10 SDK.
- PostgreSQL running locally, with pgAdmin or `psql`.
- OpenAI, Google AI, and remove.bg API keys to generate collectibles.

### 1. Clone the Repository

```powershell
git clone https://github.com/vittorio777/MiniVault.git
cd MiniVault
```

### 2. Prepare the Database

Connect to PostgreSQL as an administrator. Run each statement separately outside a transaction, replacing the password placeholder:

```sql
CREATE USER minivault WITH PASSWORD 'your-local-database-password';
CREATE DATABASE mineplus OWNER minivault;
```

The backend creates the tables and seeds five achievement definitions automatically on startup.

### 3. Configure and Run the Backend

In `backend/appsettings.json`, update the existing `ConnectionStrings.DefaultConnection` value to match your database:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=mineplus;Username=minivault;Password=your-local-database-password"
  }
}
```

Keep the other existing settings, including `Jwt`, which already provides a local development signing key.

For image generation, add these sections to the same top-level JSON object:

```json
{
  "OpenAI": { "ApiKey": "your-openai-api-key" },
  "GoogleAI": { "ApiKey": "your-google-ai-api-key" },
  "RemoveBg": { "ApiKey": "your-remove-bg-api-key" }
}
```

Use your own API keys. Registration and login work without these sections. Keep real keys and private database credentials out of commits.

From the repository root, install backend dependencies and start the API:

```powershell
cd backend
dotnet restore
dotnet run --launch-profile http
```

The API runs at `http://localhost:5158`. Check `http://localhost:5158/api/health` for **MiniVault API Running**, or open `http://localhost:5158/scalar/v1` for API documentation.

Local uploads are created under `backend/wwwroot/uploads` and served by the API at `/uploads`. Database migrations create tables and seed data; copying database rows does not copy their image files.

### 4. Configure and Run the Frontend

The repository includes `frontend/.env` with the default local API address:

```dotenv
VITE_API_BASE_URL=http://localhost:5158
```

No additional frontend configuration is needed for the setup above. If your backend runs at a different address, update this value. This file contains public browser configuration only; keep database passwords and AI keys in backend configuration.

In a separate terminal, from the repository root, install frontend dependencies and start the development server:

```powershell
cd frontend
npm ci
npm run dev -- --host localhost --port 5173 --strictPort
```

Open `http://localhost:5173`. This origin matches the backend's local CORS policy. Restart the frontend after changing `.env`.

Use `npm run dev` for local development. Production builds use `frontend/.env.production`, which points to the hosted API; `npm run preview` serves that built version rather than switching it to the local API.

Register a local account to start using the application. The new database contains no user accounts or collectibles. Once AI keys are configured, use **Add collectible** to upload a JPG, JPEG, PNG, or WebP image smaller than 20 MB.

## Testing

### Frontend

From `frontend/`:

```powershell
npm run test:run
npm run lint
npm run build
```

Vitest and React Testing Library cover authentication helpers, login, category selection, collection rendering, and delete confirmation. The suite contains 32 cases across five files and mocks API requests. `npm test` runs tests in watch mode.

### Backend

From the repository root:

```powershell
dotnet test backend.Tests/backend.Tests.csproj
```

The 17 xUnit cases cover user registration/login, collection operations and ownership checks, achievement progress, and image serving from a fresh local checkout. User-service tests use SQLite in-memory; collection and achievement tests use EF InMemory. Image tests exercise static-file middleware and verify the Azure storage path.

To collect backend coverage:

```powershell
dotnet test backend.Tests/backend.Tests.csproj --collect:"XPlat Code Coverage"
```

## Deployment and CI/CD

The frontend is deployed to Azure Static Web Apps at `minivault.online`; the API is deployed to Azure App Service as `minivault-api`. The backend connects to PostgreSQL through its configured connection string.

| Workflow | Trigger | Behavior |
| --- | --- | --- |
| [Frontend](.github/workflows/azure-static-web-apps-polite-coast-0b83c1900.yml) | Push to `main` and PR events against `main` | Builds the frontend and deploys to Azure Static Web Apps; closes the preview deployment when a PR closes |
| [Backend](.github/workflows/main_minivault-api.yml) | Push to `main` or manual dispatch | Builds and publishes the API, then deploys to Azure App Service |

These workflows build and deploy; they do not run the test suites. Deployment authentication uses GitHub secrets defined in the workflow files.

For a separate deployment, configure the frontend API origin in `frontend/.env.production` and the backend's `ConnectionStrings__DefaultConnection`, `Jwt__SecretKey`, `OPENAI_API_KEY`, `GOOGLEAI_API_KEY`, and `REMOVE_BG_API_KEY` in the hosting environment. Use a private JWT signing key and allow the frontend origin in `backend/Program.cs`. Database migrations run when the API starts.
