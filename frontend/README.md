# MiniVault Frontend

React 19 and TypeScript client built with Vite. See the [project README](../README.md) for the architecture, backend/database setup, AI configuration, and deployment details.

## Local Development

Follow the [step-by-step setup guide](../README.md#getting-started) to install prerequisites, prepare PostgreSQL, and start the backend. The frontend needs Node.js 22.13 or newer within the 22.x series, with npm.

Once the backend health check at `http://localhost:5158/api/health` shows `MiniVault API Running`, open a second PowerShell 7 terminal in this directory:

```powershell
Copy-Item .env.example .env
npm ci
npm run dev -- --host localhost --port 5173 --strictPort
```

The copy step is for a fresh clone; preserve an existing `.env` with your own configuration. Check that it contains `VITE_API_BASE_URL=http://localhost:5158`. Keep the backend and frontend terminals open, then visit `http://localhost:5173` and create a local account. Local setup still needs fresh-clone verification.

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
