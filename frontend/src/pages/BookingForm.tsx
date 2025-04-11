import React from 'react';

const BookingForm = () => {
    const rooms = ['Room 1', 'Room 2', 'Room 3'] // should only list rooms that are available
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
        label: string;
        options: string[];
    }
    
    const Dropdown = (props: DropdownProps) => {
        const { label, options } = props;
        return(
            <div className='booking-form-element text-lg flex-1'>
                <label>{ label }</label>
                <br/>
                <select className='h-[35px]'>
                    {options.map((option, index) => (
                        <option key={ index } value={ option }>
                            { option }
                        </option>
                    ))};
                </select>
            </div>
        )
    }

    // Text input
    interface TextInputProps {
        label: string;
        type: string;
    }

    const TextInput = (props: TextInputProps) => {
        const { label, type } = props;
        return (
            <div className='booking-form-element text-lg'>
                <label>{ label }</label>
                <br/>
                <input className='h-[35px]' type={ type }></input>
            </div>
        )
    }

    const submitBookingForm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log(times('2:00','14:00'));
    }

    return (
        <div>
            <form className='bg-amber-50 w-4/5 flex flex-col mx-auto my-[100px] py-[50px] rounded-4xl' 
                id='booking-form'
            >
                {/* HEADER */}
                <h1 className='booking-form-element text-center text-4xl'>Reserve a room</h1>

                {/* Room - dropdown */}
                <Dropdown label='Select a room' 
                    options={ rooms }/
                >
                
                {/* Date - how should date be handled? */}

                {/* Time - dropdown, start time cannot be after end time, show duration */}
                <div className='flex flex-col-2'> 
                    {/* Start time */}
                    <Dropdown label='Start Time' 
                        options={ times('2:00', '14:00') }
                    />

                    {/* End time */}
                    <Dropdown label='End Time' 
                        options={ times('2:00', '14:00') }
                    />
                    
                    {/* Duration - calculated from start time and end time */}

                </div>

                {/* Club name - text */}
                <TextInput label='Club Name' 
                    type='text'
                />

                {/* Event Title - text */}
                <TextInput label='Event Title' 
                    type='text'
                />

                {/* Event Description - text area */}
                <div className='booking-form-element text-lg'>
                    <label>Event Description</label>
                    <br/>
                    <textarea className='h-[200px]'></textarea>
                </div>

                {/* Expected Number of Guests - number */}
                <TextInput label='Expected Number of Guests' 
                    type='number'
                />

                {/* Tags */}

                {/* button - submit will tell you if booking was successful, and if not why (missing a field, time slot filled) */}
                <button onClick={ submitBookingForm }>Submit</button>
            </form>
        </div>
    )
}
export default BookingForm;