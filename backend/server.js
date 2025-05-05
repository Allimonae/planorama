import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import fetch from 'node-fetch';
import csv from 'csv-parser';

const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdfuwB5qRixGAcF7Ma_F8vmCk-Pl2Te20F3UsAbUEgwop4Jp5SMJEe0H-QZTRzWecAx2WlXWphYeXR/pub?output=csv';

dotenv.config();

const { connect, connection, Schema, model } = mongoose;
const { json } = bodyParser;
const app = express();

app.use(cors());
app.use(json());

// MongoDB connection
connect('mongodb://127.0.0.1:27017/scheduler', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Booking Schema
const bookingSchema = new Schema({
  title: String,
  date: Date,
  allDay: Boolean,
  start: Date,
  end: Date,
  daysOfWeek: [Number],
  startTime: String,
  endTime: String,
  startRecur: Date,
  endRecur: Date,
  groupId: String
});

const Booking = model('Booking', bookingSchema);

// GET route: Combine DB + CSV
app.get('/api/bookings', async (req, res) => {
  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();

    const events = [];

    const stream = Readable.from([csvText]);
    stream
      .pipe(csv())
      .on('data', (data) => {
        // ⚙️ Optional: Parse fields into proper types
        events.push({
          id: data.id,
          title: data.title,
          date: new Date(data.date),
          allDay: data.allDay === 'TRUE',
          start: new Date(data.start),
          end: new Date(data.end),
          daysOfWeek: data.daysOfWeek ? data.daysOfWeek.split(',').map(Number) : [],
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          startRecur: data.startRecur ? new Date(data.startRecur) : null,
          endRecur: data.endRecur ? new Date(data.endRecur) : null,
          groupId: data.groupId || ''
        });
      })
      .on('end', async () => {
        const dbBookings = await Booking.find();
        res.json([...dbBookings, ...events]);
      });
  } catch (err) {
    console.error("Error fetching CSV or DB data:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST route
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving booking:', err);
    res.status(400).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
