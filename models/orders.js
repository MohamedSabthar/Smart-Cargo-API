const mongoose = require("../connection");

const orderSchema = new mongoose.Schema({
  location: { lat: { type: Number }, long: { type: Number } },
  products: [
    {
      item: { type: String },
      quantity: { type: Number },
    },
  ],
  email: { type: String },
  phone: { type: String },
  emergency_level : { type:String }  // an order can take high/medium/low emergacy_level 
});

module.exports = mongoose.model("orders", orderSchema);
