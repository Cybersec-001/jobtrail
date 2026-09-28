# JobTrail (Phase 1)

Resume Studio is a small, review-before-apply job-hunt prototype. Given a user-supplied structured master profile and a pasted job description, it ranks **only existing claims** by relevance and generates a PDF. It does not fabricate experience, invent metrics, log in to LinkedIn, scrape jobs, or auto-apply. No account, database, user profile storage, or AI key is required in Phase 1.

## Run

Node 20+:

```sh
npm ci
npm test
npm start
```

Open `http://localhost:3000`. `/health` reports the phase. `POST /api/resume` accepts `{ "profile": { ... }, "job": {"title":"...", "description":"..."} }` and returns a PDF. Validation errors return 400. Input is transmitted to the chosen server for PDF generation but not persisted there; use only a server you trust. In production, configure `CORS_ORIGIN` to the exact frontend origin and serve over HTTPS. The included app serves its own frontend from the backend for a simple deployment; a separate GitHub Pages origin can be configured later.

The schema is documented by `src/engine.js` and the fictional editable example in `public/index.html`. `profile` supports name, email, headline, phone, location, links, summary, skills, experience (title, organization, dates, bullets), projects (name, URL, bullets), education, certifications. Only the user can confirm whether any claim is true. This engine reorders claims, never rewrites them.

## Roadmap, not shipped

- Secure profile import with explicit review and opt-in storage. Do not accept LinkedIn passwords. LinkedIn profile linking needs an approved OAuth integration, not a scraper.
- Finder from permitted board APIs / public feeds, respecting source terms and freshness. No job finder is active now.
- Application tracker with manual entry, status, and reminders. No background auto-apply is active. No job-site account automation.
- Optional AI editing: suggestions only, each grounded in master-profile evidence and individually reviewable. No Groq call in Phase 1; do not reuse a secret from another project by committing it here.

## Safety

Example candidate is fictional. Replace before use. PDFs and private profile JSON are excluded from Git. This prototype has no authentication: **do not host the endpoint publicly with real personal data yet**. It is a local scaffold, not a production service. A deployed version needs auth, abuse controls, privacy/retention policy and origin restrictions before real resumes are sent.
