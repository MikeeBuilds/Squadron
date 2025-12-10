"""
Knowledge Reader
Simple "RAG-Lite" system to read markdown files in the knowledge directory.
"""

import os
import glob
from pathlib import Path


class KnowledgeBase:
    def __init__(self):
        # Find the directory where this file lives
        self.knowledge_dir = os.path.dirname(os.path.abspath(__file__))

    def list_documents(self):
        """List all markdown files in the knowledge base."""
        files = glob.glob(os.path.join(self.knowledge_dir, "*.md"))
        return [os.path.basename(f) for f in files]

    def read_all(self):
        """Read all markdown files and return content."""
        content = {}
        for filename in self.list_documents():
            path = os.path.join(self.knowledge_dir, filename)
            with open(path, "r", encoding="utf-8") as f:
                content[filename] = f.read()
        return content

    def search(self, query):
        """
        Simple keyword search across documents.
        Returns snippets containing the query.
        """
        results = []
        docs = self.read_all()
        
        query = query.lower()
        
        for filename, text in docs.items():
            if query in text.lower():
                # Find the line
                lines = text.split("\n")
                for i, line in enumerate(lines):
                    if query in line.lower():
                        # Grab context (1 line before, 1 after)
                        start = max(0, i - 1)
                        end = min(len(lines), i + 2)
                        snippet = "\n".join(lines[start:end])
                        
                        results.append({
                            "source": filename,
                            "line": i + 1,
                            "snippet": snippet
                        })
        
        return results

    def get_full_context(self):
        """Returns all knowledge files concatenated for an LLM context window."""
        docs = self.read_all()
        full_text = ""
        for filename, text in docs.items():
            full_text += f"\n--- FILE: {filename} ---\n{text}\n"
        return full_text
