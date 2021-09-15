const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const ejs = require("ejs");
const engine = require("ejs-layout");
const passport = require("passport");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const session = require("express-session");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const MongoStore = require("connect-mongo");
const app = express();
const socket = require("socket.io");
const port = 5000;
dotenv.config({
  path: path.join(__dirname, ".env"),
});

console.log(port);
const server = app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

const io = socket(server);
app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
io.on("connection", (socket) => {
  console.log("made socket connection", socket.id);

  socket.on("chat", (data) => {
    io.sockets.emit("chat", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", engine.__express);
app.use(expressLayouts);
app.set("layout extractScripts", true);
app.set("layout", "layouts/layout");
const ejsOptions = {
  async: true,
};
app.engine("ejs", async (path, data, cb) => {
  try {
    let html = await ejs.renderFile(path, data, ejsOptions);
    cb(null, html);
  } catch (e) {
    cb(e, "");
  }
});
require("./db");

// mongo sessions setup
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "cats",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);

//passport init
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.isAuth = req.isAuthenticated();
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = app;
