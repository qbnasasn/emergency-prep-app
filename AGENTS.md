## Tech Stack
- Frontend: React (Vercel)
- Database: Neon DB (PostgreSQL)
- ORM/Access: [Insert your ORM here, e.g., Prisma, Drizzle, or raw SQL]

## Coding Standards
1. **Existing Patterns:** strict adherence to existing code style. Do not refactor unrelated code.
2. **Neon DB:** Assume connection strings are in `.env`. Do not hardcode credentials.
3. **React:** Use functional components and hooks.

## Interaction Rules
1. **Analysis First:** Before writing code, briefly list the files you intend to modify.
2. **Atomic Changes:** Only modify the specific logic requested.
3. **No Hallucinations:** If you do not see a definition for a function or variable in the context, ask the user to provide the relevant file. Do not guess imports.
