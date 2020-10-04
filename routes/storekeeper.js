const router = require("express").Router();
const vehicleModel = require("../models/vehicle");
const vehicleTypesModel = require("../models/vehicle-type");
const orderModel = require("../models/orders");
const userModel = require("../models/users");
const scheduleModel = require("../models/schedule");

const storekeeperMiddleware = require("../middleware/storekeeper-middleware");

const axios = require("axios"); // used to make request to routing engine
const { route } = require("./admin");
const Joi = require("@hapi/joi");
const orders = require("../models/orders");
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

  console.log(vehicles);

  // get all the orders which are ready to deliver
  const orders = await orderModel
    .find()
    .where("status")
    .equals("ready")
    .where("emergency_level")
    .in(emergancyLvl)
    .select("_id location volume load");

  if (orders.length < 1) return res.json({ schedule: [] });

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
        clusteredOrders.push(...doc.orders);
      });
      console.log(clusteredOrders);

      //save the resulting cluster
      const result = await scheduleModel.create(schedule);

      await orderModel.updateMany(
        { _id: { $in: clusteredOrders } },
        { $set: { status: "clustered" } },
      );

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
  userModel
    .findById(req.body.driver)
    .exec()
    .then((driverDoc) => {
      console.log(driverDoc);
      if (!driverDoc || driverDoc.role != "driver")
        return res.status(400).json({ error: "Invalid driver_id provided" });
    })
    .catch((err) => {
      return res.status(400).json({ error: "Invalid driver_id provided" });
    });

  scheduleModel
    .findByIdAndUpdate(
      req.body._id,
      { $set: { driver: req.body.driver } },
      { new: true },
    )
    .exec()
    .then((cluster) => {
      //checking if given id does not exist in the database
      if (!cluster)
        return res.status(400).json({ error: "Invalid cluster_id provided" });
      return res
        .status(200)
        .json({ message: "driver assigned successfully", cluster: cluster });
    })
    .catch((err) => {
      return res.status(400).json({ error: "Invalid cluster_id provided" });
    });
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

// add order dimention of given order
router.put("/add-order-dimension", async (req, res) => {
  //validating the update request data
  const { error, value } = validateOrder(req.body, true);
  //checking for bad(400) request error
  if (error || req.body.id == null) res.status(400).json({ error: error });
  else {
    orderModel
      .findByIdAndUpdate(req.body.id, {
        load: value.load,
        volume: value.volume,
      })
      .exec()
      .then((order) => {
        //checking if given id does not exist in the database
        if (!order) return res.status(400).json({ error: "order not found" });
        return res.status(200).json({ message: "order updated successfully" });
      });
  }
});

function validateOrder(order, bulk = false) {
  const schema = Joi.object().keys({
    volume: Joi.number().required(),
    load: Joi.number().required(),
  });
  return schema.validate(order);
}

//generate the route for the given cluster
router.post("/generate-route", async (req, res) => {
  if (req.body.id == null) return res.status(400).json({ error: error });
  const cluster = await scheduleModel
    .findById(req.body.id)
    .populate({
      path: "orders",
      select: "_id location",
    })
    .populate({
      path: "route",
      select: "_id location",
    })
    .select("-_id"); //last .select("-_id") statement removes the id of the cluster

  if (cluster.route != null && cluster.route.length > 0)
    return res.status(200).json({ route: cluster });

  let clusterOrders = cluster.orders;

  const depot = { _id: "hardcoded", location: { lat: 1.234, lang: 4.566 } };

  const enineParams = { orders: [depot, ...clusterOrders] }; //need to send the depot as the first object to the routing engine

  console.log(enineParams);

  //call the routing engine to generate route
  axios
    .post(`${routingEngineLink}/generate-route`, enineParams)
    .then(async (response) => {
      console.log(response.data);
      //update the generated route to database
      await scheduleModel.findByIdAndUpdate(
        req.body.id,
        {
          $set: { route: response.data },
        },
        { new: true },
      );

      //return the route with populated orders
      const route = await scheduleModel
        .findById(req.body.id)
        .populate({
          path: "orders",
          select: "_id location",
        })
        .populate({
          path: "route",
          select: "_id location",
        })
        .select("-_id"); //last .select("-_id") statement removes the id of the cluster

      //update the status of routed orders as sheduled
      await orderModel.updateMany(
        { _id: { $in: response.data } },
        { $set: { status: "sheduled" } },
      );

      return res.status(200).json({ route: route });
    })
    .catch((error) => console.log(error));
});

// list all the orders which are of status "ready" and return high,medium and low urgency orders seperately as json
router.get("/orders",async (req,res)=>{
  const high = await orderModel.find().where("status").equals("ready").where("emergency_level").equals(1).select("_id location");
  const medium = await orderModel.find().where("status").equals("ready").where("emergency_level").equals(2).select("_id location");
  const low = await orderModel.find().where("status").equals("ready").where("emergency_level").equals(3).select("_id location");
  return res.status(200).json({high,medium,low});
});

module.exports = router;
