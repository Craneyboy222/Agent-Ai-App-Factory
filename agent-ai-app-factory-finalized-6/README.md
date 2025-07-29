# Agent‑AI‑App‑Factory

Agent‑AI‑App‑Factory is an autonomous system that researches, designs, builds, tests and deploys enterprise‑grade web applications. It coordinates a pipeline of agents—market research, specification, code generation, deployment, QA and marketplace—to generate production‑ready software with minimal manual effort.

This monorepo contains two workspaces:

- `frontend` – a Next.js dashboard for controlling the factory. Trigger research, view specifications, review generated code and manage deployments.
- `backend` – a Node/Express server that orchestrates the agents and exposes REST endpoints for research, specification, code generation, testing and deployment.

Agents live in the top‑level `agents` directory so they can be imported by both the server and tooling scripts.

## Requirements

- Node.js 18 or later
- npm
- An OpenAI API key and access to a Supabase/PostgreSQL database

Other environment variables are optional but recommended for deployment and marketplace integrations. See `.env.example` for the full list.
The `APIFY_API_TOKEN` variable allows the market research agent to query the Apify Flippa actor for current listings.
The `ZENSERP_API_KEY` variable enables the Google Trends scraper to call Zenserp for trending data.
The `OPENAI_API_KEY` variable must be set with your OpenAI API key for specification,
code generation and listing agents to operate. Do **not** commit this key to
source control; store it in your local `.env` file.

## Installation

1. Install dependencies for all workspaces:

```bash
cd agent-ai-app-factory-finalized-6
npm install
```

2. Copy `.env.example` to `.env` in the repository root and fill in the required values.
   The frontend expects `NEXT_PUBLIC_API_BASE_URL` to point at the running backend
   (default `http://localhost:4000`). When this variable is omitted in development
   the Next.js app rewrites `/api/*` requests to `http://localhost:4000` automatically.

## Running the backend

```bash
cd backend
npm run dev
```

The backend listens on port `4000` by default.

## Running the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on <http://localhost:3000> in development mode.

## Run both workspaces

From the monorepo root you can start backend and frontend together:

```bash
npm run dev
```

## License

This project is released under the [MIT](../LICENSE) license.

### Supabase setup

Create a stored procedure named `get_app_metrics` that aggregates analytics for
an app. A basic example:

```sql
create or replace function get_app_metrics(app_id uuid)
returns table(page_views bigint, users bigint) as $$
  select sum(page_views), count(distinct user_id)
  from analytics where app_id = get_app_metrics.app_id;
$$ language sql;
```

Modify the query to match your own `analytics` table structure.

## Building for production

```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build
```

After building you can start each service with `npm start`.

You're now ready to explore the Agent‑AI‑App‑Factory.
