const mongoose = require("../connection");

const scheduleSchema = new mongoose.Schema({
  orders: [
  { type: mongoose.Schema.Types.ObjectId ,ref: 'orders' },
    
  ],
  driver: {type: mongoose.Schema.Types.ObjectId ,ref: 'users'},
  vehicle: { type: mongoose.Schema.Types.ObjectId ,ref: 'vehicles' },
  
});

module.exports = mongoose.model("schedules", scheduleSchema);
