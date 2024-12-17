const bookingControllers = require('../controllers/bookingControllers');
const express = require('express');
const { auth, admin } = require('../middleware/auth')
const router = express.Router()

router.post("/api/booking", auth, bookingControllers.newBooking)
router.post("/api/payment/verify", auth, bookingControllers.verifyPayments)
router.get("/api/getAll-Bookings", auth, admin, bookingControllers.getAllBookings)

module.exports = router