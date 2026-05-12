/* ============================================================
   admin.js — SupportAI Admin Dashboard Logic
   Handles: analytics fetch, Chart.js rendering, table display
   ============================================================ */

"use strict";

/* ── Chart instances (kept for destroy/re-render) ── */
let dailyChart  = null;
let intentChart = null;

/* ── DOM refs ── */
const themeToggle = document.getElementById("themeToggle");

/* ════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  loadAnalytics();
  setupSidebar();
  setupTheme();
  // auto-refresh every 60s
  setInterval(loadAnalytics, 60_000);
});

/* ════════════════════════════════════════════════════════
   LOAD ANALYTICS
   ════════════════════════════════════════════════════════ */
async function loadAnalytics() {
  try {
    const res  = await fetch("/analytics");
    const data = await res.json();

    if (data.error) { console.error(data.error); return; }

    renderKPIs(data);
    renderDailyChart(data.daily_activity || []);
    renderIntentChart(data.top_intents   || []);
    renderTable(data.recent_conversations || []);

    document.getElementById("lastRefresh").textContent =
      `Last updated: ${new Date().toLocaleTimeString()}`;

  } catch (err) {
    console.error("Analytics fetch error:", err);
    document.getElementById("lastRefresh").textContent = "Error loading data";
  }
}

/* ════════════════════════════════════════════════════════
   KPI CARDS
   ════════════════════════════════════════════════════════ */
function renderKPIs(data) {
  setText("totalChats",    data.total_chats    ?? 0);
  setText("totalSessions", data.total_sessions ?? 0);

  const pct = Math.round((data.avg_confidence ?? 0) * 100);
  setText("avgConfidence", `${pct}%`);

  const likes    = data.likes    ?? 0;
  const dislikes = data.dislikes ?? 0;
  const total    = likes + dislikes;
  const sat      = total > 0 ? Math.round((likes / total) * 100) : 0;
  setText("satisfactionRate", total > 0 ? `${sat}%` : "—");
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ════════════════════════════════════════════════════════
   DAILY CHART (line)
   ════════════════════════════════════════════════════════ */
function renderDailyChart(data) {
  const ctx    = document.getElementById("dailyChart")?.getContext("2d");
  if (!ctx) return;

  const isDark  = document.documentElement.getAttribute("data-theme") !== "light";
  const gridCol = isDark ? "#2a2e40" : "#e0e2ee";
  const textCol = isDark ? "#8890a8" : "#5a6080";

  const labels = data.map(d => formatDay(d.day));
  const values = data.map(d => d.count);

  if (dailyChart) dailyChart.destroy();

  dailyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Conversations",
        data: values,
        borderColor:     "#6c8fff",
        backgroundColor: "rgba(108,143,255,0.12)",
        borderWidth: 2.5,
        pointBackgroundColor: "#6c8fff",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? "#1a1d27" : "#ffffff",
          borderColor:     isDark ? "#2a2e40" : "#dde0ee",
          borderWidth: 1,
          titleColor: isDark ? "#e8eaf0" : "#1a1d2e",
          bodyColor:  isDark ? "#8890a8" : "#5a6080",
        }
      },
      scales: {
        x: {
          grid:  { color: gridCol },
          ticks: { color: textCol, font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid:  { color: gridCol },
          ticks: { color: textCol, font: { size: 11 }, stepSize: 1 }
        }
      }
    }
  });
}

/* ════════════════════════════════════════════════════════
   INTENT CHART (doughnut)
   ════════════════════════════════════════════════════════ */
