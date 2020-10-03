const router = require("express").Router();
const vehicleModel = require("../models/vehicle");
const vehicleTypesModel = require("../models/vehicle-type");
const orderModel = require("../models/orders");
const userModel = require("../models/users");
const scheduleModel = require("../models/schedule");
const orders = require("../models/orders");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const storekeeperMiddleware = require("../middleware/storekeeper-middleware");

const axios = require("axios"); // used to make request to routing engine
const { route } = require("./admin");
const Joi = require("@hapi/joi");
const users = require("../models/users");
const routingEngineLink = process.env.ROUTING_ENGINE || "http://localhost:8080";

//only admin and storekeeper can execute all the functions implemented here
router.use(storekeeperMiddleware);

router.get("/vehicles", (req, res) => {
  //retun list of vehicles
  vehicleModel
    .find({})
    .exec()
    .then((vehicles) => {
      return res.status(200).json({ vehicles: vehicles });
    })
    .catch((err) => {
      return res.status(400).json({ error: err });
    });
});

router.get("/vehicle/:id", (req, res) => {
  vehicleModel
    .findById(req.params.id)
    .exec()
    .then((vehicle) => {
      //checking whether the given id available in the database
      if (!vehicle)
        return res.status(400).json({ error: "Invalid vehicle id presented" });
      //return the details of the vehicle if id is valid
      return res.status(200).json({ vehicle: vehicle });
    })
    .catch((err) => {
      return res.status(400).json({ error: err });
    });
});

router.get("/vehicle-types", (req, res) => {
  //retun list of vehicle types
  vehicleTypesModel
    .find({})
    .exec()
    .then((vehicleTypes) => {
      return res.status(200).json({ vehicle_types: vehicleTypes });
    })
    .catch((err) => {
      return res.status(400).json({ error: err });
    });
});

router.get("/vehicle-types/:id", (req, res) => {
  vehicleTypesModel
    .findById(req.params.id)
    .exec()
    .then((vehicleTypes) => {
      //checking whether the given id available in the database
      if (!vehicleTypes)
        return res
          .status(400)
          .json({ error: "Invalid vehicle type id presented" });
      //return the details of the vehicle type if id is valid
      return res.status(200).json({ vehicle_types: vehicleTypes });
    })
    .catch((err) => {
      return res.status(400).json({ error: err });
    });
});

