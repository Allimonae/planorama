import React, { useEffect, useState } from 'react';
// import hunterCampus from '../assets/hunter-campus-2001415976.jpg'

const BookingForm = () => {
    const rooms = ['Room 1', 'Room 2', 'Room 3'] // should only list rooms that are available
    
    // Times array given start and end time
    const times = (start:string, end:string) => {
        let res = [];
        const mins = ['00', '30'];

        let [startHour, startMin] = start.split(':').map(num => parseInt(num));
        const [endHour, endMin] = end.split(':').map(num => parseInt(num));

        let i = 0
        while (startHour < endHour) {
            res.push(startHour + ':' + mins[i])
            i ++;
            if (i % 2 === 0){
                i = 0;
                startHour ++;
            }
        } 

        return res;
    }

    const Duration = (start:string, end:string) => {
        if (start && end) {
            const [startHour, startMin] = start.split(':').map(num => parseInt(num));
            const [endHour, endMin] = end.split(':').map(num => parseInt(num));

            if (endHour < startHour || 
                (endHour == startHour && endMin <= startMin)) 
            {
                return (
                    <p>invalid</p>
                )
            } else {
                let hour = endHour - startHour;
                let min = endMin - startMin;
                if (endMin < startMin) {
                    min += 60;
                    hour -= 1;
                }
                if (hour && min) {
                    return (<p>{hour} hr {min} min</p>)
                }
                if (min) {
                    return (<p>{min} min</p>)
                }
                if (hour) {
                    return (<p>{hour} hr</p>)
                }
            }
        } else {
            return (
                <p>Please select start and end time</p>
            )
        }
    }

    // Dropdown with array Dropdown
    interface DropdownProps {
        id: string;
        value: string;
        label: string;
        options: string[];
    }
    
    const Dropdown = (props: DropdownProps) => {
        const { id, label, options, value } = props;
        return(
            <div className='booking-form-element text-lg flex-1'>
                <label htmlFor={id}>{label}</label>
                <select 
                    className='h-[35px]' 
                    id={id} 
                    name={id} 
                    value={value} 
                    onChange={handleChange}
                >
                    {options.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    const [bookingData, setBookingData] = useState({
        room: '',
        // date: '',
        start: '',
        end: '',
        clubName: '',
        eventTitle: '',
        eventDescription: '',
        numGuests: '',
        // dateCreated: ''
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setBookingData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    useEffect(() => {
        console.log('updating...', bookingData);
    }, [bookingData]);

    // Handle Submit
    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     const {room, date, start, end} = e.target;
    //     setBookingData
    // }

    return (
        <div>
            <div className='bg-amber-50 w-4/5 mx-auto my-24 flex flex-col py-[50px] rounded-3xl shadow-2xl'>
                {/* HEADER */}
                <h1 className='booking-form-element text-center text-4xl font-bold'>Reserve a room</h1>
                <form 
                    className='flex flex-col' 
                    id='booking-form'
                >
                    {/* Room - dropdown */}
                    <Dropdown 
                        id='room'
                        value={bookingData.room}
                        label='Select a room' 
                        options={rooms}
                    />
                    
                    {/* Date - how should date be handled? */}

                    {/* Time - dropdown, start time cannot be after end time, show duration */}
                    <div className='flex flex-col-3'> 
                        {/* Start time */}
                        <Dropdown 
                            id='start'
                            value={bookingData.start}
                            label='Start Time' 
                            options={times('2:00', '14:00')}
                        />

                        {/* End time */}
                        <Dropdown 
                            id='end'
                            value={bookingData.end}
                            label='End Time' 
                            options={times('2:00', '14:00')}
                        />
                        
                        {/* Duration - calculated from start time and end time */}
                        <p className='booking-form-element text-lg flex-1'>Duration<br/>{Duration(bookingData.start, bookingData.end)}</p>
                    </div>

                    {/* Club name - text */}
                    <div className='booking-form-element text-lg'>
                        <label htmlFor='clubName'>Club Name</label>
                        <input 
                            className='h-[35px] px-2' 
                            id='clubName' 
                            name='clubName'
                            type='text'
                            value={bookingData.clubName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Event Title - text */}
                    <div className='booking-form-element text-lg'>
                        <label htmlFor='eventTitle'>Event Title</label>
                        <input 
                            className='h-[35px] px-2' 
                            id='eventTitle' 
                            name='eventTitle'
                            type='text'
                            value={bookingData.eventTitle}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Event Description - text area */}
                    <div className='booking-form-element text-lg'>
                        <label htmlFor='eventDescription'>Event Description</label>
                        <textarea
                            className='h-[200px] px-2' 
                            id='eventDescription' 
                            name='eventDescription'
                            value={bookingData.eventDescription}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Expected Number of Guests - number */}
                    <div className='booking-form-element text-lg'>
                        <label htmlFor='numGuests'>Expected number of guests</label>
                        <input 
                            className='h-[35px] px-2' 
                            id='numGuests' 
                            name='numGuests'
                            type='number'
                            min='0'
                            value={bookingData.numGuests}
                            onChange={handleChange}
                        />
                    </div>

                    <p>Room: {bookingData.room}</p>
                    <p>Start: {bookingData.start}</p>
                    <p>End: {bookingData.end}</p>
                    <p>Club Name: {bookingData.clubName}</p>
                    <p>Event Title: {bookingData.eventTitle}</p>
                    <p>Event Description: {bookingData.eventDescription}</p>
                    <p>Num Guests: {bookingData.numGuests}</p>

                    {/* Tags - optional */}

                    {/* button - submit will tell you if booking was successful, and if not why (missing a field, time slot filled) */}
                    <button>Submit</button>
                </form>
            </div>
        </div>
    )
}
export default BookingForm;