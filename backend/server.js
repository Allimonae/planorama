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
  title: { type: String, required: true },
  date: { type: Date, required: true },
  allDay: { type: Boolean, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  daysOfWeek: { type: [Number], default: [] },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  startRecur: { type: Date, default: null },
  endRecur: { type: Date, default: null },
  groupId: { type: String, default: '' }
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
    const {
      title,
      date,
      allDay,
      start,
      end,
      daysOfWeek,
      startTime,
      endTime,
      startRecur,
      endRecur,
      groupId
    } = req.body;

    const booking = new Booking({
      title,
      date,
      allDay,
      start,
      end,
      daysOfWeek,
      startTime,
      endTime,
      startRecur,
      endRecur,
      groupId
    });

    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(400).json({ message: error.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 