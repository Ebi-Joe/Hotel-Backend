const roomTypeControllers = require('../controllers/roomTypeControllers');
const express = require('express');
const router = express.Router()
const { auth, admin } = require('../middleware/auth')
const multer = require('multer');

const storage = multer.memoryStorage();
const uploads = multer({ storage:storage });

router.post("/api/new-roomType", auth, admin, uploads.array("img", 10), roomTypeControllers.createRoomType),
router.get("/api/getOne-roomType", roomTypeControllers.getOneRoomType),
router.get("/api/getAll-roomType", roomTypeControllers.getAllRoomTypes),
router.delete("/api/deleteOne-roomType", roomTypeControllers.deleteOneRoomType),
router.patch("/api/updateOne-roomType", roomTypeControllers.updateOneRoomType)

module.exports = router