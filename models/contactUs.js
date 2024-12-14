const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema ({
    name: {type: String},
    email: {type: String, unique: true},
    message: {type: String}
}, {timestamps: true})

module.exports = mongoose.model("ContactUs", contactUsSchema);