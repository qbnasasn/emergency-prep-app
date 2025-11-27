# AI Coding Guidelines for Prepsafe.app

## 1. Core Workflow (Strict)
This project uses **Neon DB** with a **Manual Schema Workflow**.
* **The Rule:** You (the AI) **CANNOT** run migrations.
* **The Protocol:**
    1.  **Check DB Requirements:** Before writing React code, analyze if the request requires a database schema change (new table, new column, type change).
    2.  **Generate SQL First:** If a change is needed, output a code block labelled `SQL TO RUN IN NEON` containing the raw `CREATE` or `ALTER` statements.
    3.  **STOP and ASK:** After providing the SQL, ask the user: *"Please run this in the Neon Console and confirm when done."*
    4.  **Implement Code:** Only after the user confirms, write the React/Next.js code.

## 2. Technical Stack & Style
* **Frontend:** React, Next.js (App Router), Tailwind CSS.
* **Database:** Neon (PostgreSQL).
* **Database Driver:** [CHECK YOUR PACKAGE.JSON AND PUT DRIVER HERE, e.g. 'pg' or '@vercel/postgres']
* **Hosting:** Vercel.

## 3. Critical Constraints
* **No Hallucinated Buttons:** Do not create UI elements (like "Submit Branch" buttons) in the chat or code.
* **Maintain Scope:** Only edit files relevant to the current request.
* **No Versioning:** Do not create new git branches or version folders (e.g., `v2/`) unless explicitly asked.
* **Environment:** Assume `DATABASE_URL` is available in `.env`. Do not hardcode credentials.

## 4. Code Quality
* **Atomic functions:** Keep components small.
* **Error Handling:** Wrap DB calls in try/catch blocks and return meaningful error messages.
