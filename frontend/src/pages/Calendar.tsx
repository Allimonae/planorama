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
      const response = await fetch('http://localhost:5000/api/bookings');
      const data = await response.json();

      const adjustedEvents = data.map((event) => {
        const originalDate = new Date(event.date);
        const originalStart = new Date(event.start);
        const originalEnd = new Date(event.end);
        
        const shiftedDate = new Date(originalDate.getTime() - 4 * 60 * 60 * 1000);
        const shiftedStart = new Date(originalStart.getTime() - 4 * 60 * 60 * 1000);
        const shiftedEnd = new Date(originalEnd.getTime() - 4 * 60 * 60 * 1000);
  
        return {
          ...event,
          date: shiftedDate,
          start: shiftedStart,
          end: shiftedEnd,
        };
      });

      setEvents(adjustedEvents);
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
    navigate('/bookingform', { state: { date: arg.dateStr } });
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
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        timeZone="America/New_York"
        nowIndicator

        eventDidMount={(info) => {
          info.el.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // disable default right-click menu
      
            const confirmDelete = window.confirm(`Delete event: "${info.event.title}"?`);
            if (confirmDelete) {
              const eventId = info.event.id;
              fetch(`http://localhost:5000/api/bookings/${eventId}`, {
                method: 'DELETE'
              })
                .then((res) => {
                  if (res.ok) {
                    info.event.remove(); // remove from calendar UI
                    alert('Event deleted!');
                  } else {
                    alert('Failed to delete event.');
                  }
                })
                .catch((err) => {
                  console.error('Delete error:', err);
                  alert('Error deleting event.');
                });
              }
          });
        }}
      />
      <AssistantSidebar />
    </div>
  );
};

export default Calendar;
