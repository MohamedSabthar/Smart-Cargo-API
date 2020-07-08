const bcrypt = require("bcrypt");
const router = require("express").Router();
const Joi = require("@hapi/joi");

const userModel = require("../models/users");
const depotModel=require("../models/depot");
const vehicleTypeModel = require("../models/vehicle-type");
const vehicleModel = require("../models/vehicle");

const adminMiddleware = require("../middleware/admin-middleware");


//only admin can execute all the functions implemented here
 //router.use(adminMiddleware);

//driver-registration
router.post("/register-driver", async (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    req.body.password = hash; //store the hashed password
  });

  req.body.role = "driver"; //set the role to driver
  //validating driver registration
  const { error, value } = await validateDriver(req.body);

  //checking for bad(400) request error
  if (error) return res.status(400).json({ error: error });
  const user = new userModel(value);

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

//update driver
router.post("/update-driver/:userId", async (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    req.body.password = hash; //store the hashed password
    const id = req.params.userId;
  });

  const { error, value } = await validateDriver(req.body);

  //checking for bad(400) request error
  if (error) return res.status(400).json({ error: error });

  userModel
    .findByIdAndUpdate({ _id: id }, { $set: req.body })
    .then((result) => {
      //checking if given id does not exist in the database
      if (!result)
        return res.status(400).json({ error: "Driver not found" });
      return res
        .status(200)
        .json({ message: "Driver updated successfully" });
    });
});

//delete driver
router.delete("/delete-driver/:userId", (req, res) => {
  const id = req.params.userId;
  userModel
    .findByIdAndDelete({ _id: id })
    .then((result) => {
      //checking if given id does not exist in the database
      if (!result)
        return res.status(400).json({ error: "Driver not found" });
      return res.status(200).json({ message: "Driver deleted successfully" });
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

//update storekeeper
router.post("/update-storekeeper/:userId", (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    req.body.password = hash; //store the hashed password
    const id = req.params.userId;

    userModel
      .findByIdAndUpdate({ _id: id }, { $set: req.body })
      .then((result) => {
        return res.status(201).json({
          message: "storekeeper updated successfully",
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: err,
        });
      });
  });
});

//delete storekeeper
router.delete("/delete-storekeeper/:userId", (req, res) => {
  const id = req.params.userId;
  userModel
    .findByIdAndDelete({ _id: id })
    .then((result) => {
      return res.status(201).json({
        message: "storekeeper deleted successfully",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err,
      });
    });
});

//driver-registration
router.post("/register-storekeeper", async (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    req.body.password = hash; //store the hashed password
  });

  req.body.role = "storekeeper"; //set the role to driver
  //validating driver registration
  const { error, value } = await validateStoreKeeper(req.body);

  //checking for bad(400) request error
  if (error) return res.status(400).json({ error: error });
  const user = new userModel(value);

  user
    .save()
    .then((result) => {
      return res.status(201).json({
        message: "Store-keeper registered successfully",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err,
      });
    });
});

//validate function for store keeper
async function validateStoreKeeper(user, isUpdate = false, id = null) {
  let query = userModel.find({
    "contact.email": user.contact.email.toLowerCase(),
  });

  //extend the query if the request is update
  if (isUpdate) query.where("_id").ne(id);

  const validation = await query
    .exec()
    .then((drivers) => {
      if (drivers.length >= 1) {
        return { error: "Store-keeper is already registered", value: {} };
      }

      const schema = Joi.object().keys({
        name: {
          first: Joi.string()
            .pattern(/^[A-Za-z]+$/)
            .required(),
          middle: Joi.string().required(),
          last: Joi.string().required(),
        },
        contact: {
          email: Joi.string().email().required().lowercase(),
          phone: Joi.string().pattern(
            /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|5|6|7|8)\d)\d{6}$/
          ),
        },
        address: {
          no: Joi.string().required(),
          street: Joi.string().required(),
          city: Joi.string().required(),
        },
        role: Joi.string().required(),
        password: Joi.string().required().min(8),

      });

      return schema.validate(user, { abortEarly: false });
    })
    .catch((err) => {
      return { error: err, value: {} };
    });
  return validation;
}

