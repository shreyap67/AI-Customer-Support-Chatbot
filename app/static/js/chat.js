/* ============================================================
   chat.js — SupportAI Chat Interface Logic
   Handles: message sending, rendering, voice input,
            feedback modal, theme toggle, export, etc.
   ============================================================ */

"use strict";

/* ── State ─────────────────────────────────────────────── */
let lastConvId   = null;   // last conversation ID from API
let isWaiting    = false;  // prevent double-sends
let recognition  = null;   // SpeechRecognition instance

/* ── DOM refs ──────────────────────────────────────────── */
const chatWindow  = document.getElementById("chatWindow");
const userInput   = document.getElementById("userInput");
const sendBtn     = document.getElementById("sendBtn");
const typingBar   = document.getElementById("typingBar");
const charCount   = document.getElementById("charCount");
const voiceBtn    = document.getElementById("voiceBtn");
const themeToggle = document.getElementById("themeToggle");
const sidebarEl   = document.getElementById("sidebar");

/* ════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  renderWelcome();
  loadHistory();
  setupInput();
  setupSidebar();
  setupTheme();
  setupVoice();
});

/* ── Welcome card ── */
function renderWelcome() {
  const topics = [
    "What are your pricing plans?",
    "How do I get started?",
    "Tell me about your features",
    "I need help with my account",
    "How to contact support?"
  ];

  const card = document.createElement("div");
  card.className = "welcome-card";
  card.innerHTML = `
    <div class="welcome-icon"><i class="fa-solid fa-robot"></i></div>
    <h2>Hi, I'm SupportAI 👋</h2>
    <p>Your intelligent customer support assistant. Ask me anything about our product, pricing, or get help with your account.</p>
    <div class="welcome-chips">
      ${topics.map(t => `<button class="chip" onclick="sendQuick('${t}')">${t}</button>`).join("")}
    </div>
  `;
  chatWindow.appendChild(card);
}

/* ── Load existing session history ── */
async function loadHistory() {
  try {
    const res  = await fetch("/history?limit=30");
    const data = await res.json();
    if (data.history && data.history.length > 0) {
      // Clear welcome card, show history
      chatWindow.innerHTML = "";
      addSysMsg("— Previous session restored —");
      data.history.forEach(h => {
        appendMessage("user", h.user_msg, null, h.timestamp);
        appendMessage("bot", h.bot_reply, h.id, h.timestamp, h.confidence, h.intent);
      });
      scrollBottom();
    }
  } catch (_) { /* fresh session, welcome stays */ }
}

/* ════════════════════════════════════════════════════════
   SEND MESSAGE
   ════════════════════════════════════════════════════════ */
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isWaiting) return;

  isWaiting = true;
  sendBtn.disabled = true;

  // render user bubble
  appendMessage("user", text);
  userInput.value = "";
  userInput.style.height = "auto";
  charCount.textContent = "0 / 500";
  scrollBottom();

  // show typing
  typingBar.style.display = "flex";
  scrollBottom();

  try {
    const res  = await fetch("/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ message: text })
    });

    const data = await res.json();
    typingBar.style.display = "none";

    if (data.error) {
      appendMessage("bot", `⚠️ ${data.error}`);
    } else {
      lastConvId = data.conv_id;
      appendMessage("bot", data.reply, data.conv_id, null, data.confidence, data.intent);
    }

  } catch (err) {
    typingBar.style.display = "none";
    appendMessage("bot", "⚠️ Connection error. Please check your network and try again.");
    console.error("Chat error:", err);
  }

  isWaiting = false;
  sendBtn.disabled = false;
  scrollBottom();
  userInput.focus();
}

/* Shortcut helper for quick-buttons / chips */
function sendQuick(text) {
  userInput.value = text;
  sendMessage();
}

/* ════════════════════════════════════════════════════════
   RENDER MESSAGE BUBBLE
   ════════════════════════════════════════════════════════ */
function appendMessage(role, text, convId = null, timestamp = null, confidence = null, intent = null) {
  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const ts  = timestamp ? formatTS(timestamp) : formatTS(new Date().toISOString());
  const isBot = role === "bot";

  // Confidence badge HTML
  let confBadge = "";
  let feedbackHTML = "";

  if (isBot && confidence !== null) {
    const level = confidence >= 0.55 ? "high" : confidence >= 0.30 ? "medium" : "low";
    const pct   = Math.round(confidence * 100);
    confBadge = `<span class="conf-badge ${level}" title="Confidence: ${pct}%">${level}</span>`;

    if (convId) {
      feedbackHTML = `
        <div class="feedback-row" id="fb-${convId}">
          <button class="fb-btn like"    onclick="openFeedback(${convId}, 'like')"   title="Helpful">👍</button>
          <button class="fb-btn dislike" onclick="openFeedback(${convId}, 'dislike')" title="Not helpful">👎</button>
        </div>
      `;
    }
  }

  // Markdown-lite: bold **text**, code `text`, line breaks
  const formatted = markdownLite(text);

  row.innerHTML = `
    <div class="msg-avatar ${role}">
      <i class="fa-solid fa-${isBot ? "robot" : "user"}"></i>
    </div>
    <div class="msg-bubble">
      <div class="bubble-text">${formatted}</div>
      <div class="bubble-meta">
        <span class="msg-time">${ts}</span>
        ${confBadge}
        ${feedbackHTML}
      </div>
    </div>
  `;

  chatWindow.appendChild(row);
}

