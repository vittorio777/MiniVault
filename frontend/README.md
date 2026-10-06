# MiniVault Frontend

React 19 and TypeScript client built with Vite. See the [project README](../README.md) for the architecture, backend/database setup, AI configuration, and deployment details.

## Local Development

See [Getting Started](../README.md#getting-started) for PostgreSQL and backend setup. The frontend requires Node.js 22.13 or newer within the 22.x series, with npm.

With the backend running at `http://localhost:5158`, run the following from this directory in a separate PowerShell 7 terminal:

```powershell
Copy-Item .env.example .env
npm ci
npm run dev -- --host localhost --port 5173 --strictPort
```

Preserve an existing `.env` if already configured, and check that `VITE_API_BASE_URL=http://localhost:5158`. Open `http://localhost:5173` and register a local account. Local setup still needs fresh-clone verification.

## Configuration

`VITE_API_BASE_URL` is the backend origin, without a trailing `/api`. API helpers append their own endpoint paths, and image helpers resolve relative image URLs against this origin. Restart Vite after changing configuration.

- `.env.example`: local API origin; copy to the ignored `.env` for development.
- `.env.production`: hosted API origin used by production builds.

Frontend environment values are included in the browser bundle. Keep external service keys and JWT signing keys in backend configuration.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the build locally; backend CORS currently allows only port 5173 for local frontend requests |
| `npm run lint` | Run Oxlint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run the test suite once |

Vitest uses jsdom and React Testing Library. Existing tests cover authentication helpers, login, category selection, collection rendering, and delete confirmation. They mock API calls; browser end-to-end tests and frontend coverage tooling are not configured.

## Source Layout

- `src/pages/`: collection homepage and collectible detail page.
- `src/components/`: collection, user, viewer, upload, and achievement UI.
- `src/api/`: request handling and endpoint helpers.
- `src/types/` and `src/utils/`: shared types, image URL resolution, and achievement notifications.
- `src/test/`: shared test setup; test files live alongside the code they exercise.
