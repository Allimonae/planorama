import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL, 
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const addEvent = async (eventData: any) => {
    const uniqueId = new Date(Date.now()).toISOString();

    const { data, error } = await supabase
        .from('events')
        .insert([{
            id: uniqueId,
            title: eventData.title,
            date: eventData.date,
            start: eventData.start,
            end: eventData.end,
            allDay: eventData.allDay
        }]);

    if (error) console.error(error);
    else console.log('Inserted:', data);
};

const getEvents = async () => {
    const { data, error } = await supabase
        .from('events')
        .select('*');

    if (error){
        console.error(error);
        return [];
    } else {
        return data;
    }
};

export { addEvent, getEvents }