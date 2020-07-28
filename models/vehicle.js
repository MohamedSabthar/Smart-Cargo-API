const mongoose = require("../connection");

const vehicleModel = mongoose.Schema({
  vehicle_type: { type: mongoose.Schema.Types.ObjectId ,ref: 'vehicle_types' }, //reference of vehicle_type (store the _id from vehicle_type)
  license_plate: { type: String },
  is_available : {type:Boolean,default:true}, // feild to indicate the vehicle is currently on a delivery process
  on_repair: { type: Boolean, default: false },// feild to indicate whether the vehicle is available or not
  capacity: { type: Number }, 
  fuel_economy: { type: Number },
  load: { type: Number}
});

module.exports = mongoose.model("vehicles", vehicleModel);
