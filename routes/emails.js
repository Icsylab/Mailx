const express = require("express");
const router =  express.Router();

const {google} = require("googleapis");

function getOAuthClient(req) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  client.setCredentials({
    access_token: req.session.accessToken,
    refresh_token: req.session.refreshToken
  });

  return client;
}

router.get("/", async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const auth = getOAuthClient(req);
  const gmail = google.gmail({ version: "v1", auth });

  const response = await gmail.users.messages.list({
    userId: "me",
    q: "in:inbox",
    maxResults: 10
  });

  const messages = response.data.messages || [];

  if (messages.length === 0) {
    return res.json({ emails: [] });
  }

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["From", "Subject"]
      });

      const headers = detail.data.payload.headers;
      const subject = headers.find(h => h.name === "Subject")?.value || "No Subject";
      const from = headers.find(h => h.name === "From")?.value || "Unknown";

      return {
        id: msg.id,
        subject,
        from,
      };
    })
  );

  res.json({ emails });
});

router.get("/:id", async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const auth = getOAuthClient(req);
  const gmail = google.gmail({ version: "v1", auth });

  const detail = await gmail.users.messages.get({
    userId: "me",
    id: req.params.id,
    format: "full"
  });

  const headers = detail.data.payload.headers;
  const subject = headers.find(h => h.name === "Subject")?.value || "No Subject";
  const from = headers.find(h => h.name === "From")?.value || "Unknown";

  let body = "";
  const parts = detail.data.payload.parts;

  if (parts) {
    const textPart = parts.find(p => p.mimeType === "text/plain");
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
    }
  } else if (detail.data.payload.body?.data) {
    body = Buffer.from(detail.data.payload.body.data, "base64").toString("utf-8");
  }

  res.json({ subject, from, body, snippet: detail.data.snippet });
});


module.exports = router;