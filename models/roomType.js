const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required:true },
    description: { type: String, required:true },
    features: { type: String, required:true },
    info: { type: String, required:true },
    availability: { type: String, required:true },
    bedType: { type: String, required:true },   
    rating: { type: Number, required:true },
    review: { type: Number, required:true },
    roomSize: { type: String, required:true },
    bedSize: { type: String, required:true },
    occupancy: { type: String, required:true },
    location: { type: String, required:true },
    view: { type: String, required:true },
    roomService: { type: String, required:true },
    smoking: { type: String, required:true },
    swimmingPool: { type: String, required:true },
    images: [{ img: { type: String, required:true }}],
}, {timestamps: true} )

roomTypeSchema.methods.getTotalRooms = async function () {
    const Room = require('./room')
    const room = await Room.find({ roomType: this._id })
    return room.length;
}

roomTypeSchema.methods.getTotalAvailableRooms = async function () {
    const Room = require('./room')
    const availableRooms = await Room.find({ roomType: this._id, isAvailable: true });
    return availableRooms.length;
}

module.exports = mongoose.model('RoomType', roomTypeSchema)