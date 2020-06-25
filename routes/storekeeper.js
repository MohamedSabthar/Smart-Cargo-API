const router = require("express").Router();
const vehicleModel = require("../models/vehicle");
const storekeeperMiddleware = require("../middleware/storekeeper-middleware");

//only admin and storekeeper can execute all the functions implemented here
router.use(storekeeperMiddleware);

router.get("/vehicles",(req,res)=>{
    //retun list of vehicles
    vehicleModel.find({}).exec().then((vehicles)=>{
        return res.status(200).json({vehicles:vehicles})
    }).catch((err)=>{
        return res.status(400).json({error:err});
    })
});

router.get("/vehicle/:id", (req, res) => {
  console.log("hit");
  vehicleModel
    .findById(req.params.id)
    .exec()
    .then((vehicle) => {
      //checking whether the given id available in the database
      if (!vehicle)
        return res.status(400).json({ error: "Invalid vehicle id presented" });
      //return the details of the vehicle if id is valid
      return res.status(200).json({vehicle:vehicle});
    })
    .catch((err) => {
      return res.status(400).json({ error: err });
    });
});

module.exports = router;
