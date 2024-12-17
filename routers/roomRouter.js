const roomControllers = require('../controllers/roomControllers');
const express = require('express');
const router = express.Router();

router.post("/api/newRoom", roomControllers.newRoom)
router.get("/api/getOne-room", roomControllers.getOneRoom)
router.get("/api/getAll-room", roomControllers.getAllRoom)
router.patch("/api/updateRoom", roomControllers.updateRoom)
router.delete("/api/deleteRoom", roomControllers.deleteRoom)
router.get("/api/getRooms", roomControllers.getAllRoomsInOneRoomtype)

module.exports = router