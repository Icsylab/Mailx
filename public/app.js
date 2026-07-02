window.onload = async function () {
  await fetchEmails();
  setupNavigationEvents();
  setupHamburger();
};

// ── Hamburger Sidebar Toggle ──────────────────────────────
function setupHamburger() {
  const hamburger = document.querySelector(".hamburger-toggle");
  const sidebar = document.querySelector(".sidebar");

  hamburger?.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

// ── Fetch Email List ──────────────────────────────────────
async function fetchEmails() {
  try {
    document.getElementById("email-feed").innerHTML =
      "<p style='padding:16px'>Loading emails...</p>";

    const res = await fetch("/emails");
    const data = await res.json();

    if (!data.emails || data.emails.length === 0) {
      document.getElementById("email-feed").innerHTML =
        "<p style='padding:16px'>No unread emails found.</p>";
      return;
    }

    renderEmailList(data.emails);

    const badge = document.getElementById("inbox-badge");
    if (badge) badge.textContent = data.emails.length;

  } catch (error) {
    console.error("❌ Failed to fetch emails:", error);
  }
}

// ── Render Email List Cards ───────────────────────────────
function renderEmailList(emails) {
  const feed = document.getElementById("email-feed");
  feed.innerHTML = "";

  emails.forEach(email => {
    const card = document.createElement("div");
    card.className = "email-card";
    card.onclick = () => selectEmail(email.id);

    card.innerHTML = `
      <div class="avatar">${getInitials(email.from)}</div>
      <div class="email-meta">
        <div class="email-top-row">
          <span class="sender-name">${formatSender(email.from)}</span>
          <span class="card-time">10:42 AM</span>
        </div>
        <div class="subject-line">${email.subject}</div>
        <div class="body-preview">${email.snippet}</div>
      </div>
    `;

    feed.appendChild(card);
  });
}

// ── Navigation Events ─────────────────────────────────────
function setupNavigationEvents() {
  // Back button → return to inbox list
  const backBtn = document.getElementById("go-back-to-inbox");
  backBtn?.addEventListener("click", () => {
    document.getElementById("app-content-area").className = "content-area state-inbox";
    // Hide reply drawer when going back
    document.getElementById("ai-drawer").classList.add("hidden");
  });

  // Reply button → show AI draft drawer
  document.getElementById("reply-btn")?.addEventListener("click", async () => {
    const body = document.querySelector(".email-content-box")?.innerText || "";
    const drawer = document.getElementById("ai-drawer");
    drawer.classList.remove("hidden");
    // Scroll into view smoothly
    drawer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    await generateDraft(body);
  });

  // Reply action in side panel → same as reply button
  document.getElementById("reply-action")?.addEventListener("click", async () => {
    const body = document.querySelector(".email-content-box")?.innerText || "";
    const drawer = document.getElementById("ai-drawer");
    drawer.classList.remove("hidden");
    drawer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    await generateDraft(body);
  });

  // Close reply drawer
  document.getElementById("close-reply")?.addEventListener("click", () => {
    document.getElementById("ai-drawer").classList.add("hidden");
  });

  // Tone selector → regenerate draft with new tone
  document.getElementById("tone-select")?.addEventListener("change", async () => {
    const body = document.querySelector(".email-content-box")?.innerText || "";
    const drawer = document.getElementById("ai-drawer");
    if (!drawer.classList.contains("hidden")) {
      await generateDraft(body);
    }
  });

  // Regenerate button
  document.getElementById("btn-regenerate")?.addEventListener("click", async () => {
    const body = document.querySelector(".email-content-box")?.innerText || "";
    await generateDraft(body);
  });
}

// ── Select & Load Single Email ────────────────────────────
async function selectEmail(emailId) {
  try {
    // Switch layout to single email view
    document.getElementById("app-content-area").className = "content-area state-single";

    // Hide reply drawer on new email open
    document.getElementById("ai-drawer").classList.add("hidden");

    document.getElementById("view-body").innerHTML = "<p style='padding:16px;color:var(--muted)'>Loading...</p>";

    const res = await fetch(`/emails/${emailId}`);
    const email = await res.json();

    // Populate header
    document.getElementById("view-subject").textContent = email.subject;
    document.getElementById("view-sender").textContent = formatSender(email.from);
    document.getElementById("view-meta").textContent = `From: ${email.from}`;
    document.getElementById("view-avatar").textContent = getInitials(email.from);

    // Populate email body in Gmail-like box
    document.getElementById("view-body").innerHTML = `
      <div class="email-content-box">${email.body || email.snippet}</div>
    `;

    // Generate simple summary for side panel
    generateSummary(email.body || email.snippet);

  } catch (error) {
    console.error("❌ Failed to load email:", error);
  }
}

// ── Simple Summary (truncate for now, API later) ──────────
// ── AI Summary (Gemini API) ───────────────────────────────
async function generateSummary(emailBody) {
  const summaryBox = document.getElementById("ai-summary");
  if (!summaryBox) return;

  if (!emailBody || !emailBody.trim()) {
    summaryBox.textContent = "No content to summarize.";
    return;
  }

  summaryBox.textContent = "✨ Summarizing...";

  try {
    const res = await fetch("/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailBody })
    });

    const data = await res.json();
    summaryBox.textContent = data.summary || "Could not generate summary.";

  } catch (error) {
    console.error("❌ Summary generation failed:", error);
    summaryBox.textContent = "Failed to generate summary.";
  }
}

// ── Generate AI Draft (Gemini API) ───────────────────────
async function generateDraft(emailBody) {
  const outputTextarea = document.getElementById("ai-draft-output");
  if (!outputTextarea) return;

  // Get selected tone
  const tone = document.getElementById("tone-select")?.value || "Professional";

  outputTextarea.value = "✨ Generating reply...";

  try {
    const res = await fetch("/ai/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailBody, tone })
    });

    const data = await res.json();
    outputTextarea.value = data.draft || "Could not generate draft.";

  } catch (error) {
    console.error("❌ Draft generation failed:", error);
    outputTextarea.value = "Failed to generate draft. Please try again.";
  }
}

// ── Helpers ───────────────────────────────────────────────
function getInitials(from) {
  if (!from) return "—";
  const name = from.split("<")[0].trim();
  return name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
}

function formatSender(from) {
  if (!from) return "Unknown Sender";
  return from.split("<")[0].trim().replace(/"/g, "");
}
