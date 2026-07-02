# SkillProof

SkillProof is a product prototype for helping junior developers prove real engineering ability before their first job. Instead of relying only on resumes or generic side projects, candidates complete GitHub-based challenges that look and feel like real product work: issues, branches, pull requests, acceptance criteria, checks, and review feedback.

The app is currently built as a polished Hebrew RTL landing/product prototype and demonstrates product thinking, frontend execution, and a strong understanding of how engineering hiring signals can be made more practical and verifiable.

## Live Demo

[skillproof-nine.vercel.app](https://skillproof-nine.vercel.app/)

## The Problem

Junior developers often struggle to show experience because many entry-level roles still ask for previous experience. Personal projects help, but they do not always prove how someone works inside a realistic engineering workflow.

SkillProof reframes the problem: let candidates solve structured, reviewable GitHub tasks that create visible proof of their skills.

## The Solution

SkillProof presents realistic software missions across frontend, backend, full-stack, data, DevOps, and cybersecurity. Each mission is designed like a real ticket:

- Clear business context
- Technical requirements
- Acceptance criteria
- Suggested repository and branch naming
- Pull request submission flow
- Review-oriented proof for employers

## Key Features

- RTL Hebrew product experience designed for Israeli junior developers
- Filterable mission catalog across multiple engineering disciplines
- Realistic GitHub workflow explanation: issue, branch, pull request, checks, review
- Employer-facing value proposition for structured junior hiring signals
- Polished responsive landing page built with modern React and Tailwind CSS
- Strong visual hierarchy, conversion-focused copy, and accessible UI structure

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite |
| Styling | Tailwind CSS |
| Language | JavaScript / JSX |
| Deployment | Vercel |
| Product workflow | GitHub issues, branches, pull requests, review concepts |

## What This Project Demonstrates

- Product thinking around a real hiring-market pain point
- Ability to translate an idea into a polished interactive prototype
- Frontend engineering with componentized React state and reusable data structures
- UX writing and information architecture for two audiences: candidates and employers
- Understanding of GitHub as a professional software workflow, not just a code host
- Ability to build and deploy a portfolio-ready web product

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Future Improvements

- Add authentication and real candidate profiles
- Store completed missions and submitted PR links
- Add employer dashboards for reviewing candidates
- Integrate GitHub API checks for real pull request status
- Add English localization alongside the Hebrew product experience

## Status

Portfolio-ready prototype. The current version focuses on product clarity, UI quality, and the GitHub-based proof-of-work concept.