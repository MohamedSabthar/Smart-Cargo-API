const router = require("express").Router();
const vehicleModel = require("../models/vehicle");
const vehicleTypesModel = require("../models/vehicle-type");
const orderModel = require("../models/orders");
const userModel = require("../models/users");
const scheduleModel = require("../models/schedule");

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

router.put("/assign-driver-to-cluster", (req, res) => {
  console.log(req.body);
});

//get list of orders route param(status) should be ready/pending/delivered/shcheduled
router.get("/orders/:status", (req, res) => {
  orderModel
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

router.put("/add-order-dimension/:id", (req, res) => {
  console.log(req.params.id);
  console.log(req.body);
  orderModel
    .findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    )
    .exec()
    .then((result) => {
      return res.status(200).json({ msg: result });
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

module.exports = router;
