import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';

interface Booking {
  _id: string;
  clubName: string;
  roomNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  eventTitle: string;
  purpose: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/bookings');
        const data: Booking[] = await res.json();

        // Transform bookings into FullCalendar format
        const calendarEvents = data.map(booking => ({
          id: booking._id,
          title: booking.eventTitle,
          start: `${booking.date.slice(0, 10)}T${booking.startTime}`,
          end: `${booking.date.slice(0, 10)}T${booking.endTime}`,
          extendedProps: {
            clubName: booking.clubName,
            purpose: booking.purpose,
            roomNumber: booking.roomNumber
          }
        }));

        setEvents(calendarEvents);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  const handleDateClick = (arg: any) => {
    const date = arg.dateStr;
    navigate('/bookingform', { state: { date } });
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        dateClick={handleDateClick}
        events={events}
      />
    </div>
  );
};

export default Home;
