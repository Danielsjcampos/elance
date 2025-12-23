import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal } from '../../components/Modal';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const Agenda: React.FC = () => {
    const { isAdmin, user } = useAuth(); // Assuming 'user' is available in auth context
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('month'); // month, week, day, agenda

    // Filters
    const [filter, setFilter] = useState('all'); // all, meeting, auction

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        start_time: '',
        end_time: '',
        description: '',
        type: 'meeting' // default type
    });

    useEffect(() => {
        fetchEvents();
    }, [filter]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('events')
                .select('*')
                .order('start_time', { ascending: true });

            // If we add 'type' column later, we can filter here. 
            // For now specific filtering logic might be limited unless we add that column.

            const { data, error } = await query;
            if (error) throw error;

            // Transform for BigCalendar
            const formattedEvents = (data || []).map(e => ({
                id: e.id,
                title: e.title,
                start: new Date(e.start_time),
                end: e.end_time ? new Date(e.end_time) : new Date(new Date(e.start_time).getTime() + 60 * 60 * 1000), // Default 1h
                desc: e.description,
                allDay: false, // Could infer from type
                resource: e
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSlot = ({ start, end }: any) => {
        setNewEvent({ ...newEvent, start_time: start.toISOString(), end_time: end.toISOString() });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Get Franchise ID
            const { data: profile } = await supabase.from('profiles').select('franchise_unit_id').eq('id', (await supabase.auth.getUser()).data.user?.id).single();
            if (!profile?.franchise_unit_id) throw new Error('Franquia não encontrada');

            const eventData = {
                title: newEvent.title,
                start_time: newEvent.start_time,
                end_time: newEvent.end_time,
                description: newEvent.description,
                franchise_id: profile.franchise_unit_id
                // type: newEvent.type (Need schema update for this)
            };

            const { error } = await supabase.from('events').insert([eventData]);
            if (error) throw error;

            setIsModalOpen(false);
            fetchEvents();
        } catch (error: any) {
            alert('Erro ao salvar evento: ' + error.message);
        }
    };

    const eventStyleGetter = (event: any) => {
        let backgroundColor = '#3a7ad1';
        if (event.title.includes('Praça') || event.title.includes('Leilão')) {
            backgroundColor = '#10b981'; // Green for Auctions
        }
        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <div className="h-screen flex flex-col pb-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
                    <p className="text-gray-500 text-sm">Gerencie compromissos e datas de leilões</p>
                </div>
                <div className="flex gap-2">
                    {/* Filter Mockup */}
                    {/* <div className="flex bg-gray-100 rounded-lg p-1">
                        <button className="px-3 py-1 bg-white rounded shadow text-sm font-medium">Todos</button>
                        <button className="px-3 py-1 text-gray-500 text-sm hover:bg-gray-200 rounded">Leilões</button>
                    </div> */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a61b0] transition-colors"
                    >
                        <Plus size={20} />
                        Novo Evento
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    messages={{
                        next: "Próximo",
                        previous: "Anterior",
                        today: "Hoje",
                        month: "Mês",
                        week: "Semana",
                        day: "Dia",
                        agenda: "Agenda",
                        date: "Data",
                        time: "Hora",
                        event: "Evento",
                        noEventsInRange: "Não há eventos neste período."
                    }}
                    eventPropGetter={eventStyleGetter}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={(event) => alert(event.title + '\n' + (event.desc || ''))} // Simple view for now
                    defaultView="month"
                    views={['month', 'week', 'day', 'agenda']}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Evento"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Título</label>
                        <input
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                            value={newEvent.title}
                            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                            required
                            placeholder="Ex: Reunião com Cliente"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Início</label>
                            <input
                                type="datetime-local"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                value={newEvent.start_time ? new Date(newEvent.start_time).toISOString().slice(0, 16) : ''}
                                onChange={e => setNewEvent({ ...newEvent, start_time: new Date(e.target.value).toISOString() })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fim</label>
                            <input
                                type="datetime-local"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                value={newEvent.end_time ? new Date(newEvent.end_time).toISOString().slice(0, 16) : ''}
                                onChange={e => setNewEvent({ ...newEvent, end_time: new Date(e.target.value).toISOString() })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <textarea
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none h-20"
                            value={newEvent.description}
                            onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0]"
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Agenda;

