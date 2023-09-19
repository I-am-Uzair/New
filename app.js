const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const session = require("express-session");
const csrf = require("csurf");
const flash = require("connect-flash");
const mongoDbStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const User = require("./Models/user");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const MONGODB_URI = `Mongo DB url`

const store = new mongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error("User Session deosn't exist", err));
    });
});

app.use("/admin", adminRoutes);
app.use(userRoutes);
app.use(authRoutes);

const errorController = require("./Controllers/error");
app.use("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.redirect("/500");
  // console.log(req.session);
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    csrfToken: req.csrfToken(),
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("connected");
    app.listen(5000);
  })
  .catch((err) => {
    console.log("Error while connecting to the database", err);
  });
