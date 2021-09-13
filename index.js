const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const Cors = require("cors");
const passport = require("passport");
const cookieSession = require("cookie-session");
require("./passport-setup.js");

const port = process.env.PORT || 3001;
const connection_url =
  process.env.DB_URL || "mongodb://localhost:27017/MernDemo";

const app = express();
app.use(Cors());

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cookieSession({
    name: "demo-session",
    keys: ["key1", "key2"],
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Initialize MongoDB
mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Middleware
isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};

// Routes
app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/fail", (req, res) => {
  res.send("You Failed to Login");
});

// Google Auth Routes
app.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/fail" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get("/logout", isLoggedIn, (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});

// Serve the application
app.listen(port, (req, res) => {
  console.log(`Listening on port ${port}`);
});
