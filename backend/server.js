import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { getWeatherForecast } from './weather.js';
import { DateTime } from 'luxon';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const { connect, connection, Schema, model } = mongoose;
const { json } = bodyParser;
const app = express();

app.use(cors());
app.use(json());

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/scheduler"; 

app.listen(MONGODB_URI, () => {console.log(`MongoDB connected to ${MONGODB_URI}`)});

// MongoDB connection
connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  sslValidate: false
})
.then(() => {
  console.log("Connected to MongoDB!");
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
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
  // startTime: Date,
  // endTime: Date,
  startRecur: Date,
  endRecur: Date,
  groupId: String,
  backgroundColor: String,
  borderColor: String
});

const Booking = model('Booking', bookingSchema);

// GET route: DB only
app.get('/api/bookings', async (req, res) => {
  try {
    const dbBookings = await Booking.find();
    const formattedDbBookings = dbBookings.map(b => ({
      id: b._id.toString(),
      title: b.title,
      start: b.start?.toISOString(),
      end: b.end?.toISOString(),
      // startTime: b.startTime,
      // endTime: b.endTime,
      // daysOfWeek: b.daysOfWeek,
      allDay: b.allDay || false,
      backgroundColor: b.backgroundColor,
      borderColor: b.borderColor
    }));
    res.json(formattedDbBookings);
  } catch (err) {
    console.error("Error fetching DB data:", err);
    res.status(500).json({ message: err.message });
  }
});

function nyToUTC(dateStr) {
  return DateTime.fromISO(dateStr, { zone: 'America/New_York' }).toUTC().toJSDate();
}

// POST route
app.post('/api/bookings', async (req, res) => {
  try {
    const { title, date, start, end, backgroundColor, borderColor, daysOfWeek } = req.body;

    const utcStart = nyToUTC(start);
    const utcEnd = nyToUTC(end);
    const bookingDate = new Date(date);

    const overlappingBooking = await Booking.findOne({
      $or: [
        {
          start: { $lt: new Date(end) },
          end: { $gt: new Date(start) }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: 'This time slot overlaps with another booking.'
      });
    }

    const booking = new Booking({
      ...req.body,
      start: utcStart,
      end: utcEnd,
      // startTime: startTime ? utcStart : '',
      // endTime: endTime ? utcEnd : ''
    });

    const saved = await booking.save();
    res.status(201).json(saved);

  } catch (err) {
    console.error('Error saving booking:', err);
    res.status(400).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


  // DELETE ROUTE
  app.delete('/api/bookings/:id', async (req, res) => {
    try {
      const result = await Booking.findByIdAndDelete(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json({ message: 'Event deleted successfully' });
    } catch (err) {
      console.error('Error deleting event:', err);
      res.status(500).json({ message: err.message });
    }
  });

// ROUTE FOR AI ASSISTANT REQUESTS
app.post('/api/ask', async (req, res) => {
  const { message, history } = req.body;

  try {
    const now = new Date();
    const currentDateTime = now.toLocaleString('en-US', {
    const now = new Date();
    const currentDateTime = now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York'
    });    
    
    });    
    
    const dbBookings = await Booking.find();

    const allEvents = dbBookings.map((e) => {
      const nyStart = new Date(e.start);
      const nyEnd = new Date(e.end);
      const nyDate = new Date(e.date);

      return {
        title: e.title,
        date: nyDate,
        start: nyStart.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/New_York'
        }),
        end: nyEnd.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/New_York'
        }),
        daysOfWeek: e.daysOfWeek,
        backgroundColor: e.backgroundColor,
        borderColor: e.borderColor,
      };
    });

    const weatherForecast = await getWeatherForecast(40.7128, -74.0060);
    console.log("Weather forecast data:", weatherForecast);

    let weatherSummary = '';
    if (weatherForecast) {
      weatherSummary = weatherForecast.slice(0, 7).map(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          timeZone: 'America/New_York'
        });

        const description = day.weather[0].description;
        const temp = Math.round(day.temp.day);
        const chanceOfRain = Math.round(day.pop * 100);

        return `• ${date}: ${description}, around ${temp}°F, ${chanceOfRain}% chance of rain.`;
      }).join('\n');
    } else {
      weatherSummary = 'Weather data is currently unavailable.';
    }

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

    const prompt = `
    Today is ${currentDateTime}.
    You are a calendar assistant. The user has the following events:

    ${eventsText}

    The 7-day weather forecast is:
    ${weatherSummary}

    Answer the user's question based on both the schedule and weather.
    If the user wants to schedule something outdoors, and it’s rainy or cold (below 50°F), warn them.
    Otherwise, help them find a good time.

    User: ${message}
    `;

    const chatHistory = [
      {
        role: 'system',
        content: `Your name is Sunny. You are a friendly, upbeat AI calendar assistant who helps users schedule events.
        Always speak in a cheerful, welcoming tone using casual, natural language.
        If the user asks to schedule something during a time that’s already booked, politely inform them of the conflict.
        If the time is free, suggest a time naturally and include the following hidden HTML comment exactly once in your reply:
        <!-- SUGGESTED_EVENT: { "title": "Event Title", "start": "2025-05-10T14:00:00", "end": "2025-05-10T16:00:00" } -->
        
        Do NOT mention the comment or the word 'JSON' to the user. Only include it once per suggestion.
        
        If the user replies with 'yes', 'sure', or another confirmation, they want to schedule it.
        
        Let the frontend handle the rest.
        
        Stay helpful, kind, and respectful at all times. `
      },
      ...(history || []).map(m => ({ role: m.role, content: m.text })),
      { role: 'user', content: prompt }
    ];

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chatHistory
    });

    const reply = chatResponse.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ message: 'Something went wrong talking to the assistant.' });
  }
});


app.post('/api/bookings/auto', async (req, res) => {
  try {
    const { title, start, end } = req.body;

    const newBooking = new Booking({
      title,
      start: new Date(start),
      end: new Date(end),
      date: new Date(start), // store the day of the event
      allDay: false
    });

    await newBooking.save();
    res.status(201).json({ message: 'Event scheduled by Sunny!' });
  } catch (err) {
    console.error('Auto-scheduling error:', err);
    res.status(500).json({ message: 'Failed to schedule event.' });
  }
});