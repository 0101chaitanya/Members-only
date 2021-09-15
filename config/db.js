const mongoose = require("mongoose");
const UserSchema = require("../models/User");
require("dotenv").config();
const RequestSchema = require("../models/Request");
const connection = mongoose.createConnection(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const User = connection.model("User", UserSchema);
const Request = connection.model("Request", RequestSchema);
module.exports = connection;
