const mongoose = require("../connection");
const { bool, boolean } = require("@hapi/joi");

const userSchema = new mongoose.Schema({
  //common user details (admin,driver & store-keeper)
  name: {
    first: { type: String },
    middle: { type: String },
    last: { type: String },
  },
  contact: { email: { type: String }, phone: { type: String } },
  address: {
    no: { type: String },
    street: { type: String },
    city: { type: String },
  },
  role: { type: String },
  password: { type: String },

  //to validate password reset
  reset_token: { type: String },

  //driver specific details
  license_no: { type: String },
  allowed_vehicle: { type: [mongoose.Schema.Types.ObjectId] }, // contians list of _id from vechicleTypeModel
  user_is_available: { type: Boolean, default: true },

  //softdelete
  deleted:{type:Boolean, default:false}
});

module.exports = mongoose.model("users", userSchema);
