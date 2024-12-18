const reviewControllers = require('../controllers/reviewControllers');
const express = require('express');
const router = express.Router()

router.post("/api/newReview", reviewControllers.newReview),
router.get("/api/getOne-review", reviewControllers.getOneReview),
router.get("/api/getAll-review", reviewControllers.getAllReview),
router.patch("/api/updateOne-review", reviewControllers.updateOneReview),
router.delete("/api/deleteOne-review", reviewControllers.deleteOneReview)

module.exports = router