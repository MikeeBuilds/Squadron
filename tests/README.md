# Squadron Test Suite

Comprehensive test suite for the Squadron agent framework.

## Quick Start

```bash
# Install dependencies and package
pip install -r requirements.txt
pip install -e .

# Run all tests
pytest

# Run with coverage
pytest --cov=squadron --cov-report=html

# Run only unit tests
pytest tests/unit/ -v

# Run only integration tests
pytest tests/integration/ -v
```

## Test Structure

```
tests/
├── conftest.py              # Shared fixtures
├── unit/                    # Fast, isolated tests
│   ├── test_brain.py        # Brain routing & tools
│   ├── test_hippocampus.py  # Memory store/recall
│   ├── test_model_factory.py# LLM providers
│   ├── test_delegator.py    # Task assignment
│   ├── test_tag_parser.py   # Agent mentions
│   └── test_skills.py       # Core skills
└── integration/             # End-to-end tests
    ├── test_cli_commands.py # CLI entry points
    └── test_wake_protocol.py# Wake flow
```

## Fixtures

All fixtures are defined in `conftest.py`:

| Fixture | Description |
|---------|-------------|
| `mock_env` | Test environment variables |
| `mock_llm` | Mocked LLM with predictable responses |
| `temp_memory` | Temporary Hippocampus instance |
| `mock_brain` | Brain with mocked dependencies |
| `mock_jira` | Mocked Jira client |
| `mock_github` | Mocked GitHub client |
| `cli_runner` | CLI subprocess runner |
| `temp_project_dir` | Temporary project directory |

## Writing Tests

```python
import pytest

@pytest.mark.unit
def test_example(mock_llm, temp_memory):
    """Example test using fixtures."""
    mock_llm.generate.return_value = '{"action": "reply", "content": "Hello"}'
    # ... test logic
```

## CI/CD

Tests run automatically on:
- Push to `main`
- All pull requests

See `.github/workflows/test.yml` for configuration.
