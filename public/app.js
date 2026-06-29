window.onload = async function () {
  await fetchEmails();
};

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

    // Auto select first email
    selectEmail(data.emails[0].id);

  } catch (error) {
    console.error("❌ Failed to fetch emails:", error);
  }
}

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
        </div>
        <div class="subject-line">${email.subject}</div>
        <div class="body-preview">${email.snippet}</div>
      </div>
    `;

    feed.appendChild(card);
  });
}

// Generate AI draft when email is selected
async function generateDraft(emailBody) {
  try {

    document.getElementById("ai-draft-output").value = "✨ Generating reply...";
    document.getElementById("ai-drawer").classList.remove("hidden");

    const res = await fetch("/ai/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailBody })
    });

    const data = await res.json();

    document.getElementById("ai-draft-output").value = data.draft;

  } catch (error) {
    console.error("❌ Draft generation failed:", error);
  }
}

async function selectEmail(emailId) {
  try {
    document.getElementById("view-body").textContent = "Loading...";

    const res = await fetch(`/emails/${emailId}`);
    const email = await res.json();

    document.getElementById("view-subject").textContent = email.subject;
    document.getElementById("view-sender").textContent = formatSender(email.from);
    document.getElementById("view-meta").textContent = `From: ${email.from}`;
    document.getElementById("view-body").innerHTML = `
  <div class="email-content-box">${email.body || email.snippet}</div>
`;
    document.getElementById("view-avatar").textContent = getInitials(email.from);

    await generateDraft(email.body || email.snippet);

  } catch (error) {
    console.error("❌ Failed to load email:", error);
  }
}

async function logout() {
  await fetch("/auth/logout");
  window.location.href = "/";
}

// ─── Helper: Get initials from "John Doe <john@gmail.com>" 
function getInitials(from) {
  const name = from.split("<")[0].trim();
  const parts = name.split(" ");
  return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Helper: Get just name from "John Doe <john@gmail.com>"
function formatSender(from) {
  return from.split("<")[0].trim().replace(/"/g, "");
}

