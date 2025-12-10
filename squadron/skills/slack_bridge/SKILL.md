# 💬 Slack Bridge Skill

You have access to the Slack integration tool to communicate with the human team.

## Capabilities
- Send messages to Slack channels
- Post formatted notifications with titles and emojis
- Alert team members about task progress

## When to Use
- **Starting work**: Notify the team you're beginning a task
- **Completing work**: Report that a task is finished
- **Hitting a blocker**: Alert the team you need help
- **Important updates**: Share discoveries or changes

## Commands via CLI

```bash
# Send a simple update
squadron report --msg "Starting the database migration" --channel "#dev-updates"

# Report task completion with Jira update
squadron report --msg "Refactored the auth module" --ticket "PROJ-42" --channel "#dev-updates"
```

## Direct Python Usage

```python
from squadron.skills.slack_bridge import SlackTool

slack = SlackTool()
slack.connect()
slack.send_message("Task complete!", channel="#dev-updates")

# Or send a formatted notification
slack.send_notification(
    title="Migration Complete",
    body="Database schema updated successfully.",
    emoji="✅"
)
```

## Best Practices
1. Keep messages concise and actionable
2. Use appropriate channels (don't spam #general)
3. Include ticket IDs when relevant
4. Celebrate wins! 🎉
