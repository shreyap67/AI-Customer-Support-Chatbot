# ============================================================
# app/__init__.py — Flask Application Factory
# ============================================================

import os
import logging
from flask import Flask
from dotenv import load_dotenv

load_dotenv()


def create_app() -> Flask:
    """
    Application factory pattern — creates and configures
    the Flask app, registers blueprints, and initialises
    the database on first run.
    """
    app = Flask(__name__,
                template_folder="templates",
                static_folder="static")

    # ── Configuration ──────────────────────────────────────────
    app.secret_key = os.environ.get("SECRET_KEY", os.urandom(32))
    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        MAX_CONTENT_LENGTH=1 * 1024 * 1024,   # 1 MB max upload
    )

    # ── Logging ────────────────────────────────────────────────
    from app.utils.helpers import setup_logging
    setup_logging(os.environ.get("LOG_LEVEL", "INFO"))

    # ── Database ───────────────────────────────────────────────
    from app.models.database import init_db
    init_db()

    # ── Rate Limiting ──────────────────────────────────────────
    try:
        from flask_limiter import Limiter
        from flask_limiter.util import get_remote_address
        limiter = Limiter(
            key_func=get_remote_address,
            app=app,
            default_limits=[os.environ.get("RATE_LIMIT", "60 per minute")],
            storage_uri="memory://",
        )
        logging.getLogger(__name__).info("Rate limiting enabled.")
    except ImportError:
        logging.getLogger(__name__).warning("flask-limiter not installed — rate limiting disabled.")

    # ── Blueprints ─────────────────────────────────────────────
    from app.routes.api import bp
    app.register_blueprint(bp)

    logging.getLogger(__name__).info("Flask app created successfully.")
    return app
