# ============================================================
# chatbot_data.py — FAQ Knowledge Base & Intent Training Data
# ============================================================
# This file defines the chatbot's knowledge: intents, training
# phrases, and responses used for semantic intent matching.
# Add new intents here to extend the chatbot's capabilities.
# ============================================================

INTENTS = [
    {
        "tag": "greeting",
        "patterns": [
            "hello", "hi", "hey", "good morning", "good afternoon",
            "good evening", "howdy", "what's up", "greetings", "hi there",
            "hello there", "hey there", "sup", "yo"
        ],
        "responses": [
            "Hello! 👋 Welcome to SupportAI. How can I assist you today?",
            "Hi there! I'm your AI support assistant. What can I help you with?",
            "Hey! Great to see you. What brings you here today?",
            "Greetings! I'm here and ready to help. What do you need?"
        ]
    },
    {
        "tag": "goodbye",
        "patterns": [
            "bye", "goodbye", "see you", "see ya", "later", "take care",
            "farewell", "quit", "exit", "done", "thanks bye", "that's all"
        ],
        "responses": [
            "Goodbye! Have a wonderful day! 😊",
            "Take care! Feel free to return anytime.",
            "Bye! It was great helping you today.",
            "See you later! Don't hesitate to come back if you need anything."
        ]
    },
    {
        "tag": "thanks",
        "patterns": [
            "thanks", "thank you", "thank you so much", "appreciate it",
            "thanks a lot", "many thanks", "thx", "ty", "cheers"
        ],
        "responses": [
            "You're welcome! 😊 Anything else I can help with?",
            "Happy to help! Is there anything else you need?",
            "My pleasure! Let me know if you have more questions.",
            "Glad I could assist! Feel free to ask anything else."
        ]
    },
    {
        "tag": "pricing",
        "patterns": [
            "how much does it cost", "pricing", "price", "how much",
            "what are your plans", "subscription", "cost", "fee",
            "payment", "billing", "how much is the service", "plan options",
            "free trial", "enterprise pricing"
        ],
        "responses": [
            "We offer three plans:\n\n• **Starter** — Free forever, up to 100 messages/day\n• **Pro** — $29/month, unlimited messages + analytics\n• **Enterprise** — Custom pricing with dedicated support\n\nWould you like more details on any plan?",
            "Our pricing starts free! The Pro plan at $29/month includes advanced analytics, priority support, and unlimited conversations. Enterprise plans are customized. Want a demo?"
        ]
    },
    {
        "tag": "refund",
        "patterns": [
            "refund", "money back", "cancel subscription", "get my money back",
            "return policy", "cancellation policy", "how to cancel",
            "refund policy", "I want a refund"
        ],
        "responses": [
            "We offer a **30-day money-back guarantee** on all paid plans, no questions asked. To request a refund, please email billing@supportai.com with your account email. We process refunds within 3-5 business days.",
            "Our refund policy is simple: 30 days, full refund, no questions. Reach out to our billing team at billing@supportai.com and we'll handle it promptly."
        ]
    },
    {
        "tag": "account",
        "patterns": [
            "reset password", "forgot password", "change password",
            "login issues", "can't login", "account problem", "locked out",
            "account access", "sign in issue", "account help", "update profile"
        ],
        "responses": [
            "For account issues:\n\n1. Go to **Settings → Account**\n2. Click **'Forgot Password'** for a reset link\n3. Check your spam folder if you don't see the email\n\nStill stuck? Email support@supportai.com with your username.",
            "Account troubles? Try resetting your password via the login page. If you're still locked out, our support team at support@supportai.com can verify and restore your access within 1 hour."
        ]
    },
    {
        "tag": "integration",
        "patterns": [
            "integration", "API", "connect to", "webhook", "Slack integration",
            "embed chatbot", "API key", "REST API", "SDK", "connect my app",
            "how to integrate", "developer docs", "documentation"
        ],
        "responses": [
            "We support integrations with:\n\n• **Slack, Teams, Discord** — 1-click connect\n• **REST API** — Full programmatic access\n• **Webhooks** — Real-time event notifications\n• **Zapier** — 5000+ app connections\n\nAPI docs are at docs.supportai.com. Need an API key? Go to Settings → Developer.",
            "Our API documentation is at docs.supportai.com. We have SDKs for Python, Node.js, and PHP. Integration typically takes under 30 minutes. Want me to walk you through it?"
        ]
    },
    {
        "tag": "features",
        "patterns": [
            "what can you do", "features", "capabilities", "what do you offer",
            "tell me about your product", "product features", "what is included",
            "how does this work", "benefits", "what's available"
        ],
        "responses": [
            "Here's what SupportAI offers:\n\n✅ **AI-Powered Responses** — Instant, accurate answers\n✅ **Analytics Dashboard** — Track all conversations\n✅ **Multi-channel** — Web, Slack, Email\n✅ **Custom Training** — Teach it your brand voice\n✅ **Live Handoff** — Escalate to human agents\n✅ **24/7 Availability** — Always on, never tired\n\nWant a live demo?",
            "SupportAI combines NLP with your knowledge base to deliver human-like support at scale. Key features include semantic search, intent detection, sentiment analysis, and a full admin dashboard."
        ]
    },
    {
        "tag": "technical_issue",
        "patterns": [
            "not working", "bug", "error", "broken", "issue", "problem",
            "glitch", "crash", "something's wrong", "it's down", "outage",
            "slow", "not responding", "500 error", "loading issue"
        ],
        "responses": [
            "I'm sorry you're experiencing issues! Let's fix this:\n\n1. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)\n2. **Clear cache** and cookies\n3. **Try a different browser**\n4. Check **status.supportai.com** for outages\n\nIf the issue persists, share your error message and I'll escalate it.",
            "Technical issues are our top priority. Please note your error message and browser version, then email tech@supportai.com. Our engineering team responds within 2 hours."
        ]
    },
    {
        "tag": "contact",
        "patterns": [
            "contact", "talk to human", "real person", "support team",
            "phone number", "email address", "live chat", "speak to agent",
            "customer service", "reach you", "contact us"
        ],
        "responses": [
            "You can reach our team via:\n\n📧 **Email**: support@supportai.com\n💬 **Live Chat**: Available M-F, 9am-6pm EST\n📞 **Phone**: +1-800-SUPPORT (Pro/Enterprise only)\n🐦 **Twitter**: @SupportAI\n\nAverage response time: under 2 hours.",
            "Our human support team is available Monday through Friday, 9am–6pm EST. For urgent issues, email support@supportai.com with 'URGENT' in the subject line for priority handling."
        ]
    },
    {
        "tag": "data_privacy",
        "patterns": [
            "privacy", "data security", "GDPR", "my data", "data protection",
            "who can see my data", "is it secure", "encryption", "CCPA",
            "delete my data", "data policy", "privacy policy"
        ],
        "responses": [
            "Your data is protected with:\n\n🔒 **AES-256 encryption** at rest and in transit\n🛡️ **GDPR & CCPA compliant**\n🗑️ **Data deletion** available on request\n📍 **US/EU data centers** with SOC 2 Type II certification\n\nFull privacy policy at supportai.com/privacy.",
            "We take privacy seriously. All conversations are encrypted, never sold to third parties, and you can request complete data deletion at any time. We're fully GDPR compliant."
        ]
    },
    {
        "tag": "onboarding",
        "patterns": [
            "how to get started", "setup", "getting started", "how to use",
            "new user", "beginner", "tutorial", "guide", "walkthrough",
            "first steps", "how do I begin", "quick start"
        ],
        "responses": [
            "Getting started is easy! Here's your 3-step quick start:\n\n1️⃣ **Create account** at supportai.com/signup\n2️⃣ **Upload your FAQ** or connect your knowledge base\n3️⃣ **Embed the widget** on your site with one line of code\n\nYou'll be live in under 10 minutes! Need help with any step?",
            "Welcome aboard! Our onboarding wizard will guide you through everything. Start at supportai.com/onboarding — it takes about 10 minutes and you'll have a fully trained chatbot ready to deploy."
        ]
    }
]
