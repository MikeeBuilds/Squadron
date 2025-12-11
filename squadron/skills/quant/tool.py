import logging
import json
from pathlib import Path
from typing import Dict, Any, Optional
from services.rbi_service import get_rbi_service
from services.feed import DataFeed

logger = logging.getLogger('Squadron.QuantTool')

def research_strategy(topic_or_url: str) -> Dict[str, Any]:
    """
    Research a trading strategy from a YouTube URL, PDF, or text description.
    Uses the RBI (Research-Backtest-Implement) pipeline to analyze the idea.
    
    Args:
        topic_or_url: The YouTube video URL, PDF link, or text description of the strategy.
        
    Returns:
        Dict containing the research summary, strategy name, and file paths.
    """
    try:
        logger.info(f"🧠 Researching strategy: {topic_or_url[:50]}...")
        rbi = get_rbi_service()
        
        # Run RBI pipeline (Phase 1-4) without executing the backtest immediately
        # We let the agent decide when to run the backtest step
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(rbi.process_idea(topic_or_url, run_backtest=False))
        loop.close()
        
        if result['success']:
            # Read the research file to return a summary
            research_content = "No details found."
            if result.get('research_file') and result['research_file'].exists():
                research_content = result['research_file'].read_text()[:4000] # Truncate for prompt limits
                
            return {
                "text": f"# Strategy Research: {result['strategy_name']}\n\n{research_content}\n\nStrategy Code saved locally.",
                "files": [str(result['final_file'])] if result.get('final_file') else []
            }
        else:
            return {
                "text": f"Research failed: {result.get('error')}",
                "files": []
            }
            
    except Exception as e:
        logger.error(f"Research error: {e}")
        return {"text": f"Error researching strategy: {e}", "files": []}

def run_backtest(strategy_name: str, code_override: Optional[str] = None) -> Dict[str, Any]:
    """
    Run a backtest for a specific strategy.
    
    Args:
        strategy_name: The name of the strategy (from research step).
        code_override: Optional Python code to replace the existing strategy file before running.
        
    Returns:
        Dict containing backtest results (PnL, Win Rate, etc.).
    """
    try:
        rbi = get_rbi_service()
        final_file = rbi.final_dir / f"{strategy_name}_BTFinal.py"
        
        # Update code if provided (Agent modifying the strategy)
        if code_override:
            logger.info(f"✏️ Updating strategy code for {strategy_name}")
            final_file.write_text(code_override)
            
        if not final_file.exists():
            return {"text": f"Strategy file not found: {final_file}", "files": []}
            
        logger.info(f"▶️ Running backtest for {strategy_name}")
        
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(rbi.run_backtest(final_file))
        loop.close()
        
        if result['success']:
            output = result['stdout'][-2000:] # Last 2000 chars likely contain the stats
            return {
                "text": f"## Backtest Results: {strategy_name}\n```\n{output}\n```",
                "files": []
            }
        else:
            return {
                "text": f"Backtest failed:\nError: {result.get('error')}\nStderr: {result.get('stderr')}",
                "files": []
            }

    except Exception as e:
        logger.error(f"Backtest error: {e}")
        return {"text": f"Error running backtest: {e}", "files": []}

def find_strategy_videos(topic: str) -> Dict[str, Any]:
    """
    Search YouTube for trading strategy videos.
    Args:
        topic: Search query (e.g., "best 0DTE strategy", "options scalping").
    Returns:
        Dict with video list and summaries.
    """
    try:
        from youtubesearchpython import VideosSearch
        logger.info(f"🔎 Searching YouTube for: {topic}")
        
        search = VideosSearch(topic, limit=5)
        results = search.result()
        
        if not results.get('result'):
            return {"text": f"No videos found for '{topic}'.", "files": []}
            
        videos_text = "📺 **Top Strategy Videos Found:**\n\n"
        for video in results['result']:
            title = video.get('title')
            link = video.get('link')
            duration = video.get('duration')
            views = video.get('viewCount', {}).get('short', 'N/A')
            
            videos_text += f"• **[{title}]({link})** ({duration} • {views} views)\n"
            
        return {
            "text": videos_text + "\n\nReply with 'Research [URL]' to analyze one.",
            "files": []
        }
        
    except Exception as e:
        logger.error(f"Video search error: {e}")
        return {"text": f"Error searching videos: {e}", "files": []}

def get_market_data(ticker: str, limit: int = 100) -> Dict[str, Any]:
    """
    Fetch market data for a ticker using the production DataFeed (Alpaca).
    
    Args:
        ticker: The symbol (e.g., "SPY", "TSLA").
        limit: Number of candles to fetch (default: 100).
        
    Returns:
        Dict with text summary and latest price data.
    """
    try:
        # Map limit to period approximately
        period = "5d" if limit > 300 else "1d"
        
        df = DataFeed.fetch_candles(ticker, period=period)
        
        if df.empty:
            return {"text": f"No data found for {ticker}.", "files": []}
            
        # Get head and tail
        summary = df.tail(10).to_string()
        last_price = df['Close'].iloc[-1]
        
        return {
            "text": f"## Market Data: {ticker}\nLatest Price: ${last_price:.2f}\n\nRecent Candles:\n```\n{summary}\n```",
            "files": []
        }
        
    except Exception as e:
        logger.error(f"Data fetch error: {e}")
        return {"text": f"Error fetching market data: {e}", "files": []}
