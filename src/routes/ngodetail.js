const express = require('express');
const Ngo=require("../models/ngodetails")
const router = express.Router();



router.post('/', async (req, res) => {
    try {
      const {
        ngoName,
        registrationNumber,
        yearOfEstablishment,
        typeOfNGO,
        country,
        state,
        city,
        address,
        contactNumber,
        email,
        website,
        founders,
        ceo
      } = req.body;
  
      // Create a new NGO instance
      const newNGO = new Ngo({
        ngoName,
        registrationNumber,
        yearOfEstablishment,
        typeOfNGO,
        country,
        state,
        city,
        address,
        contactNumber,
        email,
        website,
        founders,
        ceo
      });
  
      // Save the NGO instance to the database
      const savedNGO = await newNGO.save();
  
      res.status(201).json({ message: 'NGO registered successfully!', ngo: savedNGO });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while registering the NGO.', error });
    }
  });

  module.exports = router;