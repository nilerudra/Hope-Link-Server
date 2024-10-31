const express = require("express");
const router = express.Router();
const Donar = require("../models/donar");

router.get('/', async(req, res) => {
    const donars = await Donar.find().sort({ amount: -1 }).limit(10);
    res.json(donars);  // Send JSON data
  });

  module.exports = router;

