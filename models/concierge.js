const mongoose = require('mongoose');

const conciergeSchema = new mongoose.Schema({
    name: { type:String, required:true },
    images: [{ img: { type: String, required: true}}],
    email: { type:String, required:true, unique:true },
    phone: { type:Number, required:true },
    date: { type:String, required:true },
    description: { type:String, required:true },
}, { timestamps: true })

module.exports = mongoose.model("Concierge", conciergeSchema)