from setuptools import setup, find_packages

setup(
    name="squadron-agents",
    version="0.1.0",
    description="Your own AI software team. Installable via pip.",
    author="MikeeBuilds",
    packages=find_packages(),
    install_requires=[
        "jira",
        "slack_sdk",
        "python-dotenv",
        "rich",
        "requests"
    ],
    entry_points={
        'console_scripts': [
            'squadron=squadron.cli:main',
        ],
    },
)
