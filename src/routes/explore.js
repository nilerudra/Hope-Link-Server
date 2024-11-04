const express = require("express");
const router = express.Router();
const Ngo = require("../models/ngo");

router.get("/", async (req, res) => {
  const users = await Ngo.find({ typeOfNGO: "Water" });
  console.log(users);
  res.json(users); // Send JSON data
});

module.exports = router;
