const express = require("express");
const app = express();
const path = require("path");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));

// Server start
app.listen(process.env.PORT || 8080, () => {
  console.log(`Server running on port ${port}`);
});


// app.use(express.json());


const dotenv = require("dotenv");
dotenv.config();





