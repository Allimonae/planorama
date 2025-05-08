import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useNavigate, useLocation } from 'react-router-dom';
import AssistantSidebar from './AssistantSidebar';

const Calendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      console.log("Client timezone now is:", new Date().toString());
      const response = await fetch('http://localhost:5000/api/bookings');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (location.state?.refreshCalendar) {
      fetchEvents();
      navigate('.', { replace: true });
    }
  }, [location.state, navigate]);

  const handleDateClick = (arg: any) => {
    const date = arg.dateStr;
    navigate('/bookingform', { state: { date } });
  };

    return (
        <div>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            initialView="timeGridWeek"
            dateClick={handleDateClick}
            events={events}
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            timeZone="America/New_York"
            nowIndicator="true"
          />
          <AssistantSidebar />
        </div>
      );
    };

export default Calendar;
