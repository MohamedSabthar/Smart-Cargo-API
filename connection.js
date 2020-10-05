const mongoose = require("mongoose");

const server = "localhost";
const port = "27017";
const database = "SmartCargo";
const user = "admin";
const password = "";

const URL = process.env.MONGODB || `mongodb://${server}:${port}/${database}`;
// const URL = `mongodb+srv://root:ucsc%40123%24@cluster0-qdla2.mongodb.net/SmartCargo?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass%20Community&retryWrites=true&ssl=true`;

mongoose.set("useCreateIndex", true);
mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

module.exports = mongoose;