function renderIntentChart(data) {
  const ctx = document.getElementById("intentChart")?.getContext("2d");
  if (!ctx) return;

  const isDark  = document.documentElement.getAttribute("data-theme") !== "light";
  const textCol = isDark ? "#8890a8" : "#5a6080";

  const COLORS = [
    "#6c8fff","#a78bfa","#34d399","#fbbf24",
    "#f87171","#38bdf8","#fb7185","#4ade80"
  ];

  const labels = data.map(d => d.intent ?? "unknown");
  const values = data.map(d => d.count);

  if (intentChart) intentChart.destroy();

  if (data.length === 0) {
    // Show placeholder text
    ctx.fillStyle = textCol;
    ctx.font = "13px DM Sans";
    ctx.textAlign = "center";
    ctx.fillText("No data yet", ctx.canvas.width / 2, ctx.canvas.height / 2);
    return;
  }

  intentChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: isDark ? "#13151c" : "#ffffff",
        borderWidth: 3,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: textCol,
            font: { size: 11 },
            padding: 12,
            boxWidth: 12,
            usePointStyle: true,
          }
        },
        tooltip: {
          backgroundColor: isDark ? "#1a1d27" : "#ffffff",
          borderColor:     isDark ? "#2a2e40" : "#dde0ee",
          borderWidth: 1,
          titleColor: isDark ? "#e8eaf0" : "#1a1d2e",
          bodyColor:  isDark ? "#8890a8" : "#5a6080",
        }
      }
    }
  });
}

/* ════════════════════════════════════════════════════════
   CONVERSATIONS TABLE
   ════════════════════════════════════════════════════════ */
let tableData = [];

function renderTable(rows) {
  tableData = rows;
  displayRows(rows);
}

function displayRows(rows) {
  const tbody = document.getElementById("convBody");
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No conversations yet. Start chatting!</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const confPct  = Math.round((r.confidence ?? 0) * 100);
    const fillColor = confPct >= 55 ? "#34d399" : confPct >= 30 ? "#fbbf24" : "#f87171";
    const sessionShort = r.session_id ? r.session_id.slice(0, 8) + "…" : "—";

    const fbIcon = r.feedback === "like"
      ? `<span class="fb-like">👍</span>`
      : r.feedback === "dislike"
        ? `<span class="fb-dislike">👎</span>`
        : `<span class="fb-none">—</span>`;

    const intentPill = r.intent
      ? `<span class="intent-pill">${escHtml(r.intent)}</span>`
      : `<span class="fb-none">—</span>`;

    return `
      <tr>
        <td>${r.id}</td>
        <td title="${escHtml(r.session_id ?? '')}">${sessionShort}</td>
        <td title="${escHtml(r.user_msg ?? '')}">${escHtml(truncate(r.user_msg, 50))}</td>
        <td title="${escHtml(r.bot_reply ?? '')}">${escHtml(truncate(r.bot_reply, 60))}</td>
        <td>${intentPill}</td>
        <td>
          <div class="conf-bar-wrap">
            <div class="conf-bar">
              <div class="conf-fill" style="width:${confPct}%;background:${fillColor}"></div>
            </div>
            <span style="font-size:11px;color:var(--text-muted)">${confPct}%</span>
          </div>
        </td>
        <td>${fbIcon}</td>
        <td style="color:var(--text-muted);font-size:12px">${formatTS(r.timestamp)}</td>
      </tr>
    `;
  }).join("");
}

/* Table search filter */
function filterTable() {
  const q = document.getElementById("tableSearch")?.value.toLowerCase() || "";
  if (!q) { displayRows(tableData); return; }
  const filtered = tableData.filter(r =>
    (r.user_msg  ?? "").toLowerCase().includes(q) ||
    (r.bot_reply ?? "").toLowerCase().includes(q) ||
    (r.intent    ?? "").toLowerCase().includes(q)
  );
  displayRows(filtered);
}

/* ════════════════════════════════════════════════════════
   SIDEBAR & THEME (shared with chat.js)
   ════════════════════════════════════════════════════════ */
function setupSidebar() {
  const sidebarEl = document.getElementById("sidebar");
  document.getElementById("sidebarToggle")?.addEventListener("click", () => {
    sidebarEl?.classList.toggle("open");
  });
}

function setupTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);
  themeToggle?.addEventListener("click", () => {
    const curr = document.documentElement.getAttribute("data-theme");
    applyTheme(curr === "dark" ? "light" : "dark");
    // Re-render charts with new colors
    setTimeout(loadAnalytics, 50);
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
   UTILITIES
   ════════════════════════════════════════════════════════ */
function formatDay(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return dateStr; }
}

function formatTS(isoStr) {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    return d.toLocaleString([], {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch { return isoStr; }
}

function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "…" : str;
}

function escHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
