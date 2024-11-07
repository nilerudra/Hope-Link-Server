const express = require("express");
const router = express.Router();
const Ngo = require("../models/ngo");

router.get("/", async (req, res) => {
  const users = await Ngo.find({ typeOfNGO: "Water" });
  res.json(users);
});

module.exports = router;