/* Minimal markdown renderer */
function markdownLite(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code style='background:var(--bg-elevated);padding:1px 5px;border-radius:4px;font-size:0.9em'>$1</code>")
    .replace(/\n/g, "<br>");
}

function addSysMsg(text) {
  const el = document.createElement("div");
  el.className = "sys-msg";
  el.textContent = text;
  chatWindow.appendChild(el);
}

function scrollBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* ════════════════════════════════════════════════════════
   FEEDBACK MODAL
   ════════════════════════════════════════════════════════ */
let activeFeedbackId = null;

function openFeedback(convId, quickRating) {
  activeFeedbackId = convId;
  if (quickRating) {
    submitFeedback(quickRating);
    return;
  }
  document.getElementById("feedbackModal").style.display = "grid";
}

function closeFeedback() {
  document.getElementById("feedbackModal").style.display = "none";
  activeFeedbackId = null;
}

async function submitFeedback(rating) {
  if (!activeFeedbackId && !lastConvId) return;
  const id      = activeFeedbackId || lastConvId;
  const comment = document.getElementById("feedbackComment")?.value || "";

  try {
    await fetch("/feedback", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ conv_id: id, rating, comment })
    });

    // Update button state
    const fbRow = document.getElementById(`fb-${id}`);
    if (fbRow) {
      fbRow.querySelectorAll(".fb-btn").forEach(b => {
        b.classList.remove("selected");
        if (b.classList.contains(rating)) b.classList.add("selected");
      });
    }

    closeFeedback();
  } catch (err) {
    console.error("Feedback error:", err);
  }
}

/* ════════════════════════════════════════════════════════
   INPUT HELPERS
   ════════════════════════════════════════════════════════ */
function setupInput() {
  userInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  userInput.addEventListener("input", () => {
    // auto-grow
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
    // char count
    charCount.textContent = `${userInput.value.length} / 500`;
  });
}

/* ════════════════════════════════════════════════════════
   SIDEBAR TOGGLE (mobile)
   ════════════════════════════════════════════════════════ */
function setupSidebar() {
  document.getElementById("sidebarToggle")?.addEventListener("click", () => {
    sidebarEl.classList.toggle("open");
  });

  // close on outside click
  document.addEventListener("click", e => {
    if (window.innerWidth <= 768 &&
        !sidebarEl.contains(e.target) &&
        !document.getElementById("sidebarToggle").contains(e.target)) {
      sidebarEl.classList.remove("open");
    }
  });
}

/* ════════════════════════════════════════════════════════
   THEME TOGGLE
   ════════════════════════════════════════════════════════ */
function setupTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);

  themeToggle?.addEventListener("click", () => {
    const curr = document.documentElement.getAttribute("data-theme");
    applyTheme(curr === "dark" ? "light" : "dark");
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (themeToggle) {
    themeToggle.innerHTML = theme === "dark"
      ? '<i class="fa-solid fa-sun"></i> Light Mode'
      : '<i class="fa-solid fa-moon"></i> Dark Mode';
  }
}

/* ════════════════════════════════════════════════════════
   VOICE INPUT (Web Speech API)
   ════════════════════════════════════════════════════════ */
function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceBtn.title = "Voice input not supported in this browser";
    voiceBtn.style.opacity = "0.4";
    voiceBtn.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = e => {
    userInput.value = e.results[0][0].transcript;
    charCount.textContent = `${userInput.value.length} / 500`;
    voiceBtn.classList.remove("recording");
    voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    sendMessage();
  };

  recognition.onerror = () => {
    voiceBtn.classList.remove("recording");
    voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
  };

  voiceBtn.addEventListener("click", () => {
    if (voiceBtn.classList.contains("recording")) {
      recognition.stop();
      voiceBtn.classList.remove("recording");
      voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    } else {
      recognition.start();
      voiceBtn.classList.add("recording");
      voiceBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
    }
  });
}

/* ════════════════════════════════════════════════════════
   EXPORT CHAT
   ════════════════════════════════════════════════════════ */
function exportChat() {
  const rows  = chatWindow.querySelectorAll(".msg-row");
  let content = "SupportAI — Chat Export\n";
  content    += `Generated: ${new Date().toLocaleString()}\n`;
  content    += "=".repeat(50) + "\n\n";

  rows.forEach(row => {
    const role   = row.classList.contains("user") ? "You" : "SupportAI";
    const text   = row.querySelector(".bubble-text")?.innerText || "";
    const time   = row.querySelector(".msg-time")?.textContent || "";
    content += `[${time}] ${role}:\n${text}\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `supportai-chat-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Clear chat ── */
function clearChat() {
  if (!confirm("Clear this conversation? This cannot be undone.")) return;
  chatWindow.innerHTML = "";
  renderWelcome();
}

/* ── Utility ── */
function formatTS(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}
