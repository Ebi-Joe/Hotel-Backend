const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cron = require('node-cron');
const userRouters = require("./routers/userRouters")
const roomTypeRouters =  require("./routers/roomTypeRouters")
const reviewRouters = require("./routers/reviewRouters")
const conciergeRouters = require('./routers/conciergeRouters');
const roomRouters = require('./routers/roomRouter')
const availableRouters = require('./routers/avaiableRouters');
const bookingRouters = require('./routers/bookingRouters')
const contactUsRouters = require('./routers/contactusRouters');
const Room = require('./models/room');
const Booking = require('./models/booking');
const cors = require('cors');
const app = express();

dotenv.config()
connectDB()

// Schedule a task to run every day at 12:00 PM
cron.schedule('0 12 * * *', async () => {
    console.log('Checking for expired bookings...');
    try {
        const now = new Date();
        const expiredBookings = await Booking.find({
            CheckOutDate: { $lte: now },
            status: 'complete' // Only check completed bookings
        });

        for (const booking of expiredBookings) {
            // Update the rooms associated with the booking
            await Room.updateMany(
                { roomType: booking.roomType, isAvailable: false },
                { $set: { isAvailable: true } }
            );
        }

        console.log(`Updated availability for ${expiredBookings.length} bookings.`);
    } catch (error) {
        console.error('Error updating room availability:', error);
    }
});

app.use(cors({
    origin: ["http://localhost:5173", "https://hotel-frontend-ivory.vercel.app"],
    allowedHeaders: ["Content-Type", "Authorization", "auth-token"],
    methods: [ "GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/", userRouters)
app.use("/", roomTypeRouters)
app.use("/", reviewRouters)
app.use("/", conciergeRouters)
app.use("/", roomRouters)
app.use("/", availableRouters)
app.use("/", bookingRouters)
app.use("/", contactUsRouters)

const port = process.env.PORT || 5000
app.listen(port, () => {console.log(`listening on port ${port}`);
})
