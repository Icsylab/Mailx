const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const path = require("path");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));

// app.use(express.json());

const session = require("express-session");
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    expire: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
  }
}))


const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const emailRoutes = require("./routes/emails");
app.use("/emails", emailRoutes);


app.get("/", (req, res) => {
  res.render("login");   
});


app.get("/home", (req, res) => {
  if (!req.session.accessToken) {
    return res.redirect("/");
  }
  res.render("home"); 
});


// Server start-----------------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




