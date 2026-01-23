import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MarketingMaterial } from '../../../types';
import { 
    PenTool,
    Image,
    Video,
    FileText,
    Download, 
    Share2, 
    Eye, 
    Search,
    Plus,
    X
} from 'lucide-react';

const MarketingCenter = () => {
    const [materials, setMaterials] = useState<MarketingMaterial[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('marketing_materials')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setMaterials(data || []);
        setLoading(false);
    };

    const filteredMaterials = materials.filter(m => activeTab === 'all' || m.type === activeTab);

    return (
        <div className="space-y-6 text-white text-sans">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Material de Marketing</h1>
                    <p className="text-gray-400">Recursos visuais e templates para sua franquia.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <input 
                        type="text" 
                        placeholder="Pesquisar materiais..." 
                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1e293b] rounded-2xl p-4 border border-white/5 text-center">
                    <h3 className="text-2xl font-bold">{materials.length}</h3>
                    <p className="text-xs text-gray-400 uppercase">Total de Materiais</p>
                </div>
                <div className="bg-[#1e293b] rounded-2xl p-4 border border-white/5 text-center">
                    <h3 className="text-2xl font-bold text-green-400">12</h3>
                    <p className="text-xs text-gray-400 uppercase">Novos este mês</p>
                </div>
                <div className="bg-[#1e293b] rounded-2xl p-4 border border-white/5 text-center">
                    <h3 className="text-2xl font-bold text-blue-400">156</h3>
                    <p className="text-xs text-gray-400 uppercase">Downloads</p>
                </div>
                 <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 rounded-2xl p-4 flex flex-col items-center justify-center transition-colors group"
                >
                    <Plus className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Novo Material</span>
                </button>
            </div>

             {/* Tabs */}
             <div className="flex bg-[#1e293b] rounded-xl p-1 overflow-x-auto">
                {[
                    { id: 'all', label: 'Todos' },
                    { id: 'banner', label: 'Banners' },
                    { id: 'flyer', label: 'Flyers' },
                    { id: 'video', label: 'Vídeos' },
                    { id: 'template', label: 'Templates' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === tab.id ? 'bg-white text-gray-900 shadow-lg font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? <p>Carregando...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map(item => <MaterialCard key={item.id} item={item} />)}
                </div>
            )}

            {/* Footer Actions */}
            <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
                <h3 className="font-bold text-lg mb-2">Ações Rápidas</h3>
                <p className="text-gray-400 text-sm mb-4">Baixe pacotes completos de materiais.</p>
                
                <div className="space-y-2">
                    <button className="w-full flex justify-between items-center bg-[#0a0f1d] hover:bg-blue-900/20 px-4 py-3 rounded-xl border border-white/10 transition-colors group">
                        <span className="font-medium group-hover:text-blue-400 transition-colors">Baixar Kit Completo 2024</span>
                        <Download size={18} className="text-gray-500 group-hover:text-blue-400" />
                    </button>
                    <button className="w-full flex justify-between items-center bg-[#0a0f1d] hover:bg-blue-900/20 px-4 py-3 rounded-xl border border-white/10 transition-colors group">
                        <span className="font-medium group-hover:text-blue-400 transition-colors">Solicitar Material Personalizado</span>
                        <Share2 size={18} className="text-gray-500 group-hover:text-blue-400" />
                    </button>
                </div>
            </div>

             {/* Modal */}
             {showModal && (
                <AddMaterialModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchMaterials(); }} />
            )}
        </div>
    );
};

const MaterialCard = ({ item }: { item: MarketingMaterial }) => {
    const Icon = item.type === 'video' ? Video : item.type === 'template' ? PenTool : Image;

    return (
        <div className="bg-[#1e293b] rounded-2xl p-4 border border-white/5 hover:border-blue-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <Icon size={20} className="text-gray-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{item.description}</p>
                    </div>
                </div>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300 uppercase">
                    {item.type}
                </span>
            </div>

            {/* Preview Area */}
            <div className="aspect-video bg-[#0f172a] rounded-xl mb-4 overflow-hidden relative group-image">
                {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={item.title} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <Image size={48} />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4 px-1">
               <span>Tamanho: 1920x1080</span>
               <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 py-2 bg-[#0f172a] hover:bg-blue-600 rounded-lg text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
                    <Download size={14} /> Baixar
                </button>
                <button className="p-2 bg-[#0f172a] hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <Eye size={16} />
                </button>
                <button className="p-2 bg-[#0f172a] hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <Share2 size={16} />
                </button>
            </div>
        </div>
    );
};

const AddMaterialModal = ({ onClose, onSuccess }: any) => {
    const [formData, setFormData] = useState<Partial<MarketingMaterial>>({
        title: '',
        description: '',
        type: 'banner',
        file_url: '',
        thumbnail_url: ''
    });

    const handleSave = async () => {
        if (!formData.title || !formData.file_url) return alert('Campos obrigatórios');
        const { error } = await supabase.from('marketing_materials').insert([{ ...formData }]);
        if (error) alert('Erro ao salvar');
        else onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e293b] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Novo Material</h3>
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
                            value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="banner">Banner</option>
                            <option value="flyer">Flyer</option>
                            <option value="video">Vídeo</option>
                            <option value="template">Template</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">URL do Arquivo</label>
                        <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            value={formData.file_url} onChange={e => setFormData({...formData, file_url: e.target.value})}
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

export default MarketingCenter;
