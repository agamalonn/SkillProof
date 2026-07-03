# SkillProof

SkillProof is a full-stack prototype for a verified work-experience platform. Junior developers create an account, choose practical GitHub missions, submit pull request proof, and track submissions in a professional portfolio-style workspace.

## What is included

- English production-style React interface
- Real account creation and sign-in through a local API server
- HttpOnly cookie sessions
- Password hashing with Node crypto `scrypt`
- Persistent local JSON storage ignored by Git
- Mission catalog with practical GitHub-oriented tasks
- Pull request submission tracking
- Production build served by the Node API server

## Run locally

```bash
npm install
npm run dev:full
```

Open:

```text
http://127.0.0.1:5175/
```

The API runs on:

```text
http://127.0.0.1:8787/
```

## Production-style run

```bash
npm run build
npm start
```

`npm start` serves the built client from `dist` and exposes the API under `/api`.

For a deployed Node environment, set `HOST=0.0.0.0` and `PORT` to the platform-provided port.

## Data

Local accounts, sessions, and submissions are stored in:

```text
data/skillproof-db.json
```

The `data` directory is intentionally ignored by Git.

## Auth note

This project now has a working server-side account system. For a public internet deployment, connect the same UI to a managed auth provider such as Supabase, Auth0, Clerk, or Firebase, or deploy this API behind HTTPS with a durable database.
