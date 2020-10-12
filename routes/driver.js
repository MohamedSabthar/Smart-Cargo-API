const router = require("express").Router();
const scheduleModel = require("../models/schedule");
const userModel = require("../models/users");
const orderModel = require("../models/orders");
const driverMiddleware = require("../middleware/driver-middleware");
const { required } = require("@hapi/joi");

//only driver can execute all the functions implemented here
router.use(driverMiddleware);

router.get("/", (req, res) => {
  scheduleModel
    .findOne({})
    .where("driver")
    .equals(req.middleware._id)
    .where("status")
    .equals("pending")
    .populate({
      path: "vehicle",
      populate: {
        path: "vehicle_type",
      },
    })
    .populate({ path: "route" })
    .exec()
    .then((schedule) => {
      return res.status(200).json({ schedule: schedule });
    })
    .catch((error) => {
      return res.status(500).json({ error: error });
    });
});

router.get("/profile", (req, res) => {
  userModel
    .findById(req.middleware._id)
    .select("-password -reset_token -__v -allowed_vehicle")
    .exec()
    .then((driver) => {
      return res.status(200).json({ profile: driver });
    })
    .catch((error) => {
      return res.status(500).json({ error: error });
    });
});

router.put("/deliverd/:id", (req, res) => {
  orderModel
    .findByIdAndUpdate(
      req.params.id,
      { $set: { status: "delivered" } },
      { new: true },
    )
    .exec()
    .then((order) => {
      return res.status(200).json({ order: order });
    })
    .catch((error) => {
      return res.status(500).json({ error: error });
    });
});

router.put("/schedule/:id",  (req, res) => {
  scheduleModel
    .findByIdAndUpdate(
      req.params.id,
      { $set: { status: "delivered" } },
      { new: true },
    )
    .exec()
    .then(async (cluster) => {

      //update the driver availability to true
      const driver = await userModel
        .findByIdAndUpdate(
          cluster.driver,
          { $set: { user_is_available: true } },
          { new: true },
        )
        
      return res.status(200).json({ order: cluster });
    })
    .catch((error) => {
      return res.status(500).json({ error: error });
    });
});

module.exports = router;
