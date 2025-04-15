import React, { useEffect, useState } from 'react';
// import hunterCampus from '../assets/hunter-campus-2001415976.jpg'

const BookingForm = () => {
    const rooms = ['Room 1', 'Room 2', 'Room 3']; // should only list rooms that are available
    const date = 'Monday April 14, 2025';
    const [bookingData, setBookingData] = useState({
        room: '',
        date: '',
        start: '',
        end: '',
        clubName: '',
        eventTitle: '',
        eventDescription: '',
        numGuests: '',
        dateCreated: ''
    });

    // Times array given start and end time
    const times = (start:string, end:string) => {
        const res = [];
        const mins = ['00', '30'];

        let [startHour, startMin] = start.split(':').map(num => parseInt(num));
        const [endHour, endMin] = end.split(':').map(num => parseInt(num));

        let i = 0;
        while (startHour < endHour) {
            // let meridiem;
            // let hour = startHour;
            // if (hour < 12) {
            //     meridiem = 'AM';
            //     hour = hour === 0 ? 12 : hour;
            // } else {
            //     meridiem = 'PM';
            //     hour -= 12;
            // }

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
        let res;
        if (start && end) {
            const [startHour, startMin] = start.split(':').map(num => parseInt(num));
            const [endHour, endMin] = end.split(':').map(num => parseInt(num));

            if (endHour < startHour || 
                (endHour == startHour && endMin <= startMin)) 
            {
                res = "Invalid times.";
            } else {
                let hour = endHour - startHour;
                let min = endMin - startMin;
                if (endMin < startMin) {
                    min += 60;
                    hour -= 1;
                }
                if (hour && min) {
                    res = `${hour} hr ${min} min`;
                } else {
                    if (min) {
                        res = `${min} min`;
                    } else if (hour) {
                        res = `${hour} hr`;
                    }
                }
            }
        } else {
            res = 'Please select start and end time.'
        }
        return res
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
            <div>
                <label htmlFor={id}>{label}</label>
                <select 
                    className='h-[35px]' 
                    id={id} 
                    name={id} 
                    value={value} 
                    onChange={handleChange}
                    required
                >
                    <option value="" disabled>Choose an option</option>
                    {options.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

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
    const handleSubmit = (e) => {
        e.preventDefault();
        setBookingData((prevData) => ({
            ...prevData,
            dateCreated: new Date().toISOString()
        }));
        console.log('Form submitted', bookingData)
    }

    return (
        <div>
            <div className='bg-amber-50 w-4/5 mx-auto my-24 flex flex-col py-[50px] rounded-3xl shadow-2xl'>
                {/* HEADER */}
                <h1 className='booking-form-element text-center text-4xl font-bold'>Reserve a room</h1>
                <form 
                    className='flex flex-col' 
                    id='booking-form'
                    onSubmit={handleSubmit}
                >
                    <div className='flex flex-col-2'>
                        {/* Date - how should date be handled? */}
                        <div className='booking-form-element text-lg flex-1'>
                            <label htmlFor='date'>Date</label>
                            <input 
                                className='h-[35px] px-2'
                                id='date'
                                name='date'
                                type='text'
                                value={date}
                                onChange={handleChange}>
                            </input>
                        </div>

                        {/* Room - Dropdown */}
                        <div className='booking-form-element text-lg flex-1'>
                            <Dropdown 
                                id='room'
                                value={bookingData.room}
                                label='Select a room' 
                                options={rooms}
                            />
                        </div>
                        
                    </div>
                    
                    {/* Time - dropdown, start time cannot be after end time, show duration */}
                    <div className='flex flex-col-2'> 
                        {/* Start time */}
                        <div className='booking-form-element text-lg flex-1'>
                            <Dropdown 
                                id='start'
                                value={bookingData.start}
                                label='Start Time' 
                                options={times('0:00', '24:00')}
                            />
                        </div>
                        
                        {/* End time */}
                        <div className='booking-form-element text-lg flex-1'>
                            <Dropdown 
                                id='end'
                                value={bookingData.end}
                                label='End Time' 
                                options={times('0:00', '24:00')}
                            />
                            <p>{Duration(bookingData.start, bookingData.end)}</p>
                        </div>

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
                            required
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
                            required
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
                            required
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
                            required
                        />
                    </div>

                    {/* Confirming form handling, comment out later */}
                    {/* <div className="booking-form-element">
                        <h1>Testing, comment out later</h1>
                        <p>Room: {bookingData.room}</p>
                        <p>Date: {bookingData.date}</p>
                        <p>Start: {bookingData.start}</p>
                        <p>End: {bookingData.end}</p>
                        <p>Club Name: {bookingData.clubName}</p>
                        <p>Event Title: {bookingData.eventTitle}</p>
                        <p>Event Description: {bookingData.eventDescription}</p>
                        <p>Num Guests: {bookingData.numGuests}</p>
                        <p>Date Created: {bookingData.dateCreated}</p>
                    </div> */}

                    {/* Tags - optional */}

                    {/* button - submit will tell you if booking was successful, and if not why (missing a field, time slot filled) */}
                    <button type='submit'>Submit</button>
                </form>
            </div>
        </div>
    )
}
export default BookingForm;