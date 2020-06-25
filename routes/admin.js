const bcrypt = require("bcrypt");
const router = require("express").Router();
const userModel = require("../models/users");
const vehicleTypeModel = require("../models/vehicle-type");
const vehicleModel = require("../models/vehicle");
const Joi = require("@hapi/joi");

const adminMiddleware = require("../middleware/admin-middleware");
const { optional, options, func } = require("@hapi/joi");

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

router.post("/register-vehicle-type", adminMiddleware, async (req, res) => {
  //validating vehicle type registration
  const { error, value } = await validateVehicleType(req.body);

  //checking for bad(400) request error
  if (error) res.status(400).json({ error: error });
  else {
    const vehicleType = new vehicleTypeModel(value);

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
  }
});

router.put("/update-vehicle-type/:id", adminMiddleware, async (req, res) => {
  const { error, value } = await validateVehicleType(
    req.body,
    true,
    req.params.id
  );
  if (error) {
    res.status(400).json({ error: error });
  } else {
    vehicleTypeModel.findByIdAndUpdate(
      req.params.id,
      value,
      { new: false },
      () =>
        res.status(200).json({ message: "Vehicle Type updated successfully" })
    );
  }
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

//validation for register-vehicle type
async function validateVehicleType(vehicleType, isUpdate = false, id = null) {
  let query = vehicleTypeModel
    .find()
    .where("type")
    .equals(vehicleType.type.toLowerCase());
  if (isUpdate) query.where("_id").ne(id);
  const validation = await query.exec().then((types) => {
    if (types.length >= 1) {
      return { error: "Vehicle type already registered", value: {} };
    }

    const schema = Joi.object().keys({
      type: Joi.string()
        .pattern(
          new RegExp(
            /^[A-Za-z0-9 ]*[A-Za-z0-9][A-Za-z0-9 ]*$/ //allow only letter, numbers & spaces
          )
        )
        .lowercase()
        .trim()
        .required(),
      capacity: {
        volume: Joi.number().min(1).required(),
        max_load: Joi.number().min(10).required(),
      },
      fuel_economy: Joi.number().min(1).required(),
    });

    return schema.validate(vehicleType, { abortEarly: false });
  });
  return validation;
}

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
