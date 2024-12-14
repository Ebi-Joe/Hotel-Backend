const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: { type:String, required:true },
    point: { type:String, required:true },
    description: { type:String, required:true },
    rating: { type:Number, required:true },
    date: { type:Date, required:true, default: Date.now }
}, {timestamps: true})

module.exports = mongoose.model('Review', reviewSchema);