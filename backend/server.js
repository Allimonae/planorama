import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const { connect, connection, Schema, model } = mongoose;

const { json } = bodyParser;

const app = express();

// Middleware
app.use(cors());
app.use(json());

// MongoDB connection
connect('mongodb://127.0.0.1:27017/scheduler', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Booking Schema
const bookingSchema = new Schema({
  clubName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  eventTitle: { type: String, required: true },
  purpose: { type: String, required: true },
  numGuests: { type: Number }
});

const Booking = model('Booking', bookingSchema);

// Routes
app.get("/api/bookings", async (req, res) => {
  console.log("GET /api/bookings request received");
  console.log("Request headers:", req.headers);
  try {
    const bookings = await Booking.find();
    console.log("Bookings fetched:", bookings);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { clubName, roomNumber, date, startTime, endTime, eventTitle, purpose, numGuests } = req.body;

    // This checks for time conflicts!
    const existingBooking = await Booking.findOne({
      roomNumber,
      date,
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Room is already booked for this time slot' });
    }

    const booking = new Booking({
      clubName,
      roomNumber,
      date,
      startTime,
      endTime,
      eventTitle,
      purpose,
      numGuests
    });

    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 