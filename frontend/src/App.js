import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';

function App() {
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    clubName: '',
    roomNumber: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    purpose: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:5000/api/bookings', formData);
      setSuccess('Booking created successfully!');
      setFormData({
        clubName: '',
        roomNumber: '',
        date: new Date(),
        startTime: '',
        endTime: '',
        purpose: '',
      });
      fetchBookings();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating booking');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Room Booking Scheduler
          </Typography>

          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Book a Room
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Club Name"
                    name="clubName"
                    value={formData.clubName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Room Number"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={(newDate) => setFormData({ ...formData, date: newDate })}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Start Time"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="End Time"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Purpose"
                    name="purpose"
                    multiline
                    rows={2}
                    value={formData.purpose}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                  >
                    Book Room
                  </Button>
                </Grid>
              </Grid>
            </form>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Bookings
            </Typography>
            <Grid container spacing={2}>
              {bookings.map((booking) => (
                <Grid item xs={12} sm={6} md={4} key={booking._id}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1">
                      Club: {booking.clubName}
                    </Typography>
                    <Typography variant="body2">
                      Room: {booking.roomNumber}
                    </Typography>
                    <Typography variant="body2">
                      Date: {new Date(booking.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      Time: {booking.startTime} - {booking.endTime}
                    </Typography>
                    <Typography variant="body2">
                      Purpose: {booking.purpose}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}

export default App; 