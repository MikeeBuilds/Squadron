
"""
Browser Tool 🌐
Allows agents (Marcus) to browse the web and take screenshots.
Using Playwright.
"""
import logging
from playwright.sync_api import sync_playwright

logger = logging.getLogger('BrowserTool')

class BrowserTool:
    def browse(self, url: str) -> str:
        """
        Navigates to a URL and takes a screenshot.
        Returns the path to the screenshot.
        """
        logger.info(f"🌐 Browsing to: {url}")
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(url)
                
                # Take screenshot
                filename = f"screenshot_{url.replace('https://','').replace('/','_')}.png"
                path = f"/Users/algohussle/Documents/builds/money-bot/money-bot-discord/assets/{filename}"
                page.screenshot(path=path)
                
                browser.close()
                return {
                    "text": f"I visited {url} and saved a screenshot.",
                    "files": [path]
                }
        except Exception as e:
            logger.error(f"Browser error: {e}")
            return {"text": f"Failed to browse {url}: {e}", "files": []}

# Standalone function for the Brain to call
def browse_website(url: str):
    tool = BrowserTool()
    return tool.browse(url)
