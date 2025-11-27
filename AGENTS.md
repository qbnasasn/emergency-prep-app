# AI Coding Guidelines for Prepsafe.app

## 1. Core Workflow (Strict)
This project uses **Neon DB** with a **Manual Schema Workflow**.
* **The Rule:** You (the AI) **CANNOT** run migrations.
* **The Protocol:**
    1.  **Check DB Requirements:** Before writing React code, analyze if the request requires a database schema change (new table, new column, type change).
    2.  **Generate SQL First:** If a change is needed, output a code block labelled `SQL TO RUN IN NEON` containing the raw `CREATE` or `ALTER` statements.
    3.  **STOP and ASK:** After providing the SQL, ask the user: *"Please run this in the Neon Console and confirm when done."*
    4.  **Implement Code:** Only after the user confirms, write the React/Next.js code.

## 2. Technical Stack
* **Framework:** Next.js 15 (App Router) & React 19.
    * *Note:* `params` and `searchParams` in pages/layouts are Promises in Next.js 15. Await them before using.
* **Database:** Neon (PostgreSQL).
* **Database Driver:** `@neondatabase/serverless` (Preferred) or `pg`.
* **Styling:** Tailwind CSS v4.
* **Auth:** NextAuth.js v4.
* **Validation:** Zod + React Hook Form.

## 3. Critical Constraints
* **No Hallucinated Buttons:** Do not create UI elements (like "Submit Branch" buttons) in the chat or code.
* **Maintain Scope:** Only edit files relevant to the current request.
* **No Versioning:** Do not create new git branches or version folders unless explicitly asked.
* **Environment:** Assume `DATABASE_URL` is available in `.env`.

## 4. Code Quality
* **Atomic functions:** Keep components small.
* **Server Actions:** Use Next.js Server Actions for data mutation (form submissions).
* **Error Handling:** Wrap DB calls in try/catch blocks and return meaningful error messages.
