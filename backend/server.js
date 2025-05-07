import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { OpenAI } from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdfuwB5qRixGAcF7Ma_F8vmCk-Pl2Te20F3UsAbUEgwop4Jp5SMJEe0H-QZTRzWecAx2WlXWphYeXR/pub?output=csv';


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


// ROUTE FOR AI ASSISTANT REQUESTS
app.post('/api/ask', async (req, res) => {
  const { message } = req.body;

  try {
    // Get today's date in America/New_York timezone
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York'
    });

    // Fetch DB events
    const dbBookings = await Booking.find();

    // Fetch and parse CSV events
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    const csvEvents = [];

    const stream = Readable.from([csvText]);
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => {
          const parsedDate = new Date(data.date);
          csvEvents.push({
            title: data.title,
            date: !isNaN(parsedDate) ? parsedDate.toISOString() : null,
            start: data.startTime,
            end: data.endTime
          });
          
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Combine and format all events
    const allEvents = [
      ...dbBookings.map((e) => ({
        title: e.title,
        date: e.date.toLocaleDateString(), // otherwise the timezones don't match
        start: e.startTime,
        end: e.endTime
      })),
      ...csvEvents
    ];

    // Format for prompt: readable and normalized
    const eventsText = allEvents.map((e) => {
      const formattedDate = new Date(e.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/New_York'
      });

      return `• ${e.title} on ${formattedDate} from ${e.start || 'N/A'} to ${e.end || 'N/A'}`;
    }).join('\n');

    // Prompt for OpenAI
    const prompt = `
Today is ${today}.
You are a calendar assistant. The user has the following events:

${eventsText}

Answer the following question using only the data above. If nothing matches, say so:

User: ${message}
`;

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: `You are a cheerful, friendly AI assistant that helps users manage their calendar. 
          You speak in an upbeat, encouraging tone, and use casual phrasing when appropriate. 
          Always stay helpful, polite, and make the user feel welcome.` 
        },
        { role: 'user', content: prompt }
      ]
    });

    const reply = chatResponse.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ message: 'Something went wrong talking to the assistant.' });
  }
});
