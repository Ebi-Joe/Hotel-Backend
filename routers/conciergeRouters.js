const conciergeControllers = require('../controllers/conciergeControllers');
const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const uploads = multer({ storage:storage });

router.post("/api/newConcierge", uploads.array("img", 1), conciergeControllers.newConcierge)
router.get("/api/getOne-concierge", conciergeControllers.getOneConcierge)
router.get("/api/getAll-concierges", conciergeControllers.getAllConcierge)
router.delete("/api/deleteOne-concierge", conciergeControllers.deleteOneConcierge)
router.patch("/api/updateOne-concierge", conciergeControllers.updateOneConcierge)

module.exports = router