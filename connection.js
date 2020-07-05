const mongoose = require("mongoose");

const server = "localhost";
const port = "27017";
const database = "SmartCargo";
const user = "admin";
const password = "";

const URL = process.env.MONGODB || `mongodb://${server}:${port}/${database}`;
// const URL = `mongodb://${user}:${password}@${server}:${port}/${database}`;

mongoose.set("useCreateIndex", true);
mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose;