router.post("/register-vehicle-type", async (req, res) => {
  //validating vehicle type registration
  const { error, value } = await validateVehicleType(req.body);

  //checking for bad(400) request error
  if (error) return res.status(400).json({ error: error });

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
});

router.put("/update-vehicle-type/:id", async (req, res) => {
  //validating the update request data
  const { error, value } = await validateVehicleType(
    req.body,
    true,
    req.params.id
  );

  if (error) return res.status(400).json({ error: error });

  vehicleTypeModel
    .findByIdAndUpdate(req.params.id, value, { new: false })
    .exec()
    .then((vehicleType) => {
      //checking if given id does not exist in the database
      if (!vehicleType)
        return res.status(400).json({ error: "Vehicle type not found" });
      return res
        .status(200)
        .json({ message: "Vehicle Type updated successfully" });
    });
});

router.delete("/delete-vehicle-type/:id", (req, res) => {
  vehicleTypeModel
    .findByIdAndDelete(req.params.id)
    .exec()
    .then((vehicleType) => {
      //checking if given id does not exist in the database
      if (!vehicleType)
        return res.status(400).json({ error: "Vehicle type not found" });
      return res.status(200).json({ message: "vehicle deleted successfully" });
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

router.post("/register-vehicle", async (req, res) => {
  //validating the vehicle request
  const { error, value } = await validateVehicle(req.body);
  //checking for bad(400) request error
  if (error) return res.status(400).json({ error: error });

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
});

router.put("/update-vehicle/:id", async (req, res) => {
  const { error, value } = await validateVehicle(req.body, true, req.params.id);
  if (error) return res.status(400).json({ error: error });

  vehicleModel
    .findByIdAndUpdate(req.params.id, value, { new: false })
    .exec()
    .then((vehicle) => {
      if (!vehicle)
        return res.status(400).json({ error: "Invalid vehicle id provided" });
      res.status(200).json({ message: "Vehicle details updated successfully" });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
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

router.put("/repair-vehicle/:id", (req, res) => {
  const { error, value } = validateRepair(req.body); // here value is an object with on_repair key and boolean value
  if (error) return res.status(400).json({ error: error });
  vehicleModel
    .findByIdAndUpdate(req.params.id, {
      $set: value,
    })
    .exec()
    .then((vehicle) => {
      //checkig whether the given id exist in database
      if (!vehicle)
        return res.status(400).json({ error: "Invalid id provided" });
      return res.status(200).json({ message: "Vehicle repair status updated" });
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

//validation function for driver
async function validateDriver(user, isUpdate = false, id = null) {
  let query = userModel.find({
    "contact.email": user.contact.email.toLowerCase(),
  });

  //extend the query if the request is update
  if (isUpdate) query.where("_id").ne(id);

  const validation = await query
    .exec()
    .then((drivers) => {
      if (drivers.length >= 1) {
        return { error: "Driver is already registered", value: {} };
      }

      const schema = Joi.object().keys({
        name: {
          first: Joi.string()
            .pattern(/^[A-Za-z]+$/)
            .required(),
          middle: Joi.string().required(),
          last: Joi.string().required(),
        },
        contact: {
          email: Joi.string().email().required().lowercase(),
          phone: Joi.string().pattern(
            /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|5|6|7|8)\d)\d{6}$/
          ),
        },
        address: {
          no: Joi.string().required(),
          street: Joi.string().required(),
          city: Joi.string().required(),
        },
        role: Joi.string().required(),
        password: Joi.string().required().min(8),

        //driver specific details
        license_no: Joi.string(),
        allowed_vehicle: Joi.array().items(Joi.string()), // contians list of _id from vechicleTypeModel
      });

      return schema.validate(user, { abortEarly: false });
    })
    .catch((err) => {
      return { error: err, value: {} };
    });
  return validation;
}

//validation for vehicle-type register & update
async function validateVehicleType(vehicleType, isUpdate = false, id = null) {
  let query = vehicleTypeModel
    .find()
    .where("type")
    .equals(vehicleType.type.toLowerCase());

  //extend the query if the request is update
  if (isUpdate) query.where("_id").ne(id);

  const validation = await query
    .exec()
    .then((types) => {
      if (types.length >= 1) {
        return { error: "Vehicle type already registered", value: {} };
      }

      const schema = Joi.object().keys({
        type: Joi.string()
          .pattern(
            /^[A-Za-z0-9 ]*[A-Za-z0-9][A-Za-z0-9 ]*$/ //allow only letter, numbers & spaces
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
    })
    .catch((err) => {
      return { error: err, value: {} };
    });
  return validation;
}

//validation for vehicle update & register
async function validateVehicle(vehicle, isUpdate = false, id = null) {
  const validation = await vehicleTypeModel
    .findById(vehicle.vehicle_type)
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
        vehicle_type: Joi.string().trim().required(),
        license_plate: Joi.string()
          .trim()
          .pattern(
            /^[A-Za-z]{2,3}[0-9]{4}$/ //regex for licence plate no
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

//validation for repair-vehicle request
function validateRepair(request) {
  const schema = Joi.object().keys({
    on_repair: Joi.bool().required(),
  });
  return schema.validate(request);
}


router.post("/register-depot", async (req, res) => {
  


  const { error, value } = await validateDepot(req.body);

  //checking for bad(400) request error
  if (error) return res.status(400).json({ error: error });
  const depot = new depotModel(value);

  depot
    .save()
    .then((result) => {
      return res.status(201).json({
        message: "depot registered successfully",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err,
      });
    });
});

router.post("/update-depot/:depotId", async (req, res) => {
 
  const id = req.params.depotId;
  const { error, value } = await validateDepot(req.body);
  
  //checking for bad(400) request error
  if (error) return res.status(400).json({ error: error });

  depotModel
    .findByIdAndUpdate({ _id: id }, { $set: req.body })
    .then((result) => {
      //checking if given id does not exist in the database
      if (!result)
        return res.status(400).json({ error: "Depot not found" });
      return res
        .status(200)
        .json({ message: "Depot updated successfully" });
    });
});

router.delete("/delete-depot/:depotId", (req, res) => {
  const id = req.params.depotId;
  depotModel
    .findByIdAndDelete({ _id: id })
    .then((result) => {
      return res.status(201).json({
        message: "depot deleted successfully",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err,
      });
    });
});




async function validateDepot(depot, isUpdate = false, id = null) {
  let query = depotModel.find({
    "address": depot.address.toLowerCase(),
  });

  //extend the query if the request is update
  if (isUpdate) query.where("_id").ne(id);

  const validation = await query
    .exec()
    .then((depots) => {
      if (depots.length >= 1) {
        return { error: "Depot is already registered", value: {} };
      }

      const schema = Joi.object().keys({
        location: { lat: Joi.number().required(), lang: Joi.number().required()},
        address: Joi.string().required()

      });

      return schema.validate(depot, { abortEarly: false });
    })
    .catch((err) => {
      return { error: err, value: {} };
    });
  return validation;
}



//track vehicle post
router.post("/track-vehicle/:id", (req, res) => {
  trackVehicle={
    id:"1234",
    driverId:"34",
    schedule:[{orderId:"o13",lat:"7.98",lang:"8.07",status:"deliverd"},
    {orderId:"o17",lat:"7.00",lang:"8.00",status:"pending"},
    {orderId:"o45",lat:"8.98",lang:"9.07",status:"pending"}
  ]
}
    res.body=trackVehicle;

  return res.status(201).json(res.body);
     
});

//track vehicle get
router.get("/track-vehicle",(req,res) =>{
 data =[{licenseId:"1101",veicleNo:"1234",driverName:"sugan",DriverPhoneNo:"0717897654",vechileType:"lorry",orderDispatchTime:new Date()},
 {licenseId:"1101",veicleNo:"1234",driverName:"sugan",DriverPhoneNo:"0717897654",vechileType:"lorry",orderDispatchTime:new Date()},
 {licenseId:"1101",veicleNo:"1234",driverName:"sugan",DriverPhoneNo:"0717897654",vechileType:"lorry",orderDispatchTime:new Date()},
 {licenseId:"1101",veicleNo:"1234",driverName:"sugan",DriverPhoneNo:"0717897654",vechileType:"lorry",orderDispatchTime:new Date()}
 ]    

    res.body=data;

  return res.status(201).json(res.body);
     
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
