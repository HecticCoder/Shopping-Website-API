const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const mongoose = require("mongoose");
router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id")
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        products: doc.map((docs) => {
          return {
            name: docs.name,
            price: docs.price,
            _id: docs._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + docs._id,
            },
          };
        }),
      };
      if (doc.length >= 0) {
        res.status(200).json(response);
      } else {
        res.status(404).json({
          message: "No existing data",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
router.post("/", (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Handling POST requests to products",
        product: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "POST",
            url: "http://localhost:3000/products/" + result._id,
          },
        },
      });
    })
    .catch((err) => console.log(err));
});
router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc) {
        res.status(200).json({
          product: {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
          },
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + doc._id,
          },
        });
      } else {
        res.status(404).json({ message: "No data exists for the given id" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.updateOne({ _id: id }, { $set: req.body })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Product is updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "the data is deleted",
        url: "http://localhost:3000/products/",
        request: {
          type: "POST",
          body: {
            name: "string",
            price: "number",
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
