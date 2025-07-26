# Agent‑AI‑App‑Factory

This repository houses the source code for **Agent‑AI‑App‑Factory**, an autonomous platform that researches, designs, builds, tests and deploys enterprise‑grade web applications.  The system follows a pipeline of agents—market research, specification, code generation, deployment, QA, and marketplace—to produce production‑ready software without manual intervention.

This monorepo is organised into two workspaces:

* `frontend` – A Next.js application that exposes a dashboard and user interface for controlling the factory.  It allows you to trigger research, view specifications, review generated code and manage deployments.
* `backend` – A Node/Express server that orchestrates the agents, providing REST endpoints to perform market research, generate technical specifications, create codebases, run tests and integrate with deployment targets.

Agents live in the top‑level `agents` folder so they can be imported by both the server and tooling scripts.

> **Note**: This project requires a valid OpenAI API key and access to Supabase/PostgreSQL for persistence.  See the respective `README` files inside `frontend` and `backend` for details on configuration and running the services locally.