import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AppEvent } from '../../../types';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    MapPin, 
    Users, 
    Video, 
    MoreVertical, 
    Plus, 
    ChevronLeft, 
    ChevronRight,
    X
} from 'lucide-react';

const Agenda = () => {
    const [events, setEvents] = useState<AppEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('start_time', { ascending: true });

        if (!error) setEvents(data || []);
        setLoading(false);
    };

    // Calendar helper
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    const upcomingEvents = events.filter(e => new Date(e.start_time) >= new Date()).slice(0, 5);

    return (
        <div className="space-y-6 text-white font-sans">
            <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-2xl font-bold">Agenda</h1>
                     <p className="text-gray-400">Gerencie seus compromissos e reuniões.</p>
                </div>
                 <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] border border-white/10 rounded-xl font-bold transition-colors"
                >
                    <Plus size={18} /> Novo Agendamento
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 text-center">
                    <h3 className="text-2xl font-bold">{events.filter(e => new Date(e.start_time).toDateString() === new Date().toDateString()).length}</h3>
                    <p className="text-xs text-gray-400">Hoje</p>
                </div>
                 <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 text-center">
                    <h3 className="text-2xl font-bold text-blue-400">35</h3>
                    <p className="text-xs text-gray-400">Esta Semana</p>
                </div>
                 <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 text-center">
                    <h3 className="text-2xl font-bold text-orange-400">3</h3>
                    <p className="text-xs text-gray-400">Pendentes</p>
                </div>
                 <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 text-center">
                    <h3 className="text-2xl font-bold text-green-400">98%</h3>
                    <p className="text-xs text-gray-400">Taxa de Comparecimento</p>
                </div>
            </div>

            {/* Calendar Strip */}
            <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4 bg-[#0f172a] rounded-lg p-1 border border-white/10">
                        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-1 hover:bg-white/10 rounded"><ChevronLeft size={20}/></button>
                        <span className="text-sm font-bold px-2">
                            {weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-1 hover:bg-white/10 rounded"><ChevronRight size={20}/></button>
                    </div>
                    <div className="flex gap-1 bg-[#0f172a] p-1 rounded-lg">
                        <button className="px-3 py-1 bg-blue-600 rounded text-xs font-bold shadow">Semana</button>
                        <button className="px-3 py-1 text-gray-400 hover:text-white text-xs font-bold">Dia</button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, idx) => {
                        const isToday = day.toDateString() === new Date().toDateString();
                        const dayEvents = events.filter(e => new Date(e.start_time).toDateString() === day.toDateString());

                        return (
                            <div key={idx} className={`flex flex-col items-center p-3 rounded-xl border ${isToday ? 'bg-blue-600 border-blue-500' : 'bg-[#0f172a] border-white/5'}`}>
                                <span className={`text-xs uppercase font-bold mb-1 ${isToday ? 'text-white' : 'text-gray-500'}`}>
                                    {day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                </span>
                                <span className={`text-xl font-bold mb-2 ${isToday ? 'text-white' : 'text-gray-300'}`}>
                                    {day.getDate()}
                                </span>
                                <div className="flex gap-1">
                                    {dayEvents.map((_, i) => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-blue-500'}`}></div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming List */}
            <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 h-[400px] overflow-y-auto">
                <h3 className="font-bold text-lg mb-4">Próximos Compromissos</h3>
                <div className="space-y-4">
                    {loading ? <p>Carregando...</p> : upcomingEvents.map(evt => (
                        <div key={evt.id} className="flex gap-4 p-4 rounded-xl bg-[#0f172a] border border-white/5 hover:border-blue-500/30 transition-all">
                             <div className={`p-3 rounded-xl flex items-center justify-center h-12 w-12 ${
                                 evt.type === 'meeting' ? 'bg-blue-500/20 text-blue-400' :
                                 evt.type === 'lecture' ? 'bg-purple-500/20 text-purple-400' :
                                 'bg-green-500/20 text-green-400'
                             }`}>
                                 {evt.type === 'meeting' ? <Users size={20} /> : evt.type === 'lecture' ? <Video size={20} /> : <CalendarIcon size={20} />}
                             </div>
                             
                             <div className="flex-1">
                                 <h4 className="font-bold text-white mb-1">{evt.title}</h4>
                                 <p className="text-sm text-gray-400">{evt.description}</p>
                             </div>

                             <div className="text-right text-xs text-gray-400 space-y-1">
                                 <div className="flex items-center justify-end gap-1">
                                     <CalendarIcon size={12} /> {new Date(evt.start_time).toLocaleDateString()}
                                 </div>
                                 <div className="flex items-center justify-end gap-1">
                                     <Clock size={12} /> {new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </div>
                                 <div className="flex items-center justify-end gap-1">
                                     <MapPin size={12} /> Remoto / Link
                                 </div>
                                 <span className="inline-block px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full mt-1 border border-green-500/20">
                                     Confirmado
                                 </span>
                             </div>
                        </div>
                    ))}
                    {!loading && upcomingEvents.length === 0 && (
                        <p className="text-center text-gray-500 py-10">Nenhum compromisso próximo.</p>
                    )}
                </div>
            </div>

             {/* Add Modal */}
             {showModal && (
                <AddEventModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchEvents(); }} />
            )}
        </div>
    );
};

const AddEventModal = ({ onClose, onSuccess }: any) => {
    const [formData, setFormData] = useState<Partial<AppEvent>>({
        title: '',
        description: '',
        type: 'meeting',
        start_time: new Date().toISOString().slice(0, 16),
        end_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        is_public: false
    });

    const handleSave = async () => {
        if (!formData.title) return alert('Campos obrigatórios');
        const { error } = await supabase.from('events').insert([{ ...formData }]);
        if (error) alert('Erro ao salvar');
        else onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e293b] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Novo Agendamento</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Título</label>
                        <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                        <select className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}
                        >
                            <option value="meeting">Reunião</option>
                            <option value="lecture">Palestra</option>
                            <option value="course">Curso</option>
                            <option value="reminder">Lembrete</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm text-gray-400 mb-1">Início</label>
                            <input type="datetime-local" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                                value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})}
                            />
                        </div>
                         <div>
                            <label className="block text-sm text-gray-400 mb-1">Fim</label>
                            <input type="datetime-local" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                                value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})}
                            />
                        </div>
                    </div>
                 
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Descrição / Pauta</label>
                        <textarea className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            rows={3}
                            value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 rounded-xl text-white font-bold">Salvar</button>
                </div>
            </div>
        </div>
    );
};

export default Agenda;
