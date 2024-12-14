const Booking = require('../models/booking')
const Room = require('../models/room');
const transporter = require("../config/email")
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

exports.newBooking = async (req, res) => {
    const { firstName, lastName, phone, email, currency, roomType, roomName, rooms, CheckInDate, CheckOutDate, amount, totalDays } = req.body;

    const availableRooms = await Room.find({ roomType, isAvailable: true }).limit(rooms);

    if (availableRooms.length < rooms) {
        return res.status(400).json({ message: "Not enough rooms available" });
    }

    try {
        const bookingId = uuidv4()
        const paymentData = {
            tx_ref: bookingId,
            amount,
            currency,
            redirect_url: 'http://localhost:5173/login',
            customer: {
                email,
                name: firstName,
                phonenumber: phone,
            },
            meta: {
                firstName,
                lastName,
                phone,
                email,
                roomType,
                roomName,
                rooms,
                CheckInDate,
                CheckOutDate,
                totalDays,
            },
            customizations: {
                title: `Hotel Booking's Payments for ${roomName}`,
            }
        }

        const response = await fetch('https://api.flutterwave.com/v3/payments',{
            method: "POST",
            headers: {
                Authorization: `Bearer ${FLW_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
          });

          const data = await response.json();

          if ( data.status === "success" ) {
            res.json({ link: data.data.link, bookingId })
          } else {
            res.json("Payment Failed")
            console.log(data);
            
          }
    } catch ( error ) {
        console.log({ message: "Error Initiating Payment" })
    }
}

exports.verifyPayments = async (req, res) => {
    const { bookingId, transaction_id } = req.body;
    try {
        const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${FLW_SECRET_KEY}`,
            }
        })
        const data = await response.json();

        if (response.ok) {
            const booking = new Booking({
                bookingId,
                firstName: data.data.meta.firstName,
                lastName: data.data.meta.lastName,
                phone: data.data.meta.phone,
                email: data.data.meta.email,
                roomType: data.data.meta.roomType,
                roomName: data.data.meta.roomName,
                rooms: data.data.meta.rooms,
                CheckInDate: data.data.meta.CheckInDate,
                CheckOutDate: data.data.meta.CheckOutDate,
                totalDays: data.data.meta.totalDays,
                amount: data.data.amount,
                status: "complete"
            })

            await booking.save()

            // Find the available rooms to mark as sold out
            const roomsToUpdate = await Room.find({
                roomType: data.data.meta.roomType,
                isAvailable: true
            }).limit(data.data.meta.rooms);

            // Update the rooms individually
            for (const room of roomsToUpdate) {
                room.isAvailable = false;
                await room.save();
            }

            // Send confirmation email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: data.data.meta.email,
                subject: "Booking Confirmation - Your Reservation is Confirmed",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
                        <h2 style="text-align: center; color: #6dc234;">Booking Confirmation</h2>
                        <p>Dear <strong>${data.data.meta.firstName} ${data.data.meta.lastName}</strong>,</p>
                        <p>Your booking has been successfully confirmed. Below are the details of your reservation:</p>
                        <ul>
                            <li><strong>Booking ID:</strong> ${bookingId}</li>
                            <li><strong>Room Type:</strong> ${data.data.meta.roomType}</li>
                            <li><strong>Room Name:</strong> ${data.data.meta.roomName}</li>
                            <li><strong>Number of Rooms:</strong> ${data.data.meta.rooms}</li>
                            <li><strong>Check-In Date:</strong> ${data.data.meta.CheckInDate}</li>
                            <li><strong>Check-Out Date:</strong> ${data.data.meta.CheckOutDate}</li>
                            <li><strong>Total Days:</strong> ${data.data.meta.totalDays}</li>
                            <li><strong>Amount Paid:</strong> ${data.data.currency} ${data.data.amount}</li>
                        </ul>
                        <p>We look forward to hosting you and ensuring your stay is comfortable.</p>
                        <p style="color: #777; font-size: 12px;">If you have any questions, feel free to contact our support team.</p>
                        <p style="margin-top: 20px;">Best regards,</p>
                        <p><strong>The Hotel Team</strong></p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions)

            console.log(booking)
            res.json({ message: "Payment Confirmed and Email Sent", booking })
        } else {
            res.json({ message: "Payment Failed!!..." })
        }
    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getAllBookings = async (req, res) => {
    try {
        const allBookings = await Booking.find()
          // Map over bookings to format createdAt
          const formattedBookings = allBookings.map((booking) => {
            const createdAt = booking.createdAt ? new Date(booking.createdAt) : null;
            const checkInDate = booking.CheckInDate ? new Date(booking.CheckInDate) : null;
            const checkOutDate = booking.CheckOutDate ? new Date(booking.CheckOutDate) : null;

            return {
                ...booking._doc, // Spread original document
                createdAtDate: createdAt ? createdAt.toDateString() : null,
                createdAtTime: createdAt ? createdAt.toTimeString().split(" ")[0] : null,
                CheckInDate: checkInDate ? checkInDate.toDateString() : null,
                CheckOutDate: checkOutDate ? checkOutDate.toDateString() : null,
            };
        });
        return res.status(200).json( formattedBookings )
    } catch (error) {
        console.log({ message: error.message })
        return res.status(500).json({ message: "Internal Server Error" });
    }
}