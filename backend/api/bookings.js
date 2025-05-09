// /api/bookings.js
export default async function handler(req, res) {
    if (req.method === 'GET') {
      const bookings = await getBookingsFromMongo(); // Your DB logic
      return res.status(200).json(bookings);
    }
    if (req.method === 'POST') {
      const booking = await createBooking(req.body); // Your DB logic
      return res.status(201).json(booking);
    }
  }
  