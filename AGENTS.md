# AI Coding Guidelines

## 1. Technical Stack
* **Framework:** Next.js 15 (App Router) & React 19.
  * *Note:* `params` and `searchParams` in pages/layouts are Promises in Next.js 15. Await them before using.
* **Database:** PostgreSQL using `pg` (`lib/db/index.ts`).
* **Auth:** Built-in PostgreSQL accounts with `scrypt` password hashing and `jose` HTTP-only session cookies (`lib/session.ts`, `lib/auth.ts`, `app/api/auth/*`).
* **Styling:** Tailwind CSS v4.
* **Validation:** Zod + React Hook Form.

## 2. Environment
* `DATABASE_URL` (or `POSTGRES_URL`) and `AUTH_SECRET` are configured via `.env` (see `.env.example`).
* Optional integrations (`GROQ_API_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) should degrade gracefully when not set.

## 3. Code Quality
* Keep components small and single-purpose.
* Use Next.js Server Actions or API routes for data mutations.
* Wrap DB calls in `try/catch` blocks with `client.release()` in `finally`.
