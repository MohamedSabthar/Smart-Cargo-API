const bcrypt = require("bcrypt");
const router = require("express").Router();
const userModel = require("../models/users");

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

router.post("/register-vehicle", adminMiddleware, (req, res) => {});

module.exports = router;

//sample data for sign-up

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
