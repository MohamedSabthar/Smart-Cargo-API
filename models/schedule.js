const mongoose = require("../connection");

const scheduleSchema = new mongoose.Schema({
  orders: [
  { type: mongoose.Schema.Types.ObjectId ,ref: 'orders' },
    
  ],
  route: [
    { type: mongoose.Schema.Types.ObjectId ,ref: 'orders' },
      
    ],
  driver: {type: mongoose.Schema.Types.ObjectId ,ref: 'users'},
  storekeeper: {type: mongoose.Schema.Types.ObjectId ,ref: 'users'},
  vehicle: { type: mongoose.Schema.Types.ObjectId ,ref: 'vehicles' },
  date: {type:Date},
  status : {type:String,default:'pending'} // this field is required for driver mobile application
});

module.exports = mongoose.model("schedules", scheduleSchema);
//testing reattach