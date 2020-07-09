const mongoose = require("../connection");

const depotSchema = new mongoose.Schema({
  location: { lat: { type: Number }, lang: { type: Number } },
  address: {type:String}
});

module.exports = mongoose.model("depots", depotSchema);
