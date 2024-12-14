const RoomType = require('../models/roomType');
const { validateRoomType } = require('../validators');
const cloudinary = require('../config/cloudinary');
const Room = require('../models/room')

exports.createRoomType = async ( req, res ) => {
        const { error } = validateRoomType(req.body);   

        if (error) {
            return res.json(error.details[0].message);
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No images uploaded" });
        }

        const images = [];
        for ( const file of req.files ) {
            try {
                const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
                images.push({ img: result.secure_url });
            } catch (uploadError) {
                console.log("Image Upload Error", uploadError)
                return res.status(500).json({ message: "Image Upload Failed", error: uploadError.message })
            }
        }
        
        try{
            let roomType = await RoomType.findOne({ 
                $or: [
                    { name: req.body.name },
                    { price: req.body.price },
                    { description: req.body.description },
                    { features: req.body.features }
                ]
             })
            if (roomType) {
                return res.status(400).json({ message: "RoomType Already Exists!!", data: roomType })
            }

            roomType = new RoomType ({
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                features: req.body.features,
                info: req.body.info,
                availability: req.body.availability,
                bedType: req.body.bedType,
                rating: req.body.rating,
                review: req.body.review,
                roomSize: req.body.roomSize,
                bedSize: req.body.bedSize,
                occupancy: req.body.occupancy,
                location: req.body.location,
                view: req.body.view,
                roomService: req.body.roomService,
                smoking: req.body.smoking,
                swimmingPool: req.body.swimmingPool,
                images: images,
            })

            const new_roomType_data = await roomType.save();
            return res.status(201).json({ message:"RoomType Successfully Created", data: new_roomType_data })

    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getOneRoomType = async (req, res) => {
    const { id } = req.body;

    try {
        const roomType = await RoomType.findById( id );
        if (!roomType) {
            return res.status(404).json({ message: "RoomType Not Found!!" })
        }
        const availableRoomsNo = await Room.countDocuments({ roomType: roomType, isAvaialable: true })
        const availabilityStatus = availableRoomsNo > 0 ? "Available" : "Soldout";
        res.status(200).json({ message:"Full Info For This RoomType", roomType, availableRoomsNo, availabilityStatus })
    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAllRoomTypes = async (req, res) => {
    try{
        const roomTypes = await RoomType.find();
        if (!roomTypes || roomTypes.length === 0 ) {
            return res.status(400).json({ message: "Roomtype Not Found" })
        }

        const roomTypesWithAvailability = await Promise.all(roomTypes.map(async (roomType) => {
            const rooms = await Room.find({ roomType: roomType._id });
            const roomsNo = rooms.length;
            const availableRoomsNo = await roomType.getTotalAvailableRooms()
            const availabilityStatus = availableRoomsNo > 0 ? "Available" : "Soldout";

            return {
                ...roomType.toObject(),
                roomsNo,
                availableRoomsNo,
                availabilityStatus,
            }
        }))
        res.status(200).json({ message: "All Available RoomTypes", data: roomTypesWithAvailability });
    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });   
    }
}

exports.deleteOneRoomType = async (req, res) => {
    const { id } = req.body

    try {
        const roomType = await RoomType.findByIdAndDelete( id )
        return res.status(200).json({ message:"Roomtype Deleted Successfully", data: roomType })
    }catch ( error ) {
        console.log({ message:error.message })
         return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.updateOneRoomType = async (req, res) => {
    const { id, updates } = req.body

    try {
        const updatedroomType = await RoomType.findByIdAndUpdate( id, updates, {new:true, runValidators: true} )
        if(!updatedroomType) {
            return res.status(404).json({ message: "RoomType Not Found!.." })
        }
        return res.status(200).json({ message: "RoomType Updated Successfully", data: updatedroomType })
    } catch ( error ) {
        console.log({ message:error.message })
         return res.status(500).json({ message: "Internal Server Error" });
    }
}