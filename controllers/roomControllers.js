const Room = require('../models/room');
const { validateRoom } = require('../validators')
const RoomType = require('../models/roomType')

exports.newRoom = async (req, res) => {
    const { error } = validateRoom(req.body)
    const { roomType, roomNo } = req.body;

    if ( error ) {
        return res.json( error.details[0].message )
    }

    try {
        let room = await Room.findOne({ roomType, roomNo })
        if ( room ) {
            return res.status(400).json ({ message: "Room Already Exists", data: room })
        }

        const existingRoomType = await RoomType.findById( roomType );
        if ( !existingRoomType ) {
            return res.status(404).json({ message: "RoomType Not Found" })
        }

        newRoom = new Room ({
            roomType: req.body.roomType,
            roomNo: req.body.roomNo
        })

        const new_room_data = await newRoom.save()
        return res.status(200).json({ message: "Room Created Successfully", data: new_room_data })

    } catch ( error ) {
        console.log({ messsage: error.message})
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getOneRoom = async (req, res) => {
    const { id } = req.body;
    try {
        const room = await Room.findById( id )
        if ( !room ) {
            return res.status(404).json({ message: "Room Not Found" })
        }
        return res.status(200).json({ data: room })
    } catch ( error ) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAllRoom = async ( req, res) => {
    try{
        const rooms = await Room.find().populate("roomType");
        const roomCount = rooms.length;
        if ( !rooms ) {
            return res.status(404).json({ message: "No Rooms Available" })
        }
        //mapping through the rooms
        const roomData = rooms.map(room => ({
            roomType: {
                id: room.roomType._id,
                name: room.roomType.name
            },
            roomId: room._id,
            roomNo: room.roomNo,
            isAvailable: room.isAvailable,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt 
        }));
        return res.status(200).json({ message: "All Rooms Available ", rooms: roomCount, data: roomData })
    } catch ( error ) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAllRoomsInOneRoomtype = async ( req, res ) => {
    const { roomType } = req.body;

    if (!roomType) {
        return res.status(400).json({ message: "RoomType ID is required" });
    }

    try {
        const Rooms = await Room.find({ roomType: roomType })
        if ( Rooms.length === 0 ) {
            return res.status(404).json({ message: "No Rooms Found For This Roomtype" })
        }
        return res.status(200).json({ message: "Rooms Available In This RoomType", data: Rooms })
    } catch ( error ) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.updateRoom = async (req, res) => {
    const { id, updates } = req.body;

    try {
        const updatedRoom = await Room.findByIdAndUpdate( id, updates, {new: true, runValidators: true} )
        if ( !updatedRoom ) {
            return res.status(404).json({ message: "Room Not Found" })
        }
        return res.status(200).json({ message: "Room Updated Successfully", data: updatedRoom })
    } catch ( error ) {
        console.log({ messsage: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.deleteRoom = async (req, res) => {
    const { id } = req.body;

    try {
        const deletedRoom = await Room.findByIdAndDelete( id )
        if (!deletedRoom) {
            return res.status(404).json({ message: "Room Not Found" })
        }
        return res.status(200).json({ message: "Room Deleted Successfully", data: deletedRoom })
    } catch ( error ) {
        console.log({ message: error.message})
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
