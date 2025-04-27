// import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
// import timeGridPlugin from '@fullcalendar/timegrid'

const Home = () => {
    const navigate = useNavigate();

    const handleDateClick = (arg: any) => {
        // alert(arg.dateStr);
        const date = arg.dateStr;
        navigate('/bookingform', {state: { date }});
    }

    const eventInfo = {
        room: "Thomas Hunter Game Room",
        date: new Date(),
        start: '',
        end: '',
        clubName: '',
        eventTitle: '',
        eventDescription: '',
        numGuests: '',
        dateCreated: ''
    }
    // const renderEventContent = () => {
    //     return(
    //         <b>{eventInfo.title}</b>
    //     )
    // }

    return (
        <div>
            <FullCalendar
                plugins={[ dayGridPlugin, interactionPlugin ]}
                initialView='dayGridMonth'
                dateClick={handleDateClick}
                // eventContent={renderEventContent}
                events={[
                    { title: 'Computer Science Networking event', date: '2025-04-01'},
                    { title: 'Chinese club event', date: '2025-04-02'}
                ]}
            />
        </div>
    );
};

export default Home;