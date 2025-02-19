const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema ({
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    currency: { type: String },
    email: { type: String, required: true },
    roomType: { type: mongoose.Schema.Types.ObjectId, ref: "RoomType", required: true },
    roomName: { type: String },
    rooms: { type: String },
    CheckInDate: { type: Date },
    CheckInTime: { type: String},
    CheckOutDate: { type: Date },
    CheckOutTime: { type: String},
    totalDays: { type: Number },
    amount: { type: Number, required: true },
    transactionId: { type: String },
    status: { type: String, default: "Pending" },

}, {timestamps: true})

module.exports = mongoose.model("Booking", bookingSchema);