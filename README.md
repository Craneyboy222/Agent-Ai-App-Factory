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
