const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RequestSchema = new Schema({
  identity: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Type: {
    type: String,
    required: true,
    default: ["member"],
    enum: ["member", "admin"],
  },
});

module.exports = RequestSchema;

//mongoose.model("request", RequestSchema);
