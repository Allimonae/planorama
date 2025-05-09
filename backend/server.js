import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { getWeatherForecast } from './weather.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
  startTime: Date,
  endTime: Date,
  startRecur: Date,
  endRecur: Date,
  groupId: String
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
      allDay: b.allDay || false
    }));
    res.json(formattedDbBookings);
  } catch (err) {
    console.error("Error fetching DB data:", err);
    res.status(500).json({ message: err.message });
  }
});

function convertUTCToNY(utcDateStr) {
  const utcDate = new Date(utcDateStr);
  return utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
}

// POST route
app.post('/api/bookings', async (req, res) => {
  try {
    const { title, date, start, end } = req.body;

    const bookingDate = new Date(date);
    const startTime = new Date(start);
    const endTime = new Date(end);

    const newYorkStartTime = convertUTCToNY(startTime);
    const newYorkEndTime = convertUTCToNY(endTime);

    const overlappingBooking = await Booking.findOne({
      date: bookingDate,
      $or: [
        {
          start: { $lt: newYorkStartTime },
          end: { $gt: newYorkEndTime }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: 'This time slot overlaps with another booking.'
      });
    }

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
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York'
    });

    const dbBookings = await Booking.find();

    const allEvents = dbBookings.map((e) => {
      const nyDate = new Date(e.date);
      const nyStart = new Date(e.start);
      const nyEnd = new Date(e.end);
    
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
        })
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
    Today is ${today}.
    You are a calendar assistant. The user has the following events:

    ${eventsText}

    The 7-day weather forecast is:
    ${weatherSummary}

    Answer the user's question based on both the schedule and weather.
    If the user wants to schedule something outdoors, and it’s rainy or cold (below 50°F), warn them.
    Otherwise, help them find a good time.

    User: ${message}
    `;

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Your name is Sunny. You are a friendly, upbeat AI calendar assistant who helps users schedule events.
          Always speak in a cheerful, welcoming tone using casual, natural language.
          If the user asks to schedule something during a time that’s already booked, politely inform them of the conflict.
          If the time is free, encourage them to go ahead with scheduling.
          If the request is unclear or outside the calendar's scope, gently ask for clarification.
          Stay helpful, kind, and respectful at all times.`
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
  
