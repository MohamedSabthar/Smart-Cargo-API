const mongoose = require("../connection");

const orderSchema = new mongoose.Schema({
  location: { lat: { type: Number }, long: { type: Number } },
  products: [
    {
      item: { type: String },
      quantity: { type: String },
    },
  ],
  email: { type: String },
  phone: { type: String },
});

module.exports = mongoose.model("orders", orderSchema);
