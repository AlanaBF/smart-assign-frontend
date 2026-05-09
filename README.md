# Smart Assign - Frontend

React single-page application for searching and filtering candidates by skills, location, availability, clearance, and grade.

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript 5.9
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4.2
- **HTTP Client:** Axios
- **Linting:** ESLint 9

## Project Structure

```
smart-assign-frontend/
├── public/                     # Static assets (logos, icons)
├── src/
│   ├── components/
│   │   ├── ManualSearch.tsx     # Main search/filter table component
│   │   └── ErrorBoundary.tsx   # Catches runtime errors gracefully
│   ├── services/
│   │   └── api.ts              # Axios client and API calls
│   ├── types/
│   │   └── candidate.ts       # TypeScript interfaces
│   ├── App.tsx                 # Root component (data fetching, layout)
│   ├── main.tsx                # Entry point (renders App with ErrorBoundary)
│   ├── index.css               # Global styles and Tailwind import
│   └── App.css                 # App-level styles
├── index.html                  # HTML shell
├── vite.config.ts              # Vite config (proxy, plugins)
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies and scripts
├── .env.production             # Production API URL
└── azure-pipelines.yml         # CI/CD pipeline
```

## Prerequisites

- Node.js 20+
- npm

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

3. **API proxy:** In development, requests to `/api` are automatically proxied to `http://localhost:8000` (the backend). This is configured in `vite.config.ts`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Type-check with TypeScript, then bundle for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | File | Description |
|----------|------|-------------|
| `VITE_API_BASE_URL` | `.env.production` | Backend API base URL (used in production builds) |

In development, the Vite proxy handles API routing so no environment variable is needed.

## How It Works

1. On load, `App.tsx` calls `GET /api/all-candidates` via Axios
2. Candidate data is passed to `ManualSearch.tsx`
3. Users can filter candidates by: country, grade, clearance, availability, role, and skills
4. Filters are applied client-side using `useMemo` for performance
5. If a runtime error occurs, `ErrorBoundary` catches it and displays a reload button

## Deployment

The app is deployed to **Azure Static Web Apps** via Azure Pipelines.

**Pipeline trigger:** Push to `main` branch

**Pipeline steps:**
1. Install Node.js 20
2. Build the app (`npm run build` outputs to `dist/`)
3. Deploy `dist/` to Azure Static Web Apps

**Production URL:** `https://lemon-ground-01cb01d03.7.azurestaticapps.net`

## Important Notes

- There is no client-side routing — the app is a single view. If pages are added in future, install `react-router-dom`.
- There is no authentication on the frontend. The API is called without credentials.
- The production API URL is committed in `.env.production` (it contains no secrets — just the public Container App URL).
