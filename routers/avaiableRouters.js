const availableControllers = require('../controllers/availableControllers');
const express = require('express');
const router = express.Router()

router.post("/api/checkAvailability", availableControllers.checkAvailability)

module.exports = router