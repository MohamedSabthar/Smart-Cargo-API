const mongoose = require("../connection");

const userSchema = new mongoose.Schema({
  name: {
    first: { type: String },
    middle: { type: String },
    last: { type: String },
  },
  contact: { email: { type: String }, phone: { type: String } },
  address: {
    no: { type: String },
    street: { type: String },
    city: { type: String },
  },
  role: { type: String },
  password: { type: String },
});

module.exports = mongoose.model("users", userSchema);
