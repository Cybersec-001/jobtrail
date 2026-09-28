# JobTrail

An owner-only job desk with a resume download next to each remote job. It does not apply to jobs or connect to LinkedIn.

## What works

- Sign in with GitHub. The server checks a specific numeric GitHub account ID, not a username or email, then gives that owner a short-lived HttpOnly session cookie. No GitHub access token is retained.
- Save and edit a private master profile in a separate PostgreSQL database. Profile information is never committed to this repository.
- Paste a job description or search remote developer listings from the Himalayas public API. A resume PDF can be downloaded next to each job. The engine reorders only existing profile claims by job relevance; it does not invent credentials or metrics.
- Open the original apply page, and manually mark a tracked job saved, applied, interview, offer, rejected, or withdrawn. Mark applied only after submitting on the employer's site.

## Run locally

Node 20+, PostgreSQL and a GitHub OAuth app are required. Create an OAuth app with the local callback `http://localhost:3000/auth/github/callback`. Copy `.env.example` to `.env` and set the real database URL, OAuth client credentials, numeric owner ID, and exact origin. Do not commit `.env` or a private resume.

```sh
npm ci
npm test
npm start
```

The server creates its four `jobtrail_*` tables on startup. The profile is initially empty. A signed-in owner reviews and saves it in the app. The server serves both UI and API from one origin; `/health` is public but exposes no user data. No fallback keys are used if configuration is missing.

## Data and limits

- Owner profile, tracked applications, session token hashes, and a daily job-feed cache live in PostgreSQL. PDF bytes are generated on request and returned with `Cache-Control: no-store`; the server does not save a copy.
- Sign out revokes the current session. Profile and tracker data can be corrected in the app; deletion is not implemented yet. Contact the operator to delete stored data until that is built. Hosted database backups and hosting logs may persist per provider policies.
- Listings are sourced from [Himalayas](https://himalayas.app) and linked back with visible attribution. Its feed can be delayed up to 24 hours and may rate-limit; verify job availability, location restrictions, work eligibility and application details on the original page. The server caches searches for 24 hours, with stale cache shown if the source fails.
- The job source is remote-focused and does not cover every India or LinkedIn job. No guarantee of matching, salary, recruiter legitimacy or application success.
- The resume PDF is a draft. Review it before sending. The original profile is self-reported and may include unverified details.
- A public deployment is designed as a single-owner beta, not an open registration product. There is no AI text generation, cover letter, autonomous applications, LinkedIn scraping or automatic form filling.

## Deployment notes

Use one HTTPS origin for the website and backend. `PUBLIC_ORIGIN` must match it exactly; all state-changing requests reject a missing or mismatched browser Origin. Configure the OAuth callback to `${PUBLIC_ORIGIN}/auth/github/callback`. Protect the database URL and OAuth client secret in the host's environment settings. A separate free database is preferable to sharing tables with another project. Test anonymous access, owner sign-in, profile persistence, PDF and tracker before using real data.
