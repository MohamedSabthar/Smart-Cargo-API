const router = require("express").Router();
const scheduleModel = require("../models/schedule");
const driverMiddleware = require("../middleware/driver-middleware");
const vehicle = require("../models/vehicle");
const { where } = require("../models/vehicle");

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

module.exports = router;
