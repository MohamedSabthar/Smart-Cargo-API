const bcrypt = require("bcrypt");
const router = require("express").Router();
const userModel = require("../models/users");
const vehicleTypeModel = require("../models/vehicle-type");
const vehicleModel = require("../models/vehicle");

const adminMiddleware = require("../middleware/admin-middleware");

router.post("/register-driver", adminMiddleware, (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    req.body.password = hash; //store the hashed password
    req.body.role = "driver"; //set the role to driver
    const user = new userModel(req.body);

    user
      .save()
      .then((result) => {
        return res.status(201).json({
          message: "driver registered successfully",
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: err,
        });
      });
  });
});

router.post("/register-vehicle-type", adminMiddleware, (req, res) => {
  const vehicleType = new vehicleTypeModel(req.body);

  vehicleType
    .save()
    .then((result) => {
      return res.status(201).json({
        message: "vehicle type registered successfully",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err,
      });
    });
});

router.post("/register-vehicle", adminMiddleware, (req, res) => {
  const vehicle = new vehicleModel(req.body);

  vehicle
    .save()
    .then((result) => {
      return res.status(201).json({
        message: "vechile registered successfully",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err,
      });
    });
});

router.get("/", adminMiddleware, (req, res) => {
  return res.status(200).json({ message: "test" });
});

module.exports = router;

//sample data for driver-registration

// {
// 	"name": {
//     "first": "first-name",
//     "middle": "middle-name",
//     "last": "last-name"
//   },
//   "contact": { "email": "email@yopmail.com", "phone": "+94773398389" },
//   "address": {
//     "no": "353/A",
//     "street": "street-name",
//     "city": "city-name"
//   },
//   "role": "admin",
//   "password": "plain-password"
// }
