# ============================================================
# utils/helpers.py — Shared Utility Functions
# ============================================================

import re
import uuid
import html
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def sanitize_input(text: str, max_length: int = 500) -> str:
    """
    Sanitize user input:
    - Strip HTML/script tags
    - Escape special HTML characters
    - Truncate to max_length
    - Collapse excessive whitespace
    """
    if not isinstance(text, str):
        return ""
    text = html.escape(text)                        # escape <, >, &, etc.
    text = re.sub(r"<[^>]+>", "", text)             # strip any remaining tags
    text = re.sub(r"[^\w\s.,!?'\"\-@#():/]", "", text)  # allowlist chars
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_length]


def generate_session_id() -> str:
    """Generate a unique session identifier."""
    return str(uuid.uuid4())


def format_timestamp(ts: str = None) -> str:
    """Format a datetime string for display, defaulting to now."""
    try:
        dt = datetime.fromisoformat(ts) if ts else datetime.now()
        return dt.strftime("%b %d, %Y %I:%M %p")
    except Exception:
        return datetime.now().strftime("%b %d, %Y %I:%M %p")


def setup_logging(level: str = "INFO"):
    """Configure application-wide logging to file + console."""
    import os
    os.makedirs("logs", exist_ok=True)

    log_level = getattr(logging, level.upper(), logging.INFO)
    fmt = "%(asctime)s [%(levelname)s] %(name)s — %(message)s"

    logging.basicConfig(
        level=log_level,
        format=fmt,
        handlers=[
            logging.FileHandler("logs/app.log"),
            logging.StreamHandler(),
        ]
    )
    logging.getLogger("werkzeug").setLevel(logging.WARNING)
    logger.info("Logging initialized.")
