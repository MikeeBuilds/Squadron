from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="squadron-agents",
    version="0.5.0",
    author="MikeeBuilds",
    author_email="mludlow000@icloud.com",
    description="The Operating System for Autonomous Software Teams",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/MikeeBuilds/squadron",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Build Tools",
        "License :: OSI Approved :: GNU Affero General Public License v3",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    install_requires=[
        # Core
        "python-dotenv",
        "rich",
        "requests",
        "PyYAML",
        
        # LLM Providers
        "google-generativeai",
        
        # API Server
        "fastapi",
        "uvicorn[standard]",
        
        # Integrations
        "jira",
        "slack_sdk",
        "slack_bolt",
        "discord.py",
        "PyGithub",
        
        # Skills
        "paramiko",          # SSH
        "playwright",        # Browser automation
        
        # Memory (ChromaDB)
        "chromadb",
        "mcp"
    ],
    extras_require={
        "dev": [
            "pytest",
            "black",
            "flake8",
        ],
    },
    entry_points={
        "console_scripts": [
            "squadron=squadron.cli:main",
        ],
    },
    include_package_data=True,
    python_requires=">=3.10",
)
