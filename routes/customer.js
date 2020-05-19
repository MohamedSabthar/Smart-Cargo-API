const router = require("express").Router();
const orderModel = require("../models/ordres");

// /custmoer/;

router.post("/", (req, res) => {
  const order = new orderModel(req.body);
  order
    .save()
    .then((doc) => {
      if (!doc || doc.length === 0) {
        return res.status(500).send(doc);
      }
      res.status(201).send(doc);
    })

    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;

// sample data

// {
//   "loaction": {"lat":1.234,"long":4.566},
//   "products": [
//     {"item":"#79079" , "quantity" : 25},
//     {"item":"#79079" , "quantity" : 25},
//     {"item":"#79079" , "quantity" : 25},
//     {"item":"#79079" , "quantity" : 25}
//   ],
//   "email": "test@yopmail.com",
//   "phone": "+94-77-339-8956"
//}
