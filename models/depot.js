const mongoose = require("../connection");

const depotSchema = new mongoose.Schema({
  location: { lat: { type: Number }, long: { type: Number } },
  address: {type:String}
});

module.exports = mongoose.model("orders", depotSchema);
