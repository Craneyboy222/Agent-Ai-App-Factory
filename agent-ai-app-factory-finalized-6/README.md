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

## Installation

1. Install dependencies for all workspaces:

```bash
cd agent-ai-app-factory-finalized-6
npm install
```

2. Copy `.env.example` to `.env` in the repository root and fill in the required values.

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
