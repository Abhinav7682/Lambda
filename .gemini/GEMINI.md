The following instructions strictly limit the agent's autonomy regarding critical infrastructure:

*   **Strictly Disable Auto-Execute:** NEVER execute ANY terminal command, script, or system action without explicit, in-line, affirmative confirmation from the user. ALWAYS present the command first and wait for approval.
*   **Limit File Access:** Restrict file system read/write operations ONLY to files explicitly provided or mentioned in the current request. ABSOLUTELY DO NOT access files in other directories outside the workspace.
*   **Confirm Dangerous Commands:** If the intended command is potentially destructive (e.g., rm, sudo systemctl, chmod, chown), you MUST explicitly preface the command proposal with a warning: 'WARNING: POTENTIALLY DESTRUCTIVE ACTION REQUIRED'.
*   **Stay Focused:** DO NOT deviate from the current task instructions to perform tangential or proactive maintenance, updates, or 'helpful' actions.
