# 🤖 SupportAI — Intelligent Customer Support Chatbot

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square)

> A production-grade, NLP-powered customer support chatbot with a modern chat UI and an admin analytics dashboard — built entirely in Python and Flask.

---

## ✨ Features

| Category | Feature |
|---|---|
| 🧠 **AI / NLP** | TF-IDF + cosine similarity intent matching, keyword fallback, contextual conversation memory |
| 💬 **Chat UI** | Animated typing indicator, markdown rendering, auto-resize input, voice input (Web Speech API) |
| 🎨 **Design** | Dark/light mode, animated bot avatar, fully responsive, smooth transitions |
| 📊 **Analytics** | Admin dashboard with Chart.js: daily activity, intent distribution, KPI cards |
| 🗃️ **Database** | SQLite with WAL mode — conversations, sessions, and feedback tables |
| 🔒 **Security** | Input sanitization, rate limiting (flask-limiter), secure session handling |
| 📥 **Export** | Chat history export to `.txt` |
| 🎤 **Voice** | Voice-to-text via browser Web Speech API |
| ⭐ **Feedback** | Per-message 👍/👎 rating stored in DB |
| 🚀 **Deployment** | Gunicorn-ready, `.env` config, Render/Railway instructions |

---

## 📸 Screenshots

```
screenshots/
├── chat-dark.png      # Dark mode chat interface
├── chat-light.png     # Light mode chat interface
└── admin-dashboard.png # Analytics dashboard
```

> Run the app and take screenshots of your own session!

---

## 🏗️ Project Structure

```
AI-CHATBOT/
│
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── routes/
│   │   └── api.py               # All API & page routes
│   ├── services/
│   │   ├── nlp_engine.py        # TF-IDF intent matching engine
│   │   └── chatbot_data.py      # FAQ knowledge base (intents)
│   ├── models/
│   │   └── database.py          # SQLite ORM layer
│   ├── templates/
│   │   ├── index.html           # Chat interface
│   │   └── admin.html           # Analytics dashboard
│   ├── static/
│   │   ├── css/
│   │   │   ├── style.css        # Main styles + theme vars
│   │   │   └── admin.css        # Dashboard-specific styles
│   │   └── js/
│   │       ├── chat.js          # Chat UI logic
│   │       └── admin.js         # Dashboard charts + table
│   └── utils/
│       └── helpers.py           # Sanitization, logging, utils
│
├── database/                    # SQLite DB (auto-created)
├── logs/                        # App logs (auto-created)
├── screenshots/                 # Add your own screenshots
│
├── run.py                       # Entry point
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/AI-CHATBOT.git
cd AI-CHATBOT
```

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate        # Linux / macOS
venv\Scripts\activate           # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment
```bash
cp .env.example .env
# Edit .env — at minimum, set a strong SECRET_KEY
```

### 5. Run the development server
```bash
python run.py
```

Open **http://localhost:5000** for the chat interface.
Open **http://localhost:5000/admin** for the dashboard.

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Send a message, receive AI reply |
| `GET`  | `/history` | Fetch session conversation history |
| `POST` | `/feedback` | Submit 👍/👎 on a response |
| `GET`  | `/analytics` | Aggregated stats for dashboard |

### Example — `/chat`
```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are your pricing plans?"}'
```

Response:
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

---

## 🧠 How the NLP Works

1. **Training** — All FAQ patterns are vectorized at startup using TF-IDF (term frequency-inverse document frequency) with bigram support.
2. **Inference** — User input is preprocessed (lowercased, punctuation stripped) then transformed and compared to the training matrix via cosine similarity.
3. **Confidence scoring** — Similarity ≥ 0.55 → High, ≥ 0.30 → Medium, else → Low (triggers fallback).
4. **Context** — The last 5 turns per session are stored in memory for future multi-turn expansion.
5. **Extensibility** — Add new intents to `app/services/chatbot_data.py` and restart. No retraining pipeline needed.

---

## 🔧 Extending the Chatbot

Add new intents to `app/services/chatbot_data.py`:

```python
{
    "tag": "shipping",
    "patterns": [
        "how long does shipping take",
        "do you ship internationally",
        "shipping cost", "delivery time"
    ],
    "responses": [
        "We ship worldwide! Standard delivery takes 5-7 business days. Express (2-3 days) is available at checkout."
    ]
}
```

Restart the server — the NLP index rebuilds automatically on startup.

---

## 🚀 Deployment

### Render (Recommended — free tier)
1. Push your code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set Build Command: `pip install -r requirements.txt`
4. Set Start Command: `gunicorn -w 2 -b 0.0.0.0:$PORT "run:app"`
5. Add environment variable `SECRET_KEY` in the Render dashboard

### Railway
1. Connect your GitHub repo at [railway.app](https://railway.app)
2. Add environment variables from `.env.example`
3. Railway auto-detects Python and runs `gunicorn run:app`

### Manual VPS / Docker
```bash
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 60 "run:app"
```

---

## 🔮 Future Improvements

- [ ] GPT-4 / Claude API integration for open-domain responses
- [ ] Multi-language support (i18n)
- [ ] Live agent handoff via WebSockets
- [ ] OAuth2 authentication (Google, GitHub)
- [ ] Redis-backed sessions for horizontal scaling
- [ ] Prometheus metrics endpoint
- [ ] Docker + docker-compose setup
- [ ] Automated test suite (pytest)
- [ ] Webhook integrations (Slack, Teams)

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, Flask 3.0, Gunicorn
- **NLP**: scikit-learn (TF-IDF + cosine similarity)
- **Database**: SQLite (WAL mode)
- **Frontend**: Vanilla JS, CSS custom properties, Chart.js 4
- **Fonts**: Syne (display), DM Sans (body)
- **Icons**: Font Awesome 6

---

## 📄 License

MIT — free for personal and commercial use.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first.

```
1. Fork the project
2. Create your feature branch: git checkout -b feat/amazing-feature
3. Commit your changes: git commit -m 'Add amazing feature'
4. Push to the branch: git push origin feat/amazing-feature
5. Open a pull request
```

---

> Built with ❤️ as a portfolio-grade Python project. Star ⭐ it if you found it useful!
"# AI-Customer-Support-Chatbot" 
