const router = require("express").Router();
const userModel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const forgotPassword = require("../email/forgot-password");
const { route } = require("./admin");
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

//this post method will send an forgot password email to the user
router.post("/forgot-password", (req, res) => {
  userModel
    .findOne()
    .where("contact.email")
    .equals(req.body.email)
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          message: "Your email doesn't match with our record",
        });
      }

      //generating a random token and saving it to the database
      let token = generateToken(user._id);

      user.set({ reset_token: token });
      user.save((err, user) => {
        //if any error occured during reset_token update send server error response
        if (err) {
          return res.status(500).json({
            error: err,
          });
        }
        //sent the mail to the user
        forgotPassword(user, token);

        return res.status(200).json({
          message: "We have sent you an email",
        });
      });
    })

    .catch((err) => {
      return res.status(500).json({
        error: err,
      });
    });
});

router.put("/reset-password/:token", (req, res) => {
  try {
    let tokenParams = req.params.token.split("_"); //contains user_id ,random and validity
    //chekcing for the token match in the database
    userModel
      .findById(tokenParams[0])
      .where("reset_token")
      .equals(req.params.token)
      .exec()
      .then((user) => {
        //if no users found then the token is invalid
        if (!user)
          return res
            .status(400)
            .json({ error: "Invalid token provided" });

        // checking for the invalidity of the token
        if (tokenParams[2] < Date.now())
          return res
            .status(400)
            .json({ error: "Request for pasword reset is expired" });

        //need to add password validation here

        //if token valid reset the password
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          }
          user.set({ password: hash }).save((err, user) => {
            //if any error occured during saving password notify the user
            if (err) {
              return res.status(500).json({
                error: err,
              });
            }
            return res
              .status(200)
              .json({ message: "Password rest successful" });

          });
        });
      });
  } catch {
    return res.status(400).json({ error: "Incorrect validity token provided" });
  }
});

function generateToken(id) {
  let validity = Date.now() + 5 * 60000; //adding 5 min from now
  return `${id}_${Math.random().toString(20).substr(2)}_${validity}`;
}

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
