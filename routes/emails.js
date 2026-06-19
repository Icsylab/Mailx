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

// Route: get list of unread emails
router.get("/", async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const auth = getOAuthClient(req);
  const gmail = google.gmail({ version: "v1", auth });

  const response = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread in:inbox",
    maxResults: 10
  });

  res.json(response.data);
});

module.exports = router;