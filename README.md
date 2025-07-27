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

### Environment variables

The following variables are used by the agents and backend services:

- `OPENAI_API_KEY` – API key for OpenAI requests.
- `GITHUB_TOKEN` – GitHub token with permission to create repositories.
- `VERCEL_TOKEN` – Token for the Vercel API.
- `VERCEL_TEAM` – *(optional)* team slug on Vercel.
- `SUPABASE_URL` – URL of your Supabase instance.
- `SUPABASE_SERVICE_ROLE_KEY` – service role key for Supabase.
- `ENVATO_TOKEN` – token for CodeCanyon scraping.
- `REDDIT_USER_AGENT` – user agent string for Reddit requests.
- `PORT` – port for the backend server (defaults to 4000).
- `FLIPPA_API_KEY` – API key for creating Flippa listings.
- `FLIPPA_API_URL` – *(optional)* override for the Flippa API base URL.
- `INTERNAL_MARKETPLACE_URL` – endpoint for your internal marketplace.
- `NEXT_PUBLIC_API_BASE_URL` – base URL of the backend for the frontend.

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
