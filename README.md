# Finance Dashboard

React + TypeScript + Vite dashboard comparing company stock performance over three windows: Today, Last 7 Days, and Last Quarter. Charts use Recharts; data fetching uses TanStack Query.

## Getting started

```bash
npm install
cp .env.example .env   # uses static mock data
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run lint` | Type-check and run Oxlint |
| `npm test` | Run the Vitest suite |
| `npm run build` | Type-check and build for production |

## Data source

`src/services/financeService.ts` is the only data entry point for the UI. It returns static mock data when `VITE_USE_MOCK=true` (always the case under tests) and otherwise calls Yahoo Finance via `yahoo-finance2`.

Note: `yahoo-finance2` targets Node. For live data in production, route requests through a backend proxy rather than calling it from the browser.
