const mongoose = require('mongoose');

const availableSchema = new mongoose.Schema({
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    totalRooms: { type: Number, enum: [1, 2, 3], required: true }
}, {timestamps: true})

module.exports = mongoose.model("Available", availableSchema)