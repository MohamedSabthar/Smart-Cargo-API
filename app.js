const express = require("express");
const app = express();
const morgan = require("morgan");

//logger middleware
app.use(morgan("dev"));

//body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//route files
const customerRoute = require("./routes/customer");
app.use("/customer", customerRoute);

app.listen(3000, () => {
  console.log("App listening on port 3000!");
});
