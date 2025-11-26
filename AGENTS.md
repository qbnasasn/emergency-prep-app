# Agent Workflow Instructions

This document outlines the mandatory workflow for any agent working in this repository. Strict adherence to this process is required to ensure proper collaboration and code management.

The required workflow is as follows:

1.  **User Prompts Agent:** The user initiates a task by providing a prompt to the agent (Jules).
2.  **Agent Plans:** The agent analyzes the request, explores the codebase, and creates a detailed, step-by-step plan to address the prompt. The agent sets this plan using the `set_plan` tool.
3.  **User Approves Plan:** The user reviews the proposed plan. The agent must wait for explicit approval from the user before proceeding.
4.  **Agent Writes Code:** Once the plan is approved, the agent executes the plan and writes the necessary code to complete the task.
5.  **User Publishes Branch:** After the agent has completed all coding, testing, and verification steps, the agent will stop and wait. The user is responsible for the final action of publishing or merging the branch. The agent **must not** auto-publish or submit changes independently.
