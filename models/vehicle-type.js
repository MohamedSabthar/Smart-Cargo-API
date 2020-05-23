const mongoose = require("../connection");

const vehicleTypeModel = mongoose.Schema({
  type: { type: Number }, //ex: lorry / three-wheel
});

module.exports = mongoose.model("vehicle_types", vehicleTypeModel);
