const express = require("express");
const app = express();

//explicitly creating server to use socket.io
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const cron = require("node-cron");
const cronModel = require("./models/cron");
const orderModel = require("./models/orders");

const morgan = require("morgan");

//enabling cors
const cors = require("cors");
app.use(cors());

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
app.use("/storekeeper", storekeeperRoute);

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

// run scheduler every day to increase priority
//cron will check every 12 hours (is priority updated?)
cron.schedule("* * 23 * *", () => {
  console.log("cronjob running");
  let currentDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
    0,
    0,
    0,
    0,
  );
  cronModel.findOne({}, {}, { sort: { created_at: -1 } }, function (err, doc) {
    let lastLogDate;
    if (doc != null) lastLogDate = new Date(doc.date);
    //if priorities already updated today then skip else update priority
    if (doc == null || lastLogDate.getTime() != currentDate.getTime()) {

      //update increasing the priority (1:high,2:normal,3:low);
      orderModel.where("emergency_level").equals(2).updateMany({ $set: { emergency_level:1  }}).exec();
      orderModel.where("emergency_level").equals(3).updateMany({ $set: { emergency_level:2  }}).exec();

      const log = new cronModel({ date: currentDate });
      log
        .save()
        .then((log) => console.log("log added to cron"))
        .catch((err) => console.log(err));
    } else {
      console.log("log is already created");
    }
  });
});
