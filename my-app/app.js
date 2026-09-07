var createError = require("http-errors");

require("dotenv").config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var chatRouter = require("./routes/chatRoutes");

// New API Router
var userRoutes = require("./routes/userRoutes");

var app = express();

// MongoDB Connection
mongoose
  .connect(
    "mongodb://127.0.0.1:27017/mydatabase"
  )
  .then(() => {
    console.log(
      "MongoDB Connected Successfully"
    );
  })
  .catch((err) => {
    console.log(err);
  });

// View Engine
app.set(
  "views",
  path.join(__dirname, "views")
);

app.set(
  "view engine",
  "jade"
);

// Middleware
app.use(logger("dev"));

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(cookieParser());

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

// Existing Routes
app.use("/", indexRouter);

app.use(
  "/users",
  usersRouter
);

// User API Routes
app.use(
  "/api",
  userRoutes
);

// Chat API Routes
app.use(
  "/api/chat",
  chatRouter
);

// Static Folder
app.use(
  "/testapi",
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);

// 404 Handler
app.use(function (
  req,
  res,
  next
) {
  next(
    createError(404)
  );
});

// Error Handler
app.use(function (
  err,
  req,
  res,
  next
) {
  res.locals.message =
    err.message;

  res.locals.error =
    req.app.get("env") ===
    "development"
      ? err
      : {};

  res.status(
    err.status || 500
  );

  res.render("error");
});

module.exports = app;