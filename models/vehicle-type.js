const mongoose = require("../connection");

const vehicleTypeModel = mongoose.Schema({
  type: { type: Number }, //ex: lorry / three-wheel
  // store the maximum , load that can be loaded in to the vehicle
  capacity: { volume: { type: Number }, max_load: { type: String } },
  fuel_economy: { type: Number }, // Km/l
});

module.exports = mongoose.model("vehicle_types", vehicleTypeModel);
