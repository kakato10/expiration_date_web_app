"use strict";

var express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    mongoose = require("mongoose"),
    PORT = 3030;

mongoose.connect("mongodb://localhost/expirationDateApp");

var Product = mongoose.model("Product", {
  productName: String,
  expirationDate: String,
  amount: Number
});

app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", ["X-Requested-With", "Content-Type", "Access-Control-Allow-Methods"]);
  res.header("Access-Control-Allow-Methods", ["DELETE"]);
  next();
});

app.use(bodyParser.json());

// lists all products
app.get("/products", function(req, res) {
  Product.find(function(err, products) {
    res.json(products);
  });
});

// creates a product
app.post("/product", function(req, res) {
  var product = {
    productName: req.body.productName,
    expirationDate: req.body.expirationDate,
    amount:req.body.amount
  };
  console.log(product)
  if(req.body.expirationDate) {
    Product.update({
      productName: req.body.productName,
      expirationDate: req.body.expirationDate
    }, product,{
      upsert: true
    }, function(err) {
      if(err) {
        res.status(500);
        res.json({
          status: "error_on_saving"
        });
      }
      res.json({
        status: "saved"
      });
    });
  }
});

// deletes a product
app.delete("/product/delete", function(req, res) {
  Product.findOneAndRemove({ productName: req.body.productName, expirationDate: req.body.expirationDate},
   function(err) {
      res.json({
        status: "deleted"
      });
  });
});

console.log("App is listening at port: " + PORT);
app.listen(PORT);
