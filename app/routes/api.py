# ============================================================
# routes/api.py — All Flask API and Page Routes
# ============================================================

import logging
from flask import (
    Blueprint, request, jsonify, session,
    render_template, abort
)

from app.services.nlp_engine import nlp_engine
from app.models.database import (
    log_conversation, save_feedback,
    get_history, get_analytics
)
from app.utils.helpers import sanitize_input, generate_session_id

logger = logging.getLogger(__name__)
bp = Blueprint("api", __name__)


# ── Page routes ────────────────────────────────────────────────

@bp.route("/")
def index():
    """Serve the main chat interface."""
    if "session_id" not in session:
        session["session_id"] = generate_session_id()
    return render_template("index.html")


@bp.route("/admin")
def admin():
    """Serve the admin analytics dashboard."""
    return render_template("admin.html")


# ── API routes ─────────────────────────────────────────────────

@bp.route("/chat", methods=["POST"])
def chat():
    """
    POST /chat
    Body: { "message": "user text" }
    Returns: { "reply", "intent", "confidence", "level", "conv_id", "session_id" }
    """
    data = request.get_json(silent=True) or {}
    raw_msg = data.get("message", "").strip()

    if not raw_msg:
        return jsonify({"error": "Message cannot be empty."}), 400

    clean_msg = sanitize_input(raw_msg)
    sid = session.get("session_id") or generate_session_id()
    session["session_id"] = sid

    # NLP inference
    result = nlp_engine.get_response(clean_msg, session_id=sid)

    # Persist to DB
    conv_id = log_conversation(
        session_id=sid,
        user_msg=clean_msg,
        bot_reply=result["reply"],
        intent=result["intent"],
        confidence=result["confidence"],
    )

    return jsonify({
        "reply":      result["reply"],
        "intent":     result["intent"],
        "confidence": result["confidence"],
        "level":      result["level"],
        "conv_id":    conv_id,
        "session_id": sid,
    })


@bp.route("/history", methods=["GET"])
def history():
    """
    GET /history?limit=50
    Returns conversation history for the current session.
    """
    sid = session.get("session_id")
    if not sid:
        return jsonify({"history": []})

    limit = min(int(request.args.get("limit", 50)), 200)
    data = get_history(sid, limit=limit)
    return jsonify({"history": data, "session_id": sid})


@bp.route("/feedback", methods=["POST"])
def feedback():
    """
    POST /feedback
    Body: { "conv_id": int, "rating": "like"|"dislike", "comment": str }
    """
    data = request.get_json(silent=True) or {}
    conv_id = data.get("conv_id")
    rating  = data.get("rating", "").lower()
    comment = sanitize_input(data.get("comment", ""), max_length=300)

    if not conv_id or rating not in ("like", "dislike"):
        return jsonify({"error": "Invalid feedback payload."}), 400

    ok = save_feedback(conv_id, rating, comment)
    return jsonify({"success": ok})


@bp.route("/analytics", methods=["GET"])
def analytics():
    """
    GET /analytics
    Returns aggregated analytics for the admin dashboard.
    """
    try:
        data = get_analytics()
        return jsonify(data)
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        return jsonify({"error": "Could not load analytics."}), 500


# ── Error handlers ─────────────────────────────────────────────

@bp.app_errorhandler(404)
def not_found(_):
    return jsonify({"error": "Route not found."}), 404


@bp.app_errorhandler(429)
def rate_limited(_):
    return jsonify({"error": "Too many requests. Please slow down."}), 429


@bp.app_errorhandler(500)
def server_error(_):
    return jsonify({"error": "Internal server error."}), 500
