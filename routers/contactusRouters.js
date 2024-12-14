const contactUsControllers = require('../controllers/contactUsControllers');
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

router.post("/api/newContact", auth, contactUsControllers.contactUs),
router.get("/api/getAll-contact", contactUsControllers.getAllContact)

module.exports = router