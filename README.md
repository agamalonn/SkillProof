# SkillProof

SkillProof is a full-stack platform prototype for helping junior developers prove real engineering ability before their first job. Candidates create an account, choose practical GitHub missions, submit pull request proof, and track submissions in a professional portfolio-style workspace.

The product reframes entry-level hiring around visible work: issues, branches, pull requests, acceptance criteria, checks, review notes, and durable proof that employers can inspect.

## Current Status

SkillProof has moved beyond a landing-page prototype. The current version includes an English production-style workspace, working server-side accounts, sessions, profile editing, a mission catalog, and pull request submission tracking.

## What Is Included

- English production-style React interface
- Real account creation and sign-in through a local API server
- HttpOnly cookie sessions
- Password hashing with Node crypto `scrypt`
- Persistent local JSON storage ignored by Git
- Mission catalog across frontend, backend, full-stack, data, DevOps, and security
- GitHub-oriented mission details: issue, repository, branch, deliverables, and acceptance criteria
- Pull request submission tracking per user account
- Production build served by the Node API server

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite |
| Styling | Tailwind CSS |
| API | Node.js HTTP server |
| Auth | HttpOnly cookie sessions, scrypt password hashing |
| Local persistence | JSON file storage |
| Product workflow | GitHub issues, branches, pull requests, review concepts |

## Run Locally

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

## Production-Style Run

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

## Deployment Note

This project now has a working server-side account system. For public internet use, the next production step is to connect the UI to a durable database and a managed auth provider such as Supabase, Auth0, Clerk, or Firebase, or deploy this API behind HTTPS with persistent storage.

## Future Improvements

- Replace local JSON persistence with PostgreSQL or Supabase
- Integrate GitHub OAuth and GitHub API checks for real pull request status
- Add employer dashboards for reviewing candidates
- Add reviewer scoring rubrics and candidate badges
- Add email verification, password reset, and audit logs
