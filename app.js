const express = require("express");
const app = express();

//explicitly creating server to use socket.io
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const morgan = require("morgan");

const port = process.env.PORT || 3000;

//logger middleware
app.use(morgan("dev"));

//body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//route files
const customerRoute = require("./routes/customer");
app.use("/customer", customerRoute);

//root end-point
app.get("/", (req, res) => {
  res.status(200).json({
    mgs: "test",
  });
});

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
