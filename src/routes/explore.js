const express = require("express");
const router = express.Router();
const User = require("../models/users");



  router.get('/', async(req, res) => {
    const users = await User.find({role:"ngo"});
    console.log(users);
    res.json(users);  // Send JSON data
  });

  
module.exports = router;