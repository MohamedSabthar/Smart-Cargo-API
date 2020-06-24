const router = require("express").Router();
const userModel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretkey = process.env.SECRET || "secret";

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
        return res.status(201).json({
          message: "User Created",
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: err,
        });
      });
  });
});

router.post("/sign-in", (req, res) => {
  userModel
    .find()
    .where("contact.email")
    .equals(req.body.email)
    .exec()
    .then((user) => {
      // if no users found for given email throw error
      if (user.length < 1) {
        return res.status(401).json({
          message: "You have entered invalid credentials",
        });
      }
      // else compare the hased password
      bcrypt.compare(req.body.password, user[0].password, (err, isMatched) => {
        if (isMatched) {
          //return jwt token on password match
          const token = jwt.sign(
            {
              _id: user[0]._id,
              role: user[0].role,
              iat: Date.now(),
            },
            secretkey,
            {
              expiresIn: "1h",
            },
          );
          return res.status(200).json({
            message: "You have successfully logged in",
            token: token,
          });
        }
        //return error if password doesn't match or on server error
        if (err) {
          return res.status(500).json({
            error: err,
          });
        }
        return res.status(401).json({
          message: "You have entered invalid credentials",
        });
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err,
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
