const express = require("express");
const app = express();

//explicitly creating server to use socket.io
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const morgan = require("morgan");

//enabling cors
var cors = require('cors')
app.use(cors())

const port = process.env.PORT || 3000;

//logger middleware
app.use(morgan("dev"));

//body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//route files
const customerRoute = require("./routes/customer");
app.use("/customer", customerRoute);

const authRoute = require("./routes/auth");
app.use("/auth", authRoute);

const adminRoute = require("./routes/admin");
app.use("/admin", adminRoute);

const storekeeperRoute = require("./routes/storekeeper");
app.use('/storekeeper', storekeeperRoute);

const registrationMail = require("./email/registration-mail");

//root end-point
// app.get("/", (req, res) => {
//   res = {name:{first:'sab',last:'thar'},contact:{email:'sabtharugc0@gmail.com'},role:'sss'}
//   registrationMail(res,'123');
//   res.body('mail test')
// });

io.on("connection", (socket) => {
  let count = 0;
  setInterval(() => {
    count++;
    socket.emit("event", count);
  }, 500);
  console.log("00000dafafad");
});

server.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
