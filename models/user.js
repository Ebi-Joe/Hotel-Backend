const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    firstName: {type:String, required:true},
    lastName: {type:String, required:true },
    email: {type:String, required:true, unique:true },
    password: {type:String, required:true },
    role: {type:String, enum:['Guest','Admin'], default:'Guest'},
    isverified: { type: Boolean, default: false}
}, {timestamps: true})

userSchema.methods.generateVerifyToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role, action: 'SignUp' },
         process.env.JWT_SECRET_KEY,
        { expiresIn: '1d' }
    );
}

userSchema.methods.generateLoginToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
         process.env.JWT_SECRET_KEY
    )
}

userSchema.methods.generatePasswordResetToken = function () {
    return jwt.sign(
        { id: this._id, action: 'resetPassword'},
        process.env.JWT_SECRET_KEY,
        { expiresIn: '30m' }
    )
}

module.exports = mongoose.model('User', userSchema)