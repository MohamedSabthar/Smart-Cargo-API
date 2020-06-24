const bcrypt = require("bcrypt");
const router = require("express").Router();
const Joi = require("@hapi/joi");

const userModel = require("../models/users");
const vehicleTypeModel = require("../models/vehicle-type");
const vehicleModel = require("../models/vehicle");

const adminMiddleware = require("../middleware/admin-middleware");
const { route } = require("./customer");

//driver-registration
router.post("/register-driver", adminMiddleware, (req, res) => {
  
  const { error, value } =  validateDriver(req.body);
  
  if (error) res.status(400).json({ error: error });
  else {
    
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      }
      req.body.password = hash; //store the hashed password
      req.body.role = "driver"; //set the role to driver
      const user = new userModel(req.body);
  
       //validating customer order request
  
     
      
      //email validation for distinct data
      userModel.find({"contact.email":user.contact.email}, function (err, docs) {
        if (docs.length){
          return res.status(500).json({
            message: "driver already inserted",
            error: err,
          });
        }else{
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
        }
    });
  
  
  
      
    });

  }
  
  
 
});

//update driver
router.post("/update-driver/:userId", adminMiddleware, (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    req.body.password = hash; //store the hashed password
    const id = req.params.userId;

    userModel
      .findByIdAndUpdate({ _id: id }, {$set: req.body})
      .then((result) => {
        return res.status(201).json({
          message: "driver updated successfully",
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: err,
        });
      });
  });
});

//delete driver
router.delete("/delete-driver/:userId", adminMiddleware, (req, res) => { 
  const id = req.params.userId;
  userModel.findByIdAndDelete({ _id: id })
    .then((result) => {
      return res.status(201).json({
        message: "driver deleted successfully",
      });
    }).catch((err) => {
      return res.status(500).json({
        error: err,
      });
     });
});



//storekeeper registration
router.post("/register-storekeeper", adminMiddleware, (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    req.body.password = hash; //store the hashed password
    req.body.role = "storekeeper"; //set the role to driver
    const user = new userModel(req.body);

    user
      .save()
      .then((result) => {
        return res.status(201).json({
          message: "storekeeper registered successfully",
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: err,
        });
      });
  });
});

//update storekeeper
router.post("/update-storekeeper/:userId", adminMiddleware, (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    req.body.password = hash; //store the hashed password
    const id = req.params.userId;

    userModel
      .findByIdAndUpdate({ _id: id }, {$set: req.body})
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
router.delete("/delete-storekeeper/:userId", adminMiddleware, (req, res) => { 
  const id = req.params.userId;
  userModel.findByIdAndDelete({ _id: id })
    .then((result) => {
      return res.status(201).json({
        message: "storekeeper deleted successfully",
      });
    }).catch((err) => {
      return res.status(500).json({
        error: err,
      });
     });
});




router.post("/register-vehicle-type", adminMiddleware, (req, res) => {
  const vehicleType = new vehicleTypeModel(req.body);

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

router.post("/register-vehicle", adminMiddleware, (req, res) => {
  const vehicle = new vehicleModel(req.body);

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

router.get("/", adminMiddleware, (req, res) => {
  return res.status(200).json({ message: "test" });
});



//validation function for driver
function validateDriver(user) {
  const schema = Joi.object().keys({

    name: {
      first: Joi.string().required(),
      middle: Joi.string(),
      last: Joi.string().required(),
    },
    contact: { email: Joi.string().email().required(), phone: Joi.string().pattern(
      new RegExp(
        /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|5|6|7|8)\d)\d{6}$/,
      ),
    ), },
    address: {
      no: Joi.string().required(),
      street: Joi.string().required(),
      city: Joi.string().required(),
    },
    role: Joi.string().required(),
    password: Joi.required(),
  
    //driver specific details
     license_no: Joi.string().required(),
     allowed_vehicle: Joi.number().required(), // contians list of _id from vechicleTypeModel
  }
);

  return schema.validate(user);
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
