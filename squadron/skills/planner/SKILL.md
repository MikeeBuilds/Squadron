# Planner Skill 🧠

The Planner skill allows you to generate a structured implementation plan from a Jira ticket.
This forces you to "think before you code".

## Usage

```bash
squadron plan --ticket "KAN-123"
```

## Output
This will generate a `PLAN.md` file in your root directory.
You should:
1.  Read the `PLAN.md` file.
2.  Fill in the "Proposed Changes" section with your specific file edits.
3.  Ask the user to review the plan.
4.  Once approved, execute the plan.
