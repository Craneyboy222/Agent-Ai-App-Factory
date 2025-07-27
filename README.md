# Agent-Ai-App-Factory
Next-generation AI App Factory generating and deploying enterprise-level web applications.

## Setup

This monorepo contains two workspaces located under `agent-ai-app-factory-finalized-6`:

- `backend` – Node/Express service exposing the API used by the agents
- `frontend` – Next.js dashboard for interacting with the factory

### Install dependencies

```bash
cd agent-ai-app-factory-finalized-6
npm install
```

Copy `.env.example` to `.env` in the repository root and fill in the required keys.

Key variables include:

- `FLIPPA_API_KEY` – the personal API token used to create listings on Flippa. Generate this key from your Flippa account and place it in the `.env` file.
- `FLIPPA_API_URL` – the base URL of the Flippa listing API. The default `https://api.flippa.com/v3/listings` works for production but can be adjusted if Flippa provides an alternative endpoint.
- `APIFY_API_TOKEN` – token for the Apify Flippa actor used by the market research agent to fetch listings.
- `ZENSERP_API_KEY` – API key for the Zenserp Trends endpoint used to fetch trending search topics.
- `INTERNAL_MARKETPLACE_URL` – the root address of your internal marketplace where generated apps are published. Set it to your own marketplace’s URL in the `.env` file.
- `NEXT_PUBLIC_API_BASE_URL` – base URL used by the frontend to reach the backend API. Defaults to `http://localhost:4000` for local development.

### Running the backend

```bash
cd backend
npm run dev
```

The server listens on port `4000` by default.

### Running the frontend

```bash
cd frontend
npm run dev
```

The Next.js app runs on port `3000` in development mode.

### Run both workspaces together

From the repository root you can launch the backend and frontend concurrently:

```bash
npm run dev
```

This uses `npm-run-all` under the hood to stream output from both services.

### Supabase setup

The feedback agent expects a stored procedure called `get_app_metrics` in your
Supabase project. A simple example that returns aggregated metrics might look
like:

```sql
create or replace function get_app_metrics(app_id uuid)
returns table(page_views bigint, users bigint) as $$
  select sum(page_views), count(distinct user_id)
  from analytics where app_id = get_app_metrics.app_id;
$$ language sql;
```

Ensure your database has an `analytics` table with `app_id`, `user_id` and
`page_views` columns or adjust the query accordingly.

### License

Released under the [MIT](LICENSE) license.