router.post("/make-cluster", async (req, res) => {

  // get the request(emergancy level) form client
  const emergancyLvl = 1; 
  req.setTimeout(5 * 1000);
  //get the curruntly available vehicles from the database;
  const vehicles = await vehicleModel
    .find()
    .where("is_available")
    .equals(true)
    .where("on_repair")
    .equals(false)
    .populate({
      path: "vehicle_type",
      select: "-_id capacity",
    })
    .select("_id");

  // get all the orders which are ready to deliver
  const orders = await orderModel
    .find()
    .where("status")
    .equals("ready")
    .where("emergency_level")
    .lte(emergancyLvl)
    .select("_id location volume load");

  const depot = { lat: 1.2345, lang: 2.903 };

  const enineParams = { vehicles, orders, depot };

  //calling spring boot routing engine to break the clusters
  axios
    .post(`${routingEngineLink}/make-cluster`, enineParams)
    .then(async (response) => {
      let schedule = response.data;
      schedule.forEach((doc) => {
        doc.date = new Date(Date.now());
      });
      console.log(schedule);

      //save the resulting cluster
      const result = await scheduleModel.create(schedule);

      return res.json({ schedule: result });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get("/drivers", (req, res) => {
  userModel
    .find()
    .where("role")
    .equals("driver")
    .select("-password -__v")
    .exec()
    .then((drivers) => {
      return res.status(200).json({ drivers: drivers });
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

router.put("/assign-driver-to-cluster",(req,res)=>{
  console.log(req.body);
})

//get list of orders route param(status) should be ready/pending/delivered/shcheduled
router.get("/orders/:status",(req,res)=>{
  orders.find().where("status").equals(req.params.status).exec().then((orders)=>{
    return res.status(200).json({orders:orders});
  }).catch((err)=>{
    return res.status(500).json({error:err});
  })
});

router.put("/orders", async (req, res) => {
  //validating the update request data
  const { error, value } = validateOrder(req.body, true);
  //checking for bad(400) request error
  if (error || req.body.id == null) res.status(400).json({ error: error });
  else {
    orderModel.findByIdAndUpdate(req.body.id, {load:value.load, volume:value.volume})
    .exec()
    .then((order) => {
      //checking if given id does not exist in the database
      if (!order)
        return res.status(400).json({ error: "order not found" });
      return res
        .status(200)
        .json({ message: "order updated successfully" });
    });
  }

  

 
});

//get user details in setting page 
router.get("/settings/:userId", async (req,res) => {
  const id = req.params.userId;

  userModel.findById({ _id: id }).then((result) => {
    console.log(result);
    return res.status(201).json({
      result
    });
  })  
  .catch((err) => {
    return res.status(500).json({
      error: err,
    });
  });
});

//update user profile details
router.put("/settings/:userId", async (req,res) => {
  const id = req.params.userId;
  const { error, value } = await validateUserProfile(req.body, true, id);

  //checking for bad(400) request error 
  if (error) return res.status(400).json({ error: error });

  userModel.findByIdAndUpdate({ _id: id }, { $set: value }).then((result) => {
    //checking if given id does not exist in the database
    if (!result) return res.status(400).json({ error: "UserProfile not found" });
    return res.status(200).json({ message: "User Profile updated successfully" });
  });
});

//validating user profile update 
async function validateUserProfile(user, isUpdate = false, id = null) {
  let query = userModel.find({
    "contact.email": user.contact.email.toLowerCase(),
  });

  //extend the query if the request is update
  if (isUpdate) query.where("_id").ne(id);

  const validation = await query
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return { error: "User Profile is already registered", value: {} };
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
            /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|5|6|7|8)\d)\d{6}$/,
          ),
        },
        address: {
          no: Joi.string().required(),
          street: Joi.string().required(),
          city: Joi.string().required(),
        },
      });

      return schema.validate(user, { abortEarly: false });
    })
    .catch((err) => {
      return { error: err, value: {} };
    });
  return validation;
}

//change password in user profile
router.put("/profile-password/:userId", async (req,res) => {
  const id = req.params.userId;

  if(!req.body.old_password || !req.body.new_password)
    return res.status(401).json({
      message: "You have entered invalid credentials",
    });

    userModel.findById({ _id: id}).then((user) => {
      // if no user found for given email throw error 
      if (user.length < 1) {
        return res.status(401).json({
          message: "You have entered invalid credentials",
        });
      }
      //else compare the hased old password
      bcrypt.compare(req.body.old_password, user[0].password, (err, isMatched) => {
        if (isMatched) {
          //else compare the hased new password
          bcrypt.compare(req.body.new_password, user[0].password, (err, isMatched) => {
            if (isMatched) {
              return res.status(401).json({
                message: "Your old password and new password are same",
              });
            }
            //return error if password doesn't match or on server error
            if (err) {
              return res.status(500).json({
                error: err,
              });
            }
            //if password not same then change password
            if (!isMatched) {
              user[0].password = req.body.new_password ;
              return res.status(200).json({
                message: "You have successfully changed password",
              });
            }
          });
        }
        //return error if password doesn't match or on server error
        if (err) {
          return res.status(500).json({
            error: err,
          });
        }
        return res.status(401).json({
          message: "Invalid password",
        });
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err,
      });
    });
});

function validateOrder(order, bulk = false) {
  const schema = Joi.object().keys({
   volume:  Joi.number().required() , 
   load: Joi.number().required()
  });
  return schema.validate(order);
}

module.exports = router;
