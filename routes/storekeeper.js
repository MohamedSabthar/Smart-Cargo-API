const router = require("express").Router();
const vehicleModel = require("../models/vehicle");
const vehicleTypesModel = require("../models/vehicle-type");
const orderModel = require("../models/orders");
const userModel = require("../models/users");
const scheduleModel = require("../models/schedule");
const orders = require("../models/orders");

const storekeeperMiddleware = require("../middleware/storekeeper-middleware");

const axios = require("axios"); // used to make request to routing engine
const { route } = require("./admin");
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
  const emergancyLvl = req.body.emergancyLevels;
  console.log(emergancyLvl);
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

    console.log(vehicles)

  // get all the orders which are ready to deliver
  const orders = await orderModel
    .find()
    .where("status")
    .equals("ready")
    .where("emergency_level")
    .in(emergancyLvl)
    .select("_id location volume load");

    if(orders.length<1) return res.json({schedule:[]});

  console.log(orders);

  const depot = { lat: 1.2345, lang: 2.903 };

  const enineParams = { vehicles, orders, depot };

  //calling spring boot routing engine to break the clusters
  const clusteredOrders = [];
  axios
    .post(`${routingEngineLink}/make-cluster`, enineParams)
    .then(async (response) => {
      let schedule = response.data;
      schedule.forEach((doc) => {
        doc.date = new Date(Date.now());
        clusteredOrders.push(...doc.orders)
      });
      console.log(clusteredOrders);

      //save the resulting cluster
      const result = await scheduleModel.create(schedule);

      await orderModel.updateMany(
        { _id: { $in: clusteredOrders} },
        { $set: { status: "clustered" } },
      );

      return res.json({ schedule: result });
    })
    .catch((error) => {
      // console.log(error);
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

router.put("/assign-driver-to-cluster", (req, res) => {
  console.log(req.body);
});

//get list of orders route param(status) should be ready/pending/delivered/shcheduled
router.get("/orders/:status", (req, res) => {
  orders
    .find()
    .where("status")
    .equals(req.params.status)
    .exec()
    .then((orders) => {
      return res.status(200).json({ orders: orders });
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

router.put("/orders/:id", async (req, res) => {
  //validating the update request data
  const { error, value } = validateOrder(req.body, true);
  //checking for bad(400) request error
  if (error) res.status(400).json({ error: error });
  else {
    orderModel
      .findByIdAndUpdate(req.params.id, value, { new: false })
      .exec()
      .then((order) => {
        //checking if given id does not exist in the database
        if (!order) return res.status(400).json({ error: "order not found" });
        return res.status(200).json({ message: "order updated successfully" });
      });
  }
});

function validateOrder(order, bulk = false) {
  let schema = Joi.object().keys({
    location: {
      lat: Joi.number().required(),
      lang: Joi.number().required(),
    },
    products: Joi.array().items({
      item: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
    }),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(
      new RegExp(
        /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|5|6|7|8)\d)\d{6}$/,
      ),
    ),
  });

  if (bulk) schema = Joi.array().items(schema);
  return schema.validate(order);
}

module.exports = router;
