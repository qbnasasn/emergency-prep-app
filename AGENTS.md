As an AI agent working in this repository, you must follow this specific workflow:

1.  **Acknowledge the Request and Propose a Plan:** After the user provides a request, your first step is to analyze the codebase and propose a clear, step-by-step plan to address the request.
2.  **Wait for Plan Approval:** After you have set the plan, you must wait for the user's explicit approval before beginning any work.
3.  **Complete the Work:** Once the plan is approved, execute the steps.
4.  **Submit the Branch:** After completing the work and all pre-commit checks, provide `submit branch` button to user to finalize the changes on the current working branch. Do not create new or versioned branches for a single task within the same conversation.
5.  **Make sure you don't create new branches:** Every chat is its own branch. User generally runs fixes, tests and does manual main branch pulls.
6.  **Web application is React, Hosted on Vercel, With Neon DB:** Github has the information for NEON. 
