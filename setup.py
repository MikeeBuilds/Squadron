from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="squadron-agents",
    version="0.2.2",
    author="MikeeBuilds",
    author_email="your-email@example.com",
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
        "jira",
        "slack_sdk",
        "python-dotenv",
        "rich",
        "requests",
        "PyGithub",
        "PyYAML",
        "slack_bolt"
    ],
    entry_points={
        "console_scripts": [
            "squadron=squadron.cli:main",
        ],
    },
    python_requires=">=3.10",
)
