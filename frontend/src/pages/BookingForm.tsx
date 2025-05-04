import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type DropdownOption = {
    label: string;
    value: string;
};

interface DropdownProps {
    className: string;
    id: string;
    value: string;
    label: string;
    options: DropdownOption[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Dropdown = (props: DropdownProps) => {
    const { className, id, label, options, value, onChange } = props;
    return(
        <div>
            <label htmlFor={id}>{label}</label>
            <select 
                className={className} 
                id={id} 
                name={id} 
                value={value} 
                onChange={onChange}
                required
            >
                <option value="" disabled>Choose an option</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

const BookingForm = () => {
    const location = useLocation();
    const date = location.state?.date;
    const navigate = useNavigate();

    const [eventData, setEventData] = useState(() => {
        const parsedDate = date ? new Date(date) : new Date(); // default to current if undefined
        const endDate = new Date(parsedDate.getTime() + 60 * 60 * 1000);
        
        return {
            date: parsedDate,
            allDay: false,
            start: parsedDate,
            end: endDate,
            title: '',
            backgroundColor: ''
        };
    });

    // Times array given start and end time
    const getTimes = (baseDate = eventData.date) => {
        const times = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const hour12 = h % 12 || 12;
                const minute = m.toString().padStart(2, '0');
                const period = h < 12 ? 'AM' : 'PM';
                const label = `${hour12}:${minute} ${period}`;
    
                const date = new Date(baseDate);
                date.setHours(h, m, 0, 0); // set to current iteration time
    
                times.push({ label, value: date.toISOString() }); // store ISO string or raw date if you prefer
            }
        }
        return times;
    };
    
    function calculateDuration(startDate: Date, endDate: Date): string {
        if (startDate >= endDate) return '';
    
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationMinutes = Math.floor(durationMs / 60000); // ms to minutes
    
        const days = Math.floor(durationMinutes / (60 * 24));
        const hours = Math.floor((durationMinutes % (60 * 24)) / 60);
        const minutes = durationMinutes % 60;
    
        const parts = [];
        if (days > 0) parts.push(`${days} day(s)`);
        if (hours > 0) parts.push(`${hours} hour(s)`);
        if (minutes > 0) parts.push(`${minutes} minute(s)`);
    
        return parts.join(' and ');
    }
    

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setEventData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target;
        const parsedDate = new Date(value);
      
        setEventData((prev) => ({
          ...prev,
          [id]: parsedDate,
        }));
    };
      
    useEffect(() => {
        console.log('updating...', eventData);
    }, [eventData]);

    // Handle Submit
    const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setEventData((prevData) => ({
            ...prevData,
            dateCreated: new Date().toISOString()
        }));
        console.log('Form submitted', eventData)
    }

    return (
        <div>
            <div className="w-full">
                <button 
                    className='m-3'
                    onClick={() => navigate(-1)}
                >Back</button>
            </div>
            
            <div className='bg-amber-50 w-4/5 mx-auto flex flex-col py-[50px] rounded-3xl shadow-2xl'>
                {/* HEADER */}
                <h1 className='booking-form-element text-center text-4xl font-bold'>Reserve a room</h1>
                <form 
                    className='flex flex-col' 
                    id='event-form'
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
                    </div>
                    
                    {/* Time - dropdown, start time cannot be after end time, show duration */}
                    <div className='flex flex-col-2'> 
                        {/* Start time */}
                        <div className='booking-form-element text-lg flex-1'>
                            <Dropdown 
                                className={
                                    calculateDuration(eventData.start, eventData.end) === ''
                                        ? 'border border-red-500 h-[35px] shadow-sm bg-white rounded w-full' 
                                        : 'h-[35px] border-1 border-gray-400 shadow-sm bg-white rounded w-full'
                                }
                                id='start'
                                value={eventData.start.toISOString()}
                                label='Start Time' 
                                options={getTimes().map(time => ({
                                    label: time.label,
                                    value: time.value
                                }))}
                                onChange={handleDateChange}
                            />
                        </div>
                        
                        {/* End time */}
                        <div className='booking-form-element text-lg flex-1'>
                            <Dropdown 
                                className={
                                    calculateDuration(eventData.start, eventData.end) === ''
                                        ? 'border border-red-500 h-[35px] shadow-sm bg-white rounded w-full outline-none' 
                                        : 'h-[35px] border-1 border-gray-400 shadow-sm bg-white rounded w-full'
                                }
                                id='end'
                                value={eventData.end.toISOString()}
                                label='End Time' 
                                options={getTimes().map(time => ({
                                    label: time.label,
                                    value: time.value
                                }))}
                                onChange={handleDateChange}
                            />
                            <p>{calculateDuration(eventData.start, eventData.end) ? calculateDuration(eventData.start, eventData.end): "Start time is after end time."}</p>
                        </div>
                    </div>

                    {/* Event Title - text */}
                    <div className='booking-form-element text-lg'>
                        <label htmlFor='eventTitle'>Event Title</label>
                        <input 
                            className='h-[35px] px-2' 
                            id='eventTitle' 
                            name='eventTitle'
                            type='text'
                            value={eventData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Confirming form handling, comment out later */}
                    <div className="booking-form-element">
                        <h1>Testing, comment out later</h1>
                        <p>Date: {eventData.date.toLocaleString()}</p>
                        <p>Start: {eventData.start.toLocaleString()}</p>
                        <p>End: {eventData.end.toLocaleString()}</p>
                    </div>

                    {/* button - submit will tell you if booking was successful, and if not why (missing a field, time slot filled) */}
                    <button type='submit'>Submit</button>
                </form>
            </div>
        </div>
    )
}
export default BookingForm;