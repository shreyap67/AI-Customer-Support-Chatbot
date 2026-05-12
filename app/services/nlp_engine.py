# ============================================================
# services/nlp_engine.py — Core NLP & Intent Matching Engine
# ============================================================
# Uses TF-IDF + cosine similarity for fast, offline intent
# matching without requiring heavy transformer downloads.
# Falls back gracefully if sklearn is unavailable.
# ============================================================

import os
import re
import random
import logging
import json
from typing import Optional

logger = logging.getLogger(__name__)

# ── Load intent data ──────────────────────────────────────────
try:
    from app.services.chatbot_data import INTENTS
except ImportError:
    from services.chatbot_data import INTENTS


class NLPEngine:
    """
    Lightweight semantic chatbot engine using TF-IDF + cosine similarity.

    Attributes
    ----------
    intents      : list of intent dicts (tag, patterns, responses)
    vectorizer   : fitted TfidfVectorizer
    tfidf_matrix : sparse matrix of all training patterns
    pattern_map  : list mapping matrix rows → intent tags
    """

    CONFIDENCE_HIGH   = 0.55
    CONFIDENCE_MEDIUM = 0.30
    FALLBACK_RESPONSES = [
        "I'm not sure I fully understood that. Could you rephrase or give more detail?",
        "Hmm, that's outside my current knowledge. Try asking about pricing, features, or account issues — or type 'contact' to reach a human agent.",
        "I want to help but I need a bit more context. Can you elaborate?",
        "That's a great question, but I'm not trained on that topic yet. Our team at support@supportai.com can help!",
    ]

    def __init__(self):
        self.intents = INTENTS
        self._conversation_context: dict[str, list] = {}  # session_id → recent turns
        self._build_index()

    # ── Index building ─────────────────────────────────────────

    def _build_index(self):
        """Fit a TF-IDF vectorizer over all training patterns."""
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity
            import numpy as np
            self._cosine_similarity = cosine_similarity
            self._np = np

            all_patterns = []
            self.pattern_map  = []   # row index → intent tag

            for intent in self.intents:
                for pattern in intent["patterns"]:
                    all_patterns.append(self._preprocess(pattern))
                    self.pattern_map.append(intent["tag"])

            self.vectorizer   = TfidfVectorizer(ngram_range=(1, 2), analyzer="word")
            self.tfidf_matrix = self.vectorizer.fit_transform(all_patterns)
            logger.info(f"NLP index built: {len(all_patterns)} patterns, {len(self.intents)} intents.")
            self._ready = True

        except ImportError:
            logger.warning("scikit-learn not found — falling back to keyword matching.")
            self._ready = False

    # ── Public API ─────────────────────────────────────────────

    def get_response(self, user_msg: str, session_id: str = "default") -> dict:
        """
        Main entry point. Returns a response dict:
            {
                "reply"      : str,
                "intent"     : str,
                "confidence" : float,
                "level"      : "high"|"medium"|"low"
            }
        """
        clean = self._preprocess(user_msg)

        # Store context
        self._update_context(session_id, user_msg)

        if self._ready:
            tag, confidence = self._tfidf_match(clean)
        else:
            tag, confidence = self._keyword_match(clean)

        if tag and confidence >= self.CONFIDENCE_MEDIUM:
            reply = self._pick_response(tag)
        else:
            reply = random.choice(self.FALLBACK_RESPONSES)
            tag, confidence = "unknown", 0.0

        level = self._confidence_level(confidence)
        logger.debug(f"[{session_id}] intent={tag} conf={confidence:.3f} level={level}")

        return {
            "reply":      reply,
            "intent":     tag,
            "confidence": round(confidence, 3),
            "level":      level,
        }

    # ── Matching strategies ────────────────────────────────────

    def _tfidf_match(self, clean_text: str) -> tuple[Optional[str], float]:
        """Cosine similarity against TF-IDF index."""
        vec = self.vectorizer.transform([clean_text])
        sims = self._cosine_similarity(vec, self.tfidf_matrix).flatten()
        best_idx = int(self._np.argmax(sims))
        best_score = float(sims[best_idx])
        tag = self.pattern_map[best_idx] if best_score >= self.CONFIDENCE_MEDIUM else None
        return tag, best_score

    def _keyword_match(self, clean_text: str) -> tuple[Optional[str], float]:
        """Simple keyword overlap fallback (no sklearn required)."""
        words = set(clean_text.split())
        best_tag, best_score = None, 0.0
        for intent in self.intents:
            for pattern in intent["patterns"]:
                p_words = set(self._preprocess(pattern).split())
                overlap = len(words & p_words)
                score = overlap / max(len(p_words), 1)
                if score > best_score:
                    best_score = score
                    best_tag = intent["tag"]
        return best_tag, best_score

    # ── Helpers ────────────────────────────────────────────────

    @staticmethod
    def _preprocess(text: str) -> str:
        """Lowercase, strip punctuation, collapse whitespace."""
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _pick_response(self, tag: str) -> str:
        """Return a random response for the matched intent tag."""
        for intent in self.intents:
            if intent["tag"] == tag:
                return random.choice(intent["responses"])
        return random.choice(self.FALLBACK_RESPONSES)

    def _confidence_level(self, score: float) -> str:
        if score >= self.CONFIDENCE_HIGH:
            return "high"
        elif score >= self.CONFIDENCE_MEDIUM:
            return "medium"
        return "low"

    def _update_context(self, session_id: str, msg: str):
        """Keep a rolling window of the last 5 user messages per session."""
        ctx = self._conversation_context.setdefault(session_id, [])
        ctx.append(msg)
        if len(ctx) > 5:
            ctx.pop(0)

    def get_context(self, session_id: str) -> list:
        return self._conversation_context.get(session_id, [])


# Singleton instance — imported by the route layer
nlp_engine = NLPEngine()
