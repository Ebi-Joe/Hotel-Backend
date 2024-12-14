const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    roomNo: { type: Number, required: true, unique: true },
    isAvailable: { type: Boolean, default: true }
}, {timestamps: true})

module.exports = mongoose.model("Room", roomSchema);