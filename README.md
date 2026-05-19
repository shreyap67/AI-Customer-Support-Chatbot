# 🤖 SupportAI — Intelligent Customer Support Chatbot

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white" alt="scikit-learn">
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-22c55e?style=flat-square" alt="Status">
</p>

<p align="center">
  A production-grade, NLP-powered customer support chatbot with a polished chat UI and an admin analytics dashboard — built entirely with Python and Flask, no external AI APIs required.
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [How the NLP Works](#-how-the-nlp-works)
- [Extending the Chatbot](#-extending-the-chatbot)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

SupportAI is a fully self-contained customer support chatbot that uses **TF-IDF vectorization and cosine similarity** to match user queries to a curated intent knowledge base — no cloud AI APIs, no recurring costs, no internet dependency at inference time.

It ships with a real-time chat interface, per-message feedback (👍/👎), conversation history, and an admin analytics dashboard backed by SQLite. The entire stack runs on a single `python run.py` command.

---

## ✨ Features

| Area | Details |
|------|---------|
| 🧠 **NLP Engine** | TF-IDF + cosine similarity intent matching with bigram support; keyword-overlap fallback when scikit-learn is unavailable |
| 📊 **Confidence Scoring** | Three-tier scoring (High ≥ 0.55 / Medium ≥ 0.30 / Low) with graceful fallback responses |
| 💬 **Chat Interface** | Animated typing indicator, markdown rendering, auto-resizing input, chat history export to `.txt` |
| 🎤 **Voice Input** | Browser-native voice-to-text via the Web Speech API |
| 🎨 **Theming** | Dark/light mode toggle, animated bot avatar, fully responsive layout |
| 📈 **Admin Dashboard** | Chart.js-powered analytics: daily activity trends, intent distribution, KPI cards |
| 🗃️ **Database** | SQLite with WAL mode — `conversations`, `sessions`, and `feedback` tables auto-created on first run |
| ⭐ **Feedback System** | Per-message thumbs up/down ratings persisted to the database |
| 🔒 **Security** | Input sanitization, rate limiting via `flask-limiter`, `HttpOnly` + `SameSite` session cookies |
| 🚀 **Deployment-Ready** | Gunicorn-compatible, `.env`-configured, with one-click deploy guides for Render and Railway |

---

## 📸 Screenshots

| Chat — Dark Mode | Chat — Light Mode | Admin Dashboard |
|:-:|:-:|:-:|
| `screenshots/chat-dark.png` | `screenshots/chat-light.png` | `screenshots/admin-dashboard.png` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | Python 3.10+ |
| **Web Framework** | Flask 3.0 + Gunicorn |
| **NLP** | scikit-learn (TF-IDF, cosine similarity) |
| **Database** | SQLite (WAL mode via `sqlite3`) |
| **Frontend** | Vanilla JS, CSS custom properties |
| **Charts** | Chart.js 4 |
| **Fonts / Icons** | Syne, DM Sans, Font Awesome 6 |
| **Security** | flask-limiter, flask-cors, Werkzeug |

---

## 📁 Project Structure

```
AI-Customer-Support-Chatbot/
│
├── app/
│   ├── __init__.py              # Flask application factory
│   ├── routes/
│   │   └── api.py               # All API endpoints and page routes
│   ├── services/
│   │   ├── nlp_engine.py        # TF-IDF intent matching engine (singleton)
│   │   └── chatbot_data.py      # Intent knowledge base (patterns + responses)
│   ├── models/
│   │   └── database.py          # SQLite ORM layer
│   ├── templates/
│   │   ├── index.html           # Chat interface
│   │   └── admin.html           # Analytics dashboard
│   ├── static/
│   │   ├── css/
│   │   │   ├── style.css        # Main styles + CSS theme variables
│   │   │   └── admin.css        # Dashboard-specific styles
│   │   └── js/
│   │       ├── chat.js          # Chat UI logic
│   │       └── admin.js         # Dashboard charts and data tables
│   └── utils/
│       └── helpers.py           # Sanitization, logging utilities
│
├── database/                    # SQLite DB file (auto-created on first run)
├── logs/                        # Application logs (auto-created)
├── screenshots/                 # Add UI screenshots here
│
├── run.py                       # Application entry point
├── requirements.txt
├── .env.example                 # Environment variable template
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- Python 3.10 or higher
- `pip`

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/AI-Customer-Support-Chatbot.git
cd AI-Customer-Support-Chatbot
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set at minimum a strong `SECRET_KEY`:

```env
SECRET_KEY=your-strong-random-secret-key
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_PATH=database/chatbot.db
LOG_LEVEL=INFO
RATE_LIMIT=30 per minute
```

### 5. Run the development server

```bash
python run.py
```

| URL | Description |
|-----|-------------|
| `http://localhost:5000` | Chat interface |
| `http://localhost:5000/admin` | Analytics dashboard |

---

## ⚙️ Configuration

All configuration is handled via environment variables, loaded from `.env` using `python-dotenv`.

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `os.urandom(32)` | Flask session signing key — **must be set in production** |
| `FLASK_ENV` | `development` | Flask environment (`development` / `production`) |
| `FLASK_DEBUG` | `True` | Enable debug mode (disable in production) |
| `DATABASE_PATH` | `database/chatbot.db` | Path to the SQLite database file |
| `LOG_LEVEL` | `INFO` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `RATE_LIMIT` | `30 per minute` | `flask-limiter` rate limit string |

---

## 🌐 API Reference

### `POST /chat`

Send a user message and receive an AI-generated reply.

**Request body:**
```json
{ "message": "What are your pricing plans?" }
```

**Response:**
```json
{
  "reply": "We offer three plans:\n\n• Starter — Free...",
  "intent": "pricing",
  "confidence": 0.812,
  "level": "high",
  "conv_id": 42,
  "session_id": "a1b2c3d4-..."
}
```

**`level` values:** `"high"` (≥ 0.55) · `"medium"` (≥ 0.30) · `"low"` (fallback)

---

### `GET /history`

Fetch the conversation history for the current session.

| Query param | Default | Max |
|-------------|---------|-----|
| `limit` | `50` | `200` |

**Response:** `{ "history": [...], "session_id": "..." }`

---

### `POST /feedback`

Submit a thumbs up or down rating for a conversation turn.

**Request body:**
```json
{
  "conv_id": 42,
  "rating": "like",
  "comment": "Very helpful!"
}
```

`rating` must be `"like"` or `"dislike"`. `comment` is optional (max 300 chars).

---

### `GET /analytics`

Returns aggregated data for the admin dashboard: daily activity, intent distribution, and KPI totals.

---

### Error responses

| Code | Meaning |
|------|---------|
| `400` | Invalid or missing request payload |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## 🧠 How the NLP Works

The NLP engine lives in `app/services/nlp_engine.py` and operates as a lazy singleton loaded once at startup.

**1. Index building**
All patterns from the intent knowledge base (`chatbot_data.py`) are preprocessed (lowercased, punctuation stripped) and fed into a `TfidfVectorizer` with `ngram_range=(1, 2)` (unigrams + bigrams). The resulting sparse matrix is stored in memory.

**2. Inference**
On each request, the user's message is preprocessed identically and transformed by the fitted vectorizer. Cosine similarity is computed against the full training matrix, and the intent with the highest score is selected.

**3. Confidence tiers**

| Score | Tier | Behaviour |
|-------|------|-----------|
| ≥ 0.55 | High | Uses the matched intent's response |
| ≥ 0.30 | Medium | Uses the matched intent's response |
| < 0.30 | Low | Returns a randomised fallback response |

**4. Fallback**
If `scikit-learn` is not installed, the engine falls back to a keyword-overlap matching strategy that requires no dependencies.

**5. Context**
The last 5 user messages per session are stored in memory, ready for future multi-turn reasoning.

---

## 🔧 Extending the Chatbot

Add new intents to `app/services/chatbot_data.py` following this structure:

```python
{
    "tag": "shipping",
    "patterns": [
        "how long does shipping take",
        "do you ship internationally",
        "shipping cost",
        "estimated delivery time"
    ],
    "responses": [
        "We ship worldwide! Standard delivery takes 5–7 business days. Express (2–3 days) is available at checkout.",
        "Shipping is free on orders over $50. International delivery typically takes 7–14 business days."
    ]
}
```

Restart the server — the NLP index rebuilds automatically on startup. No separate training step required.

---

## 🚀 Deployment

### Render *(recommended — free tier available)*

1. Push your repository to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Set **Build Command:** `pip install -r requirements.txt`
4. Set **Start Command:** `gunicorn -w 2 -b 0.0.0.0:$PORT "run:app"`
5. Add `SECRET_KEY` as an environment variable in the Render dashboard.
6. Set `FLASK_ENV=production` and `FLASK_DEBUG=False`.

### Railway

1. Connect your GitHub repository at [railway.app](https://railway.app).
2. Add all variables from `.env.example` in the Railway environment settings.
3. Railway auto-detects Python and runs Gunicorn.

### VPS / bare metal

```bash
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 60 "run:app"
```

> ⚠️ **Production checklist**
> - Set `SECRET_KEY` to a long random string
> - Set `FLASK_DEBUG=False`
> - Place the app behind a reverse proxy (Nginx/Caddy) for HTTPS
> - Consider a persistent volume for the `database/` directory

---

## 🗺️ Roadmap

- [ ] GPT-4o / Claude API integration for open-domain fallback responses
- [ ] Multi-language support (i18n)
- [ ] Live agent handoff via WebSockets
- [ ] OAuth2 authentication (Google, GitHub)
- [ ] Redis-backed sessions for horizontal scaling
- [ ] Docker + `docker-compose` setup
- [ ] Automated test suite (pytest + coverage)
- [ ] Prometheus metrics endpoint
- [ ] Webhook integrations (Slack, Microsoft Teams)

---

## 🤝 Contributing

Contributions are welcome! For significant changes, please open an issue first to discuss what you'd like to change.

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature description"

# 4. Push and open a pull request
git push origin feat/your-feature-name
```

Please follow the existing code style and add/update docstrings where relevant.

---

## 📄 License

Distributed under the **MIT License** — free for personal and commercial use. See [`LICENSE`](LICENSE) for details.

---

<p align="center">Built with ❤️ as a portfolio-grade Python project. If you found it useful, please give it a ⭐</p>
