import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useNavigate } from 'react-router-dom';
import AssistantSidebar from './AssistantSidebar';

const Calendar = () => {
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
  
    const handleDateClick = (arg: any) => {
      const date = arg.dateStr;
      navigate('/bookingform', { state: { date } });
    };
  
    useEffect(() => {
      const fetchEvents = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/bookings');
          const data = await response.json();
          setEvents(data);
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      };
  
      fetchEvents();
    }, []);  

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
          />
          <AssistantSidebar />
        </div>
      );
    };

export default Calendar;
