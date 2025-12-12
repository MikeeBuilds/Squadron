
import pyautogui
import os
import datetime
import logging

logger = logging.getLogger('VisionTool')

def capture_screen() -> dict:
    """
    Captures the current screen and saves it to a temporary file.
    Returns: {"text": str, "files": [str]}
    """
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screen_{timestamp}.png"
    filepath = os.path.abspath(filename)
    
    try:
        screenshot = pyautogui.screenshot()
        screenshot.save(filepath)
        logger.info(f"📸 Screen captured: {filepath}")
        return {
            "text": f"Screen captured successfully. Resolution: {screenshot.size}",
            "files": [filepath]
        }
    except Exception as e:
        logger.error(f"Failed to capture screen: {e}")
        return {"text": f"Error capturing screen: {e}", "files": []}

def click_at(x: int, y: int) -> str:
    """
    Moves the mouse to (x, y) and performs a click.
    """
    try:
        pyautogui.click(x=x, y=y)
        return f"🖱️ Clicked at ({x}, {y})"
    except Exception as e:
        return f"Error clicking: {e}"

def type_text(text: str) -> str:
    """
    Types the given text on the keyboard.
    """
    try:
        pyautogui.write(text, interval=0.05)
        return f"⌨️ Typed: '{text}'"
    except Exception as e:
        return f"Error typing: {e}"

def get_screen_size() -> str:
    """
    Returns the screen resolution.
    """
    w, h = pyautogui.size()
    return f"Screen Size: {w}x{h}"
