# ============================================================
# run.py — Application Entry Point
# ============================================================
# Run locally:  python run.py
# Production:   gunicorn -w 4 -b 0.0.0.0:5000 "run:app"
# ============================================================

import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port  = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "True").lower() == "true"
    print(f"\n🤖 SupportAI Chatbot running at http://localhost:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
