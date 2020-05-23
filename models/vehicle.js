const mongoose = require("../connection");

const vehicleModel = mongoose.Schema({
  type_id: { type: mongoose.Schema.Types.ObjectId }, //reference of vehicle_type (store the _id from vehicle_type)
  license_plate: { type: String },
  // store the maximum , load that can be loaded in to the vehicle
  capacity: { volume: { type: Number }, max_load: { type: String } },
  fuel_economy: { type: Number }, // Km/l
});

module.exports = mongoose.model("vehicles", vehicleModel);
