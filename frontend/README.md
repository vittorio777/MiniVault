# MiniVault Frontend

React and TypeScript client built with Vite. See the [project README](../README.md) for database setup, backend configuration, architecture, and deployment.

## Development

Requires Node.js 22.13 or later in the 22.x series, with npm. Start the backend at `http://localhost:5158`, then create `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:5158
```

From this directory:

```powershell
npm ci
npm run dev -- --host localhost --port 5173 --strictPort
```

Open `http://localhost:5173`. Restart Vite after changing `.env`. The API address is the only required frontend environment variable; database credentials and AI keys belong in backend configuration.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the built frontend |
| `npm run lint` | Run Oxlint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once |

Production builds use the API origin in `.env.production`. For local API requests, use frontend port 5173 to match the backend CORS policy.
