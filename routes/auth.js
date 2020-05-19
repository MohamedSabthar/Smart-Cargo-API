const router = require("express").Router();
const userModel = require("../models/users");
const bcrypt = require("bcrypt");

router.post("/sign-up", (req, res) => {
  //need to add validations
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    req.body.password = hash; //store the hashed password
    const user = new userModel(req.body);

    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User Created",
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  });
});

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
