import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Image, Video, Download, Copy, Wand2, Layout, FolderOpen, Facebook, Instagram, Linkedin, FileType, Trash2, Edit, Mail, Send, Users } from 'lucide-react';
import { sendEmail } from '../../services/emailService';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../../components/Modal';

interface Material {
    id: string;
    title: string;
    file_url: string;
    type: string; // 'image', 'video' (legacy) or format
    category: 'template' | 'asset' | 'guide';
    platform: 'facebook' | 'instagram_feed' | 'instagram_story' | 'linkedin' | 'general';
    format: string;
    created_at: string;
}

const Marketing: React.FC = () => {
    const { isAdmin } = useAuth();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'templates' | 'assets' | 'ai' | 'email'>('templates');
    const [filterPlatform, setFilterPlatform] = useState<string>('all');

    // Email State
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    // Modal & Editing State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [currentMaterial, setCurrentMaterial] = useState({
        title: '',
        file_url: '',
        type: 'image',
        category: 'template',
        platform: 'instagram_feed',
        format: 'jpg'
    });

    // AI State
    const [aiTopic, setAiTopic] = useState('');
    const [aiTone, setAiTone] = useState('professional');
    const [aiResult, setAiResult] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const { data, error } = await supabase
                .from('marketing_materials')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMaterials(data || []);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                const { error } = await supabase
                    .from('marketing_materials')
                    .update(currentMaterial)
                    .eq('id', editingId);
                if (error) throw error;
                alert('Material atualizado com sucesso!');
            } else {
                // Create
                const { error } = await supabase.from('marketing_materials').insert([currentMaterial]);
                if (error) throw error;
                alert('Material publicado com sucesso!');
            }

            setIsModalOpen(false);
            resetForm();
            fetchMaterials();
        } catch (error: any) {
            alert('Erro ao salvar material: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este material?')) return;
        try {
            const { error } = await supabase.from('marketing_materials').delete().eq('id', id);
            if (error) throw error;
            fetchMaterials();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const handleEdit = (material: Material) => {
        setEditingId(material.id);
        setCurrentMaterial({
            title: material.title,
            file_url: material.file_url,
            type: material.type,
            category: material.category,
            platform: material.platform,
            format: material.format
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setCurrentMaterial({ title: '', file_url: '', type: 'image', category: 'template', platform: 'instagram_feed', format: 'jpg' });
    };

    const openNewModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const generateAIContent = async () => {
        if (!aiTopic) return alert('Por favor, digite um tema.');
        setIsGenerating(true);

        // Simulation of AI call (In real app, call OpenAI API here)
        // Since we don't have a backend proxy set up for secure keys yet, we simulate.
        setTimeout(() => {
            const templates = [
                `🚀 Transforme seu negócio hoje mesmo com ${aiTopic}! \n\nDescubra como nossa solução pode ajudar você a alcançar novos patamares. Agende uma visita e saiba mais! #Inovação #${aiTopic.replace(' ', '')} #Sucesso`,
                `✨ Novidade incrível sobre ${aiTopic}! \n\nVocê não vai querer ficar de fora dessa. A qualidade que você já confia, agora com muito mais vantagens. \n\n📍 Venha conferir!`,
                `💡 Dica do dia: ${aiTopic} é fundamental para quem busca eficiência. \n\nInvista no que realmente traz retorno. Fale com nossos especialistas hoje mesmo.`
            ];
            const random = templates[Math.floor(Math.random() * templates.length)];
            setAiResult(random);
            setIsGenerating(false);
        }, 1500);
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('Deseja enviar este email para TODOS os usuários?')) return;

        setSendingEmail(true);
        try {
            // Fetch all users emails
            const { data: users, error } = await supabase
                .from('profiles')
                .select('email, full_name');

            if (error) throw error;
            if (!users || users.length === 0) throw new Error('Nenhum destinatário encontrado.');

            let successCount = 0;

            // Send individually (could be batched in backend but keeping simple loop here)
            // or pass full list to backend if backend supported bulk.
            // Our backend currently takes single "to". We can loop here.

            for (const user of users) {
                if (!user.email) continue;
                await sendEmail({
                    to: user.email,
                    subject: emailSubject,
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333;">
                            <p>Olá, ${user.full_name || 'Parceiro'},</p>
                            ${emailBody}
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #999;">Enviado via Sistema Elance</p>
                        </div>
                    `
                });
                successCount++;
            }

            alert(`Email enviado para ${successCount} usuários com sucesso!`);
            setEmailSubject('');
            setEmailBody('');
        } catch (error: any) {
            alert('Erro ao enviar emails: ' + error.message);
        } finally {
            setSendingEmail(false);
        }
    };

    const filteredMaterials = materials.filter(m => {
        if (activeTab === 'templates') return m.category === 'template';
        if (activeTab === 'assets') return m.category === 'asset';
        return true;
    }).filter(m => {
        if (activeTab !== 'templates') return true;
        if (filterPlatform === 'all') return true;
        return m.platform === filterPlatform;
    });

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'facebook': return <Facebook size={16} className="text-blue-600" />;
            case 'instagram_feed':
            case 'instagram_story': return <Instagram size={16} className="text-pink-600" />;
            case 'linkedin': return <Linkedin size={16} className="text-blue-700" />;
            default: return <Layout size={16} className="text-gray-500" />;
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Centro de Marketing</h2>
                    <p className="text-gray-500">Crie, baixe e compartilhe conteúdos incríveis.</p>
                </div>
                {isAdmin && activeTab !== 'ai' && activeTab !== 'email' && (
                    <button
                        onClick={openNewModal}
                        className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a61b0] transition-colors"
                    >
                        <Plus size={20} />
                        Novo Material
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'templates' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Layout size={18} /> Templates de Redes Sociais
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('assets')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'assets' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <FolderOpen size={18} /> Logos e Ativos
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'ai' ? 'border-[#8a2be2] text-[#8a2be2]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Wand2 size={18} /> Criador com IA
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('email')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'email' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Mail size={18} /> Email Marketing
                    </div>
                </button>
            </div>

            {/* Content */}
            {activeTab === 'ai' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Wand2 className="text-purple-600" /> Gerador de Legendas
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Sobre o que é o post?</label>
                                <textarea
                                    className="w-full border rounded-lg p-3 h-32 outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Ex: Promoção de Black Friday com 50% de desconto em todos os serviços..."
                                    value={aiTopic}
                                    onChange={e => setAiTopic(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tom de Voz</label>
                                <select
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={aiTone}
                                    onChange={e => setAiTone(e.target.value)}
                                >
                                    <option value="professional">Profissional e Sério</option>
                                    <option value="excited">Animado e Vendedor</option>
                                    <option value="friendly">Amigável e Próximo</option>
                                </select>
                            </div>
                            <button
                                onClick={generateAIContent}
                                disabled={isGenerating}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? 'Criando Mágica...' : '✨ Gerar Ideias'}
                            </button>
                        </div>
                    </div>

                    {aiResult && (
                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 relative">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Resultado Sugerido</h3>
                            <div className="bg-white p-4 rounded-lg border border-purple-100 text-gray-700 whitespace-pre-wrap min-h-[200px]">
                                {aiResult}
                            </div>
                            <button
                                onClick={() => navigator.clipboard.writeText(aiResult)}
                                className="absolute top-6 right-6 p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Copiar"
                            >
                                <Copy size={20} />
                            </button>
                        </div>
                    )}
                </div>
            ) : activeTab === 'email' ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <Send className="text-[#3a7ad1]" /> Enviar Comunicado
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">Envie novidades, notícias ou avisos para toda a sua base de usuários cadastrados.</p>

                    <form onSubmit={handleSendEmail} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Assunto do Email</label>
                            <input
                                required
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]"
                                value={emailSubject}
                                onChange={e => setEmailSubject(e.target.value)}
                                placeholder="Ex: Novas atualizações na plataforma..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Corpo da Mensagem (HTML aceito)</label>
                            <textarea
                                required
                                className="w-full border rounded-lg p-3 h-48 outline-none focus:ring-2 focus:ring-[#3a7ad1] font-mono text-sm"
                                value={emailBody}
                                onChange={e => setEmailBody(e.target.value)}
                                placeholder="<p>Olá equipe,</p><p>Temos novidades...</p>"
                            />
                            <p className="text-xs text-gray-400 mt-1">Você pode usar tags HTML básicas para formatar.</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3 text-gray-600 text-sm">
                            <Users size={16} />
                            <span>O email será enviado para <b>todos os usuários</b> cadastrados na sua unidade.</span>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                type="submit"
                                disabled={sendingEmail}
                                className="bg-[#3a7ad1] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#2a61b0] flex items-center gap-2 disabled:opacity-50"
                            >
                                {sendingEmail ? 'Enviando...' : 'Enviar para Todos'} <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    {activeTab === 'templates' && (
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {['all', 'instagram_feed', 'instagram_story', 'facebook', 'linkedin'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setFilterPlatform(p)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize border ${filterPlatform === p
                                        ? 'bg-gray-800 text-white border-gray-800'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {p.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {loading ? (
                            <p className="text-gray-500">Carregando materiais...</p>
                        ) : filteredMaterials.length === 0 ? (
                            <div className="col-span-full py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Image size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">Nenhum material encontrado nesta categoria.</p>
                            </div>
                        ) : (
                            filteredMaterials.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow relative">
                                    <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                        {item.type === 'video' ? (
                                            <Video size={48} className="text-gray-300" />
                                        ) : (
                                            <img src={item.file_url} alt={item.title} className="w-full h-full object-cover" />
                                        )}

                                        <div className="absolute top-2 right-2 flex gap-1">
                                            {item.platform && item.platform !== 'general' && (
                                                <span className="bg-white/90 p-1.5 rounded-full shadow-sm text-gray-700">
                                                    {getPlatformIcon(item.platform)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                            <a
                                                href={item.file_url}
                                                download
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full text-[#3a7ad1] font-bold hover:scale-105 transition-transform shadow-lg"
                                            >
                                                <Download size={18} /> Baixar
                                            </a>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-sm line-clamp-2" title={item.title}>{item.title}</h3>
                                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide font-semibold">{item.format || 'Arquivo'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Controls */}
                                    {isAdmin && (
                                        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-1.5 bg-white/90 rounded text-blue-600 hover:bg-blue-50 shadow-sm"
                                                title="Editar"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1.5 bg-white/90 rounded text-red-500 hover:bg-red-50 shadow-sm"
                                                title="Excluir"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Editar Material" : "Novo Material"}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]"
                            value={currentMaterial.title}
                            onChange={e => setCurrentMaterial({ ...currentMaterial, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">URL do Arquivo</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#3a7ad1]"
                            value={currentMaterial.file_url}
                            onChange={e => setCurrentMaterial({ ...currentMaterial, file_url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                            <select
                                className="w-full border rounded-lg p-2 outline-none"
                                value={currentMaterial.category}
                                onChange={e => setCurrentMaterial({ ...currentMaterial, category: e.target.value as any })}
                            >
                                <option value="template">Template Social</option>
                                <option value="asset">Ativo (Logo/Foto)</option>
                                <option value="guide">Guia/PDF</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Formato</label>
                            <select
                                className="w-full border rounded-lg p-2 outline-none"
                                value={currentMaterial.format}
                                onChange={e => setCurrentMaterial({ ...currentMaterial, format: e.target.value })}
                            >
                                <option value="jpg">Imagem (JPG)</option>
                                <option value="png">Imagem (PNG e Transp.)</option>
                                <option value="video">Vídeo (MP4)</option>
                                <option value="canva">Link Canva</option>
                                <option value="psd">Photoshop (PSD)</option>
                            </select>
                        </div>
                    </div>

                    {currentMaterial.category === 'template' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Plataforma</label>
                            <div className="flex flex-wrap gap-2">
                                {['instagram_feed', 'instagram_story', 'facebook', 'linkedin'].map(plat => (
                                    <button
                                        type="button"
                                        key={plat}
                                        onClick={() => setCurrentMaterial({ ...currentMaterial, platform: plat as any })}
                                        className={`px-3 py-1.5 text-xs font-bold uppercase rounded border ${currentMaterial.platform === plat
                                            ? 'bg-[#3a7ad1] text-white border-[#3a7ad1]'
                                            : 'bg-white text-gray-500 border-gray-200'
                                            }`}
                                    >
                                        {plat.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0] font-medium shadow-sm"
                        >
                            {editingId ? 'Salvar Alterações' : 'Publicar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Marketing;
