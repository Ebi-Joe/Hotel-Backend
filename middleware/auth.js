const User = require('../models/user');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config()

const auth = async (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({ message: "Unauthorized"})
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
            const user = await User.findById(decoded.id).select("-password")
            if (!user) {
                return res.status(404).json({ message: "User Not Found" });
            }
            req.user = user
            next()
        } catch (error) {
            console.log({ message: error.message })
            return res.status(400).json({ message: "Invalid Token" })
        }
    }
}

const admin = async (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ message:"Access Denied!." });
    }
    next();
};

module.exports = { auth, admin}