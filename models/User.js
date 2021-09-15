const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  member: {
    type: Boolean,
    required: true,
    default: true,
  },
  admin: {
    type: Boolean,
    required: true,
    default: true,
  },
  adminMessage: {
    type: String,
    required: true,
  },
});

module.exports = UserSchema;
