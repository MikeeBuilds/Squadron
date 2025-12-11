from typing import Optional
from rich.console import Console
from ...skills.jira_bridge.tool import JiraTool
import os

console = Console()

class PlannerTool:
    def __init__(self, agent_config=None):
        self.agent_config = agent_config
        self.jira = JiraTool()

    def create_plan(self, ticket_id: str, output_file: str = "PLAN.md"):
        """
        Fetches ticket details and generates a structured PLAN.md.
        """
        console.print(f"[bold blue]🧠 Planner:[/bold blue] Analyze ticket {ticket_id}...")

        # 1. Fetch Ticket Context
        if not self.jira or not self.jira.jira:
            console.print(f"[bold yellow]⚠️ Jira Credentials Missing[/bold yellow]: Creating generic template.")
            title = f"Task: {ticket_id}"
            description = "TODO: Paste ticket description here."
            status = "N/A"
        else:
            try:
                # We reuse the existing JiraTool logic if possible
                # But for now, let's just fetch the raw issue data
                issue = self.jira.jira.issue(ticket_id)
                title = issue.fields.summary
                description = issue.fields.description or "No description provided."
                status = issue.fields.status.name
            except Exception as e:
                console.print(f"[bold red]Error fetching ticket:[/bold red] {e}")
                return False

        # 2. Build the Template
        content = f"""# Implementation Plan - {ticket_id}

## Goal Description
**Ticket:** {title}
**Status:** {status}

{description}

## User Review Required
> [!IMPORTANT]
> Critical items requiring user attention before proceeding.
> [ ] Approve plan structure

## Proposed Changes
List the files you need to modify or create. Group by component.

### `squadron/`
#### [MODIFY] [filename](file path)
- Description of change

## Verification Plan
### Automated Tests
- [ ] `pytest ...`

### Manual Verification
- [ ] Step 1...
"""

        # 3. Write to File
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(content)

        console.print(f"[bold green]✅ Plan Created:[/bold green] {output_file}")
        console.print(f"Edit this file to define your implementation steps before coding.")
        return True
