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
const Joi = require("@hapi/joi");
const users = require("../models/users");
const depotModel = require("../models/depot");
const routingEngineLink = process.env.ROUTING_ENGINE || "http://localhost:8080";

//only admin and storekeeper can execute all the functions implemented here
router.use(storekeeperMiddleware);

router.get("/vehicles", (req, res) => {
  //retun list of vehicles
  vehicleModel
    .find({ $or: [{ deleted: { $exists: false } }, { deleted: false }] })
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
    .find({ $or: [{ deleted: { $exists: false } }, { deleted: false }] })
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
//validating the input
  if (emergancyLvl == null || emergancyLvl == [])
    return res.status(400).json({ error: "emergancyLevels can't be empty" });
  console.log(emergancyLvl);
  req.setTimeout(5 * 1000);
  //get the curruntly available vehicles from the database;
  const vehicles = await vehicleModel
    .find({ $or: [{ deleted: { $exists: false } }, { deleted: false }] })
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

  const depot = await depotModel.findOne();

  const enineParams = { vehicles, orders, depot };

  //calling spring boot routing engine to break the clusters
  const clusteredOrders = [];
  axios
    .post(`${routingEngineLink}/make-cluster`, enineParams)
    .then(async (response) => {
      let schedule = response.data;
      schedule.forEach((doc) => {
        doc.date = new Date(Date.now());
        doc.storekeeper = req.middleware._id;//accessing the user object from middleware and assing it to schedule object
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
    .find({ $or: [{ deleted: { $exists: false } }, { deleted: false }] })
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

//get the list of orders which's dimensions are not added
router.get("/new-orders", (req, res) => {
  orderModel
    .find()
    .exec()
    .then((orders) => {
      return res.status(200).json({ orders: orders });
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

//method to update the orders with their dimensions
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
        status: "ready",
      })
      .exec()
      .then((order) => {
        //checking if given id does not exist in the database
        if (!order) return res.status(400).json({ error: "order not found" });
        return res.status(200).json({ message: "order updated successfully" });
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
  userModel.findByIdAndUpdate({ _id: id }, { $set: value },{
    new: true
  }).then((result) => {
    //checking if given id does not exist in the database
    if (!result) return res.status(400).json({ error: "UserProfile not found" });
    return res.status(200).json({ message: "User Profile updated successfully",result : result });
  });
});

//old password confirm check
router.put("/password-change/:userId", async (req,res) => {
  const id = req.params.userId;

  if(!req.body.old_password || !req.body.new_password || !req.body.confirm_password)
    return res.status(401).json({
      message: "You have entered invalid credentails",
    });
    userModel.findById({ _id: id }).then((user) => {
      bcrypt.compare(req.body.old_password, user.password, (err, isMatched) => {
        if(isMatched) {
          //compare new password and confirm password
          bcrypt.compare(req.body.new_password, req.body.confirm_password, (err, isMatched) => {
            //if new password and confirm password same check 
            if(isMatched){
              //change new password to hash
              bcrypt.hash(req.body.new_password, 10, (err, hash) => {
                if (err) {
                  return res.status(500).json({
                    error: err,
                  });
                }
                user.set({ password: hash }).save((err, user) => {
                  //if any error occured during saving password notify  the user
                  if (err) {
                    return res.status(500).json({
                      error: err,
                    });
                  }
                  return res
                    .status(200)
                    .json({ message: "password changed successful"});
                });
              });

            }
            //return error if password doesn't match or an sever errot
            if (err) {
              return res.status(500).json({
                error: err,
              });
            }
            return res.status(401).json({
              message: "You have entered not same password"
            });
          });

        }
        //return error if password desnt match or on server error
        if (err) {
          return res.status(500).json({
            error: err,
          });
        }
        return res.status(401).json({
          message: "you have entered invalid passwords"
        });
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err,
      });
    });
});

//validating user profile update 
async function validateUserProfile(user, isUpdate = false, id = null) {
  let query = userModel.find({
    "_id": id,
  });

  //extend the query if the request is update
  if (isUpdate) query.where("_id").ne(id);
  const validation = await query
    .exec()
    .then((userdoc) => {
      if (userdoc.length < 1) {
        return { error: "Can't find user", value: {} };
      }
      const schema = Joi.object().keys({
        name: {
          first: Joi.string()
            .pattern(/^[A-Za-z]+$/)
            .required(),
          middle: Joi.string(),
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

function validateOrder(order, bulk = false) {
  const schema = Joi.object().keys({
    volume: Joi.number().required(),
    load: Joi.number().required(),
    id: Joi.string().required(),
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

  // //don't allow to update another route
  // if (cluster.route != null && cluster.route.length > 0)
  //   return res.status(200).json({ route: cluster });

  let clusterOrders = cluster.orders;

  const depot = await depotModel.findOne();;

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

router.get("/scheduled-orders", (req, res) => {
  scheduleModel
    .find()
    .populate({
      path: "orders",
    })
    .populate({
      path: "vehicle",
      populate: {
        path: "vehicle_type",
      },
    })
    .populate({
      path: "route",
    })
    .sort({ date: "desc" })
    .exec()
    .then((schedules) => {
      return res.status(200).json({ schedules: schedules });
    })
    .catch((err) => {
      return res.status(400).json({ error: err });
    });
});

// list all the orders which are of status "ready" and return high,medium and low urgency orders seperately as json
router.get("/orders", async (req, res) => {
  const high = await orderModel
    .find()
    .where("status")
    .equals("ready")
    .where("emergency_level")
    .equals(1)
    .select("_id location");
  const medium = await orderModel
    .find()
    .where("status")
    .equals("ready")
    .where("emergency_level")
    .equals(2)
    .select("_id location");
  const low = await orderModel
    .find()
    .where("status")
    .equals("ready")
    .where("emergency_level")
    .equals(3)
    .select("_id location");
  return res.status(200).json({ high, medium, low });
});


//list of scheduled orders for dashboard
router.get("/clustered-statistics", async (req, res) => {
  scheduleModel.find().populate({
    path:"orders"
  })
  // .aggregate(
    // [ 
    //   {
    //     $group: {
    //       _id:{ date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }},
    //       orders: {$sum :{ $size: "$orders" }}
    //     }
    //   }
    // ])
  .exec().then((clusters) => {
    let statistics= {}
    let high = {}
    let medium = {}
    let low = {}
    clusters.forEach((cluster)=>{
      let date = new Date(cluster.date)
      
      if(date.toISOString().split('T')[0] in statistics)
       {
          statistics[date.toISOString().split('T')[0]] += cluster.orders.length
        cluster.orders.forEach((order)=>{
          if(order.emergency_level==1) date.toISOString().split('T')[0] in high ? high[date.toISOString().split('T')[0]]=+1 : high[date.toISOString().split('T')[0]]=1;
          else if (order.emergency_level==2)  date.toISOString().split('T')[0] in medium ? medium[date.toISOString().split('T')[0]]+=1 : medium[date.toISOString().split('T')[0]]=1;
          else if(order.emergency_level==3)  date.toISOString().split('T')[0] in low ? low[date.toISOString().split('T')[0]]+=1 : low[date.toISOString().split('T')[0]]=1;
        })
      }
      else
     {
        statistics[date.toISOString().split('T')[0]]= cluster.orders.length
        cluster.orders.forEach((order)=>{
          if(order.emergency_level==1) date.toISOString().split('T')[0] in high ? high[date.toISOString().split('T')[0]]+=1 : high[date.toISOString().split('T')[0]]=1;
          else if (order.emergency_level==2)  date.toISOString().split('T')[0] in medium ? medium[date.toISOString().split('T')[0]]+=1 : medium[date.toISOString().split('T')[0]]=1;
          else if(order.emergency_level==3)  date.toISOString().split('T')[0] in low ? low[date.toISOString().split('T')[0]]+=1 : low[date.toISOString().split('T')[0]]=1;
        })
      }
    
    })
    console.log("total")
    console.log(statistics)
    console.log("high")
    console.log(high)
    console.log("medium")
    console.log(medium)
    console.log("low")
    console.log(low)

    return res.status(200).json({ total:statistics,high : high,medium : medium, low: low});
  })
  .catch((err)=>{
    return res.status(400).json({ error: err});
  });


});


router.get("/depot", (req, res) => {
  depotModel
    .findOne()
    .exec()
    .then((depot) => {
      return res.status(200).json({ depot: depot });
    });
});

module.exports = router;
