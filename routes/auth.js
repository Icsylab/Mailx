const express = require("express");
const router = express.Router(); //kinda like mini express
const { google } = require("googleapis");

//creating OAuth client with credentials from .env 
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

//permissions we need from the user
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",  // read emails
  "https://www.googleapis.com/auth/gmail.send",       // send emails
  "https://www.googleapis.com/auth/userinfo.email",   // get email address
  "https://www.googleapis.com/auth/userinfo.profile"  // get name/photo
];

//ROUTE 1:send user to google login page
router.get("/google", (req, res) => {

  const authUrl = oauth2Client.generateAuthUrl({ //this thing creates a special google url with ID, perms etc.
    access_type: "offline",
    scope: SCOPES
      });

  // Redirect user to Google
  res.redirect(authUrl);
});

//ROUTE 2 : Google sends user back here after login 
router.get("/google/callback", async (req, res) => {
  const code = req.query.code; // Google sends user with one-time code

    console.log("📩 Callback hit! Code:", code);
  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code); //google replies with access token(expires sson) and refresh token 
    oauth2Client.setCredentials(tokens); //attaching token to our client

    req.session.accessToken = tokens.access_token; //use to call gmail api etc.
    req.session.refreshToken = tokens.refresh_token;//can later get new access token
    
    console.log("✅ Login successful!");
    console.log("Access token:", req.session.accessToken); 

    // Send user to ihome page
    res.redirect("/home");

  } catch (error) {
    // console.error("❌ OAuth Error:", error);
     console.error("❌ Full error:", JSON.stringify(error, null, 2));
    res.redirect("/");
  }
});

// ROUTE 3: Check if user is logged in 
router.get("/status", (req, res) => {

  if (req.session.accessToken) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

// ROUTE 4:Logout 
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");// Send back to login page
});



module.exports = router;