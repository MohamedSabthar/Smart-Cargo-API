const router = require("express").Router();

// /custmoer/;

router.post("/", (req, res) => {
  // loaction:{lat,long}
  // products:Array<{item,quantity}>
  // e-mail:String
  // phone:String

  const order = {
    loaction: req.body.loaction,
    products: req.body.products,
    email: req.body.email,
    phone: req.body.phone,
  };

  res.status(201).json({
    msg: "order placed",
    order: order,
  });
});

module.exports = router;

// sample data

// {
//     "loaction": [1.234,4.566],
//     "products": [
//     	{"item":"#79079" , "quantity" : 5},
//     	{"item":"#79079" , "quantity" : 5},
//     	{"item":"#79079" , "quantity" : 5},
//     	{"item":"#79079" , "quantity" : 5},
//     ],
//     "email": "abc@yopmail.com",
//     "phone": "+94-77-339-8956",
// }
