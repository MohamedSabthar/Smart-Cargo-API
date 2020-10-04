const mongoose = require("../connection");

const depotSchema = new mongoose.Schema({
  date: {type:Date, required: true}
});

module.exports = mongoose.model("cron", depotSchema);
