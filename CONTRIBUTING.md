# Contributing to Squadron

We welcome contributions to Squadron! Here's how you can get started.

## Setup Development Environment

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MikeeBuilds/squadron.git
    cd squadron
    ```

2.  **Create and activate a virtual environment (recommended):**
    ```bash
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

3.  **Install development dependencies:**
    ```bash
    pip install -e ".[dev]"
    ```
    This will install the project in editable mode and also install development tools like `pytest`, `black`, and `flake8`.

## Running Tests

To run the test suite, ensure your virtual environment is active and run:

```bash
pytest
```

## Linting and Formatting

Squadron uses `black` for code formatting and `flake8` for linting.

**Format your code:**
```bash
black .
```

**Run the linter:**
```bash
flake8 .
```

Please ensure your code passes linting and formatting checks before submitting a pull request.
