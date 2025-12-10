from setuptools import setup, find_packages

setup(
    name="squadron-agents",
    version="0.1.0",
    description="The Operating System for Autonomous Software Teams",
    author="MikeeBuilds",
    packages=find_packages(),
    install_requires=[
        "jira",
        "slack_sdk",
        "python-dotenv",
        "rich",
        "requests",
    ],
    entry_points={
        "console_scripts": [
            "squadron=squadron.cli:main",
        ],
    },
    python_requires=">=3.10",
)
