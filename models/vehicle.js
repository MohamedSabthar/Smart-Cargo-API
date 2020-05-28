const mongoose = require("../connection");

const vehicleModel = mongoose.Schema({
  type_id: { type: mongoose.Schema.Types.ObjectId }, //reference of vehicle_type (store the _id from vehicle_type)
  license_plate: { type: String },
  on_repair: { type: Boolean }, // feild to indicate whether the vehicle is available or not
});

module.exports = mongoose.model("vehicles", vehicleModel);
