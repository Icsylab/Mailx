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

async function selectEmail(emailId) {
  try {
    document.getElementById("view-body").textContent = "Loading...";
    document.getElementById("view-subject").textContent = "Loading...";

    const res = await fetch(`/emails/${emailId}`);
    const email = await res.json();

    document.getElementById("view-subject").textContent = email.subject;
    document.getElementById("view-sender").textContent = formatSender(email.from);
    document.getElementById("view-meta").textContent = `From: ${email.from}`;
    document.getElementById("view-body").textContent = email.body || email.snippet;
    document.getElementById("view-avatar").textContent = getInitials(email.from);

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