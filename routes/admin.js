const bcrypt = require("bcrypt");
const router = require("express").Router();
const userModel = require("../models/users");
const vehicleTypeModel = require("../models/vehicle-type");
const vehicleModel = require("../models/vehicle");
const Joi = require("@hapi/joi");

const adminMiddleware = require("../middleware/admin-middleware");

//only admin can execute all the functions implemented here 
router.use(adminMiddleware);

router.post("/register-driver", (req, res) => {
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

router.post("/register-vehicle-type", async (req, res) => {
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

router.put("/update-vehicle-type/:id", async (req, res) => {
  const { error, value } = await validateVehicleType(
    req.body,
    true,
    req.params.id,
  );
  if (error) {
    res.status(400).json({ error: error });
  } else {
    vehicleTypeModel.findByIdAndUpdate(
      req.params.id,
      value,
      { new: false },
      () =>
        res.status(200).json({ message: "Vehicle Type updated successfully" }),
    );
  }
});

router.post("/register-vehicle", async (req, res) => {
  //validating the vehicle request
  const { error, value } = await validateVehicle(req.body);
  //checking for bad(400) request error
  if (error) res.status(400).json({ error: error });
  else {
    const vehicle = new vehicleModel(value);

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
  }
});

router.put("/update-vehicle/:id", async (req, res) => {
  const { error, value } = await validateVehicle(req.body, true, req.params.id);
  if (error) {
    res.status(400).json({ error: error });
  } else {
    vehicleModel.findByIdAndUpdate(req.params.id, value, { new: false }, () =>
      res.status(200).json({ message: "Vehicle details updated successfully" }),
    );
  }
});

router.delete("/delete-vehicle/:id", (req, res) => {
  vehicleModel
    .findByIdAndDelete(req.params.id)
    .exec()
    .then((vehicle) => {
      //checking whether the given id already exist in database
      if (!vehicle) return res.status(400).json({ error: "vehicle not found" });
      return res.status(200).json({ message: "vehicle deleted successfully" });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err,
      });
    });
});

router.get("/", (req, res) => {
  return res.status(200).json({ message: "test" });
});

//validation for vehicle type registration & update
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
            /^[A-Za-z0-9 ]*[A-Za-z0-9][A-Za-z0-9 ]*$/, //allow only letter, numbers & spaces
          ),
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

//validation for vehicle update & register
async function validateVehicle(vehicle, isUpdate = false, id = null) {
  const validation = await vehicleTypeModel
    .findById(vehicle.type_id)
    .exec()
    .then(async (type) => {
      console.log(type);
      //checking for valid vehicle-type
      if (!type) {
        return { error: "Invalid vehicle type selected", value: {} };
      }

      let query = vehicleModel
        .where("license_plate")
        .equals(vehicle.license_plate.trim().toUpperCase());

      //if validation for update then exclude current vehicle document while checking unique license no
      if (isUpdate) {
        query.where("_id").ne(id);
      }

      let isVehicleAlreadyExist = await query
        .exec()
        .then((vehicles) => {
          if (vehicles.length >= 1)
            //return error if licensce no already exit else return false
            return { error: "Licence plate no already exists", value: {} };
          return false;
        })
        .catch((err) => {
          return { error: err, value: {} };
        });

      if (isVehicleAlreadyExist)
        // return the {error,value} object if vehicle already exists
        return isVehicleAlreadyExist;

      const schema = Joi.object().keys({
        type_id: Joi.string().trim().required(),
        license_plate: Joi.string()
          .trim()
          .pattern(
            new RegExp(
              /^[A-Za-z]{2,3}[0-9]{4}$/, //regex for licence plate no
            ),
          )
          .uppercase()
          .required(),
        on_repair: Joi.bool(),
      });

      return schema.validate(vehicle, { abortEarly: false });
    })
    .catch((err) => {
      return { error: err, value: {} };
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
