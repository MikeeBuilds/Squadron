
import os
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger('MemorySkill')

# Hardcoded for now, but could be config-driven
# We need to find money-bot-discord/.gemini regardless of where we run from
cwd = Path(os.getcwd())
if (cwd / "money-bot-discord").exists():
    SKILL_DIR = cwd / "money-bot-discord" / ".gemini" / "skills" / "trading-sentinel"
else:
    # Assume we are inside money-bot-discord
    SKILL_DIR = cwd / ".gemini" / "skills" / "trading-sentinel"

def _ensure_dir():
    if not SKILL_DIR.exists():
        pass 

# Initialize Hippocampus (Lazy load to avoid circular deps if any)
_hippo = None
def get_hippo():
    global _hippo
    if not _hippo:
        try:
            from squadron.memory.hippocampus import Hippocampus
            _hippo = Hippocampus()
        except Exception as e:
            logger.error(f"Failed to load Hippocampus: {e}")
    return _hippo

def log_trade(symbol: str, signal: str, reasoning: str, outcome: str = "PENDING", pnl: str = "TBD") -> str:
    """
    Log a trade to JOURNAL.md AND Vector Memory.
    """
    _ensure_dir()
    
    # 1. Write to Markdown (Human Readable)
    journal_path = SKILL_DIR / "JOURNAL.md"
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    clean_reason = reasoning.replace("\n", " ").replace("|", "-")
    entry_line = f"| {timestamp} | {symbol} | {signal} | {clean_reason} | {outcome} | {pnl} |"
    
    if not journal_path.exists():
        with open(journal_path, "w") as f:
            f.write("# 📓 Trade Journal\n> Active logs of Sentinel trading decisions.\n\n")
            f.write("| Date | Symbol | Signal | Reasoning | Outcome | P&L |\n")
            f.write("|------|--------|--------|-----------|---------|-----|\n")
            
    with open(journal_path, "a") as f:
        f.write(entry_line + "\n")
        
    # 2. Write to Hippocampus (AI Recall)
    hippo = get_hippo()
    if hippo:
        # We store the reasoning as the primary vector text
        # Metadata holds the structured data
        memory_text = f"Trade on {symbol} ({signal}): {reasoning}. Result: {outcome} ({pnl})"
        memory_id = f"trade_{symbol}_{datetime.now().timestamp()}"
        
        try:
            hippo.add_memory(
                collection_name="trade_journal",
                text=memory_text,
                metadata={"symbol": symbol, "outcome": outcome, "pnl": pnl},
                memory_id=memory_id
            )
            return f"✅ Logged trade for {symbol} to JOURNAL.md + Vector DB"
        except Exception as e:
            return f"✅ Logged trade for {symbol} to JOURNAL.md (Vector DB Error: {e})"
            
    else:
        return f"✅ Logged trade for {symbol} to JOURNAL.md (Vector DB Unavailable)"

def read_journal(lines: int = 10, query: str = None):
    """
    Read the journal. 
    Args:
        lines: Number of recent lines to read (Linear Mode).
        query: Optional semantic search query (Vector Mode).
    """
    # 1. Vector Search (if query provided)
    if query:
        hippo = get_hippo()
        if hippo:
            results = hippo.recall("trade_journal", query, n_results=5)
            # Format results
            docs = results.get('documents', [[]])[0]
            if docs:
                return f"🧠 Vector Recall for '{query}':\n" + "\n".join([f"- {d}" for d in docs])
            else:
                return "🧠 No relevant memories found."

    # 2. Linear Read (Fallback / Default)
    journal_path = SKILL_DIR / "JOURNAL.md"
    if not journal_path.exists():
        return "No journal entries found."
        
    try:
        with open(journal_path, "r") as f:
            all_lines = f.readlines()
            # Skip header (first 4 lines usually) if it's long, but simple tail is fine
            return "".join(all_lines[-lines:])
    except Exception as e:
        return f"Error reading journal: {e}"

def learn_lesson(lesson: str):
    """
    Add a learned lesson to LESSONS.md AND Vector Memory.
    """
    _ensure_dir()
    
    # 1. Write to Markdown
    lessons_path = SKILL_DIR / "LESSONS.md"
    
    if not lessons_path.exists():
        with open(lessons_path, "w") as f:
            f.write("# 🧠 Sentinel Lessons\n> Rulebook formed from experience.\n\n")
            
    timestamp = datetime.now().strftime("%Y-%m-%d")
    entry = f"- **[{timestamp}]** {lesson}"
    
    with open(lessons_path, "a") as f:
        f.write(entry + "\n")

    # 2. Write to Hippocampus
    hippo = get_hippo()
    if hippo:
        try:
            hippo.add_memory(
                collection_name="lessons",
                text=lesson,
                metadata={"source": "auditor_generated", "date": timestamp},
                memory_id=f"lesson_{datetime.now().timestamp()}"
            )
            return f"🧠 Learned new lesson: {lesson} (Saved to Vector DB)"
        except Exception as e:
            return f"🧠 Learned new lesson: {lesson} (Vector DB Error: {e})"

    return f"🧠 Learned new lesson: {lesson}"
