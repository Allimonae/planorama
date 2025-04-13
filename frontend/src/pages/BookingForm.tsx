import React, { useState } from 'react';
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
                <label>{ label }</label>
                <br/>
                <select id={id} name={id} value={value} className='h-[35px]'>
                    {options.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))};
                </select>
            </div>
        )
    }

    // Text input
    interface TextInputProps {
        id: string;
        value:
        label: string;
        type: string;
    }

    const TextInput = (props: TextInputProps) => {
        const { id, label, type, value } = props;
        return (
            <div className='booking-form-element text-lg'>
                <label>{label}</label>
                <br/>
                {type === 'textarea' ? (
                    <div>
                        <textarea className='h-[200px]' 
                            id={id}
                            name={id}
                            value={value}
                        ></textarea>
                    </div>
                ) : (
                    <div>
                        <input className='h-[35px]' 
                            id={id} 
                            name={id}
                            type={type}
                        ></input>
                    </div>
                )}
            </div>
        )
    }

    const [bookingData, setBookingData] = useState({
        room: '',
        date: '',
        start: '',
        end: '',
        // clubName: '',
        // eventTitle: '',
        // eventDescription: '',
        // numGuests: '',
        // dateCreated: ''
    });

    // Handle form input and validation
    const handleSubmit = (e) => {
        e.preventDefault();
        // const {room, date, start, end} = e.target;
        // setBookingData
    }

    return (
        <div className=''>
            <div className='bg-amber-50 w-4/5 mx-auto my-24 flex flex-col py-[50px] rounded-3xl shadow-2xl'>
                {/* HEADER */}
                <h1 className='booking-form-element text-center text-4xl font-bold'>Reserve a room</h1>
                <form className='flex flex-col' 
                    id='booking-form'
                >
                    {/* Room - dropdown */}
                    <Dropdown id='room'
                        value={bookingData.room}
                        label='Select a room' 
                        options={ rooms }
                    />
                    
                    {/* Date - how should date be handled? */}

                    {/* Time - dropdown, start time cannot be after end time, show duration */}
                    <div className='flex flex-col-2'> 
                        {/* Start time */}
                        <Dropdown id='start'
                            value={bookingData.start}
                            label='Start Time' 
                            options={ times('2:00', '14:00') }
                        />

                        {/* End time */}
                        <Dropdown id='end'
                            value={bookingData.end}
                            label='End Time' 
                            options={ times('2:00', '14:00') }
                        />
                        
                        {/* Duration - calculated from start time and end time */}

                    </div>

                    {/* Club name - text */}
                    <TextInput id='club-name'
                        label='Club Name' 
                        type='text'
                    />

                    {/* Event Title - text */}
                    <TextInput id='event-title'
                        label='Event Title' 
                        type='text'
                    />

                    {/* Event Description - text area */}
                    <TextInput id='event-description'
                        label='Event Description'
                        type='textarea'
                    ></TextInput>

                    {/* Expected Number of Guests - number */}
                    <TextInput id='no-of-guests'
                        label='Expected Number of Guests' 
                        type='number'
                    />

                    {/* Tags - optional */}

                    {/* button - submit will tell you if booking was successful, and if not why (missing a field, time slot filled) */}
                    <button onClick={ handleSubmit }>Submit</button>
                </form>
            </div>
        </div>
    )
}
export default BookingForm;