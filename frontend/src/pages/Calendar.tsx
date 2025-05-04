import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'

const Home = () => {
    const navigate = useNavigate();

    const handleDateClick = (arg: any) => {
        // alert(arg.dateStr);
        const date = arg.dateStr;
        navigate('/bookingform', {state: { date }});
    }

    const calendarRef = useRef(null)

    const events = [
        { 
            id: 'a',
            groupId: 'b',
            allDay: false, 
            start: '2025-05-01T10:30',
            end: '2025-05-01T11:45',
            startTime: '07:00:00',
            endTime: '',
            startRecur: '2025-05-01',
            title: 'Computer Science Networking event', 
            date: '2025-05-01',
            editable: true,
            backgroundColor: 'pink'
        },
        { title: 'Chinese club event', date: '2025-05-02'}
    ]

    return (
        <div>
            {/* <button onClick={goNext}>Go Next</button> */}
            <FullCalendar
                ref={calendarRef}
                plugins={[ dayGridPlugin, interactionPlugin, timeGridPlugin ]}
                initialView='timeGridWeek'
                dateClick={handleDateClick}
                // eventContent={renderEventContent}
                events={events}
                headerToolbar={{
                    left: 'prev,next',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay' // user can switch between the two
                }}
                timeZone='America/New_York'
            />
        </div>
    );
};

export default Home;