const bookingControllers = require('../controllers/bookingControllers');
const express = require('express');
const { auth } = require('../middleware/auth')
const router = express.Router()

router.post("/api/booking", bookingControllers.newBooking)
router.post("/api/payment/verify", bookingControllers.verifyPayments)
router.get("/api/getAll-Bookings",bookingControllers.getAllBookings)
router.post("/api/getUserBookings", bookingControllers.getUserBookings)

module.exports = router