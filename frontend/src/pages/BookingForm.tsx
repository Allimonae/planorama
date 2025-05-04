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

    const getTimeOnly = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    interface EventData {
        date: Date;
        allDay: boolean;
        start: Date;
        end: Date;
        title: string;
        daysOfWeek: number[]; 
        startTime: string;
        endTime: string;
        startRecur: Date;
        endRecur: Date;
        groupId: string;
    }
    
    const [eventData, setEventData] = useState<EventData>(() => {
        const parsedDate = date ? new Date(date) : new Date(); // default to current if undefined
        const endDate = new Date(parsedDate.getTime() + 60 * 60 * 1000);
        const endRecurDate = new Date(parsedDate.getMonth() + 1);
        
        return {
            date: parsedDate,
            allDay: true,
            start: parsedDate,
            end: endDate,
            title: '',
            daysOfWeek: [],
            startTime: '',
            endTime: '',
            startRecur: parsedDate,
            endRecur: endRecurDate,
            groupId: ''
            // backgroundColor: ''
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

    const toggleAllDay = () => {
        setEventData(prev => ({
            ...prev,
            allDay: !prev.allDay
        }));
    };

    const toggleStartTime = () => {
        setEventData(prev => ({
            ...prev,
            daysOfWeek: [],
            startTime: prev.startTime ? '' : getTimeOnly(prev.start).toLocaleString(),
            endTime: prev.endTime ? '' : getTimeOnly(prev.end).toLocaleString()
        }));
    };
    
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

    const handleDaysOfWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        const isChecked = e.target.checked;
      
        setEventData(prev => {
            const updatedDays = isChecked
                ? [...prev.daysOfWeek, value]
                : prev.daysOfWeek.filter(day => day !== value);
        
            return {
                ...prev,
                daysOfWeek: updatedDays.sort((a, b) => a - b)
            };
        });
    };
      
    useEffect(() => {
        console.log('updating...', eventData);
    }, [eventData]);

    // Handle Submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
      
        const newEvent = {
          ...eventData,
          id: Date.now().toString(), // Or any unique ID logic
        };
      
        // Optional: Add to global events list or save to backend here
        // e.g., addEvent(newEvent);
      
        // Redirect to home page
        navigate('/');
    };

    return (
        <div>
            <div className='bg-amber-50 w-4/5 mx-auto flex flex-col py-[50px] rounded-3xl shadow-2xl'>
                {/* HEADER */}
                <h1 className='booking-form-element text-center text-4xl font-bold'>Calendar event</h1>
                <form 
                    className='flex flex-col' 
                    id='event-form'
                    onSubmit={handleSubmit}
                >
                    <div className=''>
                        {/* Date - how should date be handled? */}
                        <div className='booking-form-element text-lg flex-1'>
                            <p>Date: {eventData.date.getFullYear().toString() + '-' + (eventData.date.getMonth() + 1) + '-' + eventData.date.getDate()}</p>
                        </div>
                    </div>

                    {/* Event Title - text */}
                    <div className='booking-form-element text-lg'>
                        <label htmlFor='title'>Title</label>
                        <input 
                            className='h-[35px] px-2 w-full' 
                            id='title' 
                            name='title'
                            type='text'
                            value={eventData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    {/* Time - dropdown, start time cannot be after end time, show duration */}
                    <div className='flex flex-col-2'> 
                        <div className='flex items-center'>
                            {/* toggle button for all day */}
                            <button
                                type="button"
                                onClick={toggleAllDay}
                                className={`booking-form-element px-4 py-2 rounded h-[40px] w-[200px] font-semibold transition-colors duration-200 ${
                                    eventData.allDay ? 'bg-gray-300 text-gray-800' : 'bg-green-500 text-white'
                                }`}
                            >
                                {eventData.allDay ? 'All Day' : 'Certain Times'}
                            </button>
                        </div>

                        {eventData.allDay ? (<></>):
                        (<div className='flex flex-col-2'>
                            {/* Start time */}
                            <div className='booking-form-element flex-1 text-lg'>
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
                        </div>)}
                    </div>

                    {/* Reoccuring event */}
                    <div className='flex flex-col-3'> 
                        <div className='flex-1 items-center'>
                            {/* toggle button for recurring */}
                            <button
                                type="button"
                                onClick={toggleStartTime}
                                className={`booking-form-element px-4 py-2 rounded h-[40px] w-[200px] font-semibold transition-colors duration-200 ${
                                    eventData.startTime ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-800'
                                }`}
                            >
                                {eventData.startTime ? 'Recurring' : 'Only occur once'}
                            </button>
                        </div>

                        {eventData.startTime ? (
                        <div className='flex-2'>
                            {/* Start time */}
                            <div className='booking-form-element flex-1 text-lg'>
                               
                            </div>
                            
                            {/* select days of week */}
                            <div className='booking-form-element text-lg flex-1'>
                                <h1>Days of recurrence: </h1>
                                <label><input type="checkbox" name="daysOfWeek" value="0" onChange={handleDaysOfWeekChange} /> Sunday</label><br/>
                                <label><input type="checkbox" name="daysOfWeek" value="1" onChange={handleDaysOfWeekChange} /> Monday</label><br/>
                                <label><input type="checkbox" name="daysOfWeek" value="2" onChange={handleDaysOfWeekChange} /> Tuesday</label><br/>
                                <label><input type="checkbox" name="daysOfWeek" value="3" onChange={handleDaysOfWeekChange} /> Wednesday</label><br/>
                                <label><input type="checkbox" name="daysOfWeek" value="4" onChange={handleDaysOfWeekChange} /> Thursday</label><br/>
                                <label><input type="checkbox" name="daysOfWeek" value="5" onChange={handleDaysOfWeekChange} /> Friday</label><br/>
                                <label><input type="checkbox" name="daysOfWeek" value="6" onChange={handleDaysOfWeekChange} /> Saturday</label><br/>
                            </div>
                        </div>
                        ):(<></>)}
                    </div>

                    {/* Confirming form handling, comment out later */}
                    {/* <div className="booking-form-element">
                        <h1>Testing, comment out later</h1>
                        <p>Date: {eventData.date.toLocaleString()}</p>
                        <p>All day: {eventData.allDay ? 'true' : 'false'}</p>
                        <p>Start: {eventData.start.toLocaleString()}</p>
                        <p>End: {eventData.end.toLocaleString()}</p>
                        <p>Recurring start: {eventData.startTime ? eventData.startTime : 'false'}</p>
                        <p>Recurring end: {eventData.endTime ? eventData.endTime : 'false'}</p>
                        <p>Recurring days of week: {eventData.daysOfWeek}</p>
                    </div> */}

                    {/* button - submit will tell you if booking was successful, and if not why (missing a field, time slot filled) */}
                    <div className='flex'>
                        <button 
                            className='m-3 form-button'
                            onClick={() => navigate(-1)}
                        >Back</button>
                        <button className="form-button" type='submit'>Submit</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default BookingForm;