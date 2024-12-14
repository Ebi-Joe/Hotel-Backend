const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config()

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('CONNECTED TO DATABASE SUCCESSFULLY ');     
    } catch (error) {
        console.log('UNABLE TO CONNECCT TO DATABASE');       
    }
}

module.exports = connectDB