const router = require("express").Router();
const orderModel = require("../models/orders");
const Joi = require("@hapi/joi");

router.post("/", (req, res) => {
  //validating customer order request
  const { error, value } = validateOrder(req.body);
  //checking for bad(400) request error
  if (error) res.status(400).json({ error: error });
  else {
    const order = new orderModel(value);
    order
      .save()
      .then((doc) => {
        if (!doc || doc.length === 0) {
          return res.status(500).json({ error: "failed to store order" });
        }
        res.status(201).json({ data: "order stored successfully" });
      })

      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
});

router.post("/bulk", (req, res) => {
  //validating customer order request
  const { error, value } = validateOrder(req.body, true);
  //checking for bad(400) request error
  if (error) res.status(400).json({ error: error });
  else {
    orderModel.insertMany(value, (err, orders) => {
      if (!orders || orders.length === 0)
        return res.status(500).json({ error: err });
      return res.status(201).json({ data: "orders stored successfully" });
    });
  }
});

//validation for customer order
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
        /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|5|6|7|8)\d)\d{6}$/
      )
    ),
  });

  if (bulk) schema = Joi.array().items(schema);
  return schema.validate(order);
}

module.exports = router;

// sample data

// {
//   "location": {"lat":1.234,"lang":4.566},
//   "products": [
//     {"item":"#79079" , "quantity" : 25},
//     {"item":"#79079" , "quantity" : 25},
//     {"item":"#79079" , "quantity" : 25},
//     {"item":"#79079" , "quantity" : 25}
//   ],
//   "email": "test@yopmail.com",
//   "phone": "+94-77-339-8956"
// }
