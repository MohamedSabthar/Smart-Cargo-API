const mongoose = require("../connection");

const scheduleSchema = new mongoose.Schema({
  orders: [
    {
      orderID: { type: mongoose.Schema.Types.ObjectId ,ref: 'orders' },
    },
  ],
  driverID: {type: mongoose.Schema.Types.ObjectId ,ref: 'users'},
  vehicleID: { type: mongoose.Schema.Types.ObjectId ,ref: 'vehicle' },
  
});

module.exports = mongoose.model("schedules", scheduleSchema);
