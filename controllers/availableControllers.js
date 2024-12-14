const Available = require('../models/availability');
const { validateAvailability } = require('../validators')
const RoomType = require('../models/roomType');
const Room = require('../models/room');

exports.checkAvailability = async (req, res) => {
    const { startDate, endDate, totalRooms } = req.body;
    const { error } = validateAvailability(req.body);
    if ( error ) {
        return res.status(400).json({ message: error.details[0].message })
    }

    try {
        const roomTypes = await RoomType.find();
        if (!roomTypes.length) {
            return res.status(404).json({ message: "No room types found." });
        }
        const availableRoomTypes = []

        for (  const roomType of roomTypes ) {
            const totalRooms = await roomType.getTotalAvailableRooms()
            const bookedRooms = await Room.find({
                roomType: roomType._id,
                $or: [
                    { startDate: { $lte: endDate, $gte: startDate }},
                    { endDate: { $gte: startDate, $lte: endDate }}
                ],
            });
            const availableRoomCount = totalRooms - bookedRooms.length;
            if ( availableRoomCount > 0 ) {
                availableRoomTypes.push({
                    roomType: roomType,
                    availableRooms : availableRoomCount
                })
            }
        }
        return res.status(200).json({ message: "Available Room Types Available Now", data: availableRoomTypes })
    } catch ( error ) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}