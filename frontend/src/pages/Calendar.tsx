import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { getEvents } from '../lib/supabase'

const Home = () => {
    const navigate = useNavigate();

    const handleDateClick = (arg: any) => {
        // alert(arg.dateStr);
        const date = arg.dateStr;
        navigate('/bookingform', {state: { date }});
    }

    const calendarRef = useRef(null)

    const events2 = [
        // { 
        //     id: 'a',
        //     groupId: 'b',
        //     allDay: false, 
        //     startTime: '2025-05-01T10:30',
        //     endTime: '2025-05-01T11:45',
        //     startRecurTime: '07:00:00',
        //     endRecurTime: '',
        //     startRecur: '2025-05-01',
        //     title: 'Computer Science Networking event', 
        //     date: '2025-05-01',
        //     editable: true,
        //     backgroundColor: 'pink'
        // },
        { title: 'Chinese club event', date: '2025-05-02'}
    ]

    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const fetchedEvents = async () => {
            const fetchedEvents = await getEvents();
            console.log('Fetched events:', fetchedEvents);
            if (fetchedEvents) {
                setEvents(fetchedEvents)
            } else {
                console.error('No events fetched or an error occured')
            }
        }

        fetchedEvents();
    }, []);

    return (
        <div>
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