import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Training } from '../../../types';
import { 
    Play, 
    Award, 
    BookOpen, 
    Video, 
    Star,
    CheckCircle,
    Plus,
    X,
    Save
} from 'lucide-react';

const TrainingCenter = () => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'mandatory' | 'recommended' | 'webinar'>('all');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // User Stats (Gamification mock)
    const userPoints = 1250;
    const completedCourses = 5;

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('trainings')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setTrainings(data || []);
        setLoading(false);
    };

    const filteredTrainings = activeTab === 'all' 
        ? trainings 
        : trainings.filter(t => t.category === activeTab);

    return (
        <div className="space-y-6">
            {/* Header & Gamification Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-[#1e293b] rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Centro de Treinamento</h1>
                        <p className="text-blue-200 text-lg">Capacite-se e suba de nível na franquia.</p>
                        
                        <div className="flex gap-4 mt-6">
                            <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                                    <Star size={20} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Pontos XP</p>
                                    <p className="text-xl font-bold text-white">{userPoints}</p>
                                </div>
                            </div>
                            <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                    <Award size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Certificados</p>
                                    <p className="text-xl font-bold text-white">{completedCourses}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bold transition-all flex items-center gap-2"
                    >
                        <Plus size={20} /> Adicionar Treinamento
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#1e293b] p-1 rounded-xl w-fit border border-white/10">
                {[
                    { id: 'all', label: 'Todos' },
                    { id: 'mandatory', label: 'Obrigatórios' },
                    { id: 'recommended', label: 'Recomendados' },
                    { id: 'webinar', label: 'Webinars' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? <div className="text-white">Carregando...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTrainings.map(training => (
                        <TrainingCard training={training} key={training.id} />
                    ))}
                    {filteredTrainings.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            Nenhum treinamento encontrado nesta categoria.
                        </div>
                    )}
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <AddTrainingModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchTrainings(); }} />
            )}
        </div>
    );
};

const TrainingCard = ({ training }: { training: Training }) => {
    return (
        <div className="group bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden hover:border-blue-500/50 transition-all hover:transform hover:-translate-y-1 hover:shadow-2xl">
            <div className="h-40 bg-gray-800 relative">
                {training.thumbnail_url ? (
                    <img src={training.thumbnail_url} className="w-full h-full object-cover" alt={training.title} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900">
                        <Video size={48} />
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white border border-white/10 flex items-center gap-1">
                    <Star size={12} className="text-yellow-400" fill="currentColor" />
                    {training.points} XP
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                        <Play size={20} fill="currentColor" className="ml-1" />
                    </div>
                </div>
            </div>
            
            <div className="p-5">
                <div className="flex gap-2 mb-3">
                    <span className={`text-[10px] px-2 py-1 rounded-md uppercase font-bold tracking-wider ${
                        training.category === 'mandatory' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                        training.category === 'webinar' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                    }`}>
                        {training.category}
                    </span>
                    {training.duration_minutes && (
                        <span className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-gray-400 border border-white/5">
                            {training.duration_minutes} min
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{training.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                    {training.description || 'Sem descrição.'}
                </p>

                <button className="w-full py-2.5 rounded-xl bg-blue-600/10 text-blue-400 font-bold text-sm hover:bg-blue-600 hover:text-white transition-colors">
                    Assistir Agora
                </button>
            </div>
        </div>
    );
};

const AddTrainingModal = ({ onClose, onSuccess }: any) => {
    const [formData, setFormData] = useState<Partial<Training>>({
        title: '',
        description: '',
        category: 'recommended',
        points: 100,
        duration_minutes: 0,
        video_url: '',
        thumbnail_url: ''
    });

    const handleSave = async () => {
        if (!formData.title) return alert('Titulo obrigatório');

        const { error } = await supabase.from('trainings').insert([{
            ...formData
        }]);

        if (error) {
            console.error(error);
            alert('Erro ao salvar');
        } else {
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e293b] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white">Novo Treinamento</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Título</label>
                        <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                        <select className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}
                        >
                            <option value="mandatory">Obrigatório</option>
                            <option value="recommended">Recomendado</option>
                            <option value="webinar">Webinar</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Pontos (XP)</label>
                            <input type="number" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                                value={formData.points} onChange={e => setFormData({...formData, points: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Duração (min)</label>
                            <input type="number" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                                value={formData.duration_minutes || ''} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">URL do Vídeo</label>
                        <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            value={formData.video_url || ''} onChange={e => setFormData({...formData, video_url: e.target.value})}
                            placeholder="https://..."
                        />
                    </div>
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">URL da Thumbnail</label>
                        <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            value={formData.thumbnail_url || ''} onChange={e => setFormData({...formData, thumbnail_url: e.target.value})}
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Descrição</label>
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

export default TrainingCenter;
