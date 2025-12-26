import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Send, Search, Image as ImageIcon, Eye, FileText, Save, Wand2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../../components/Modal';
import { sendEmail } from '../../services/emailService';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface NewsItem {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    featured_image_url?: string;
    published?: boolean;
    sent_by_email?: boolean;
    created_at?: string;
}

const News: React.FC = () => {
    const { isAdmin } = useAuth();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<NewsItem>({
        id: '',
        title: '',
        slug: '',
        summary: '',
        content: '',
        published: true,
        sent_by_email: false
    });

    // Email Blast State
    const [sendEmailNow, setSendEmailNow] = useState(false);
    const [sending, setSending] = useState(false);

    // AI State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                // Ignore 'relation does not exist' for the first render to avoid spamming console if table missing
                if (error.code === '42P01') {
                    console.warn('Tabela News não encontrada. Executar SQL de migração.');
                    return;
                }
                throw error;
            }
            setNews(data || []);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const payload = {
                title: formData.title,
                slug: slug,
                summary: formData.summary,
                content: formData.content,
                featured_image_url: formData.featured_image_url,
                published: formData.published
            };

            let newsId = editingId;

            if (editingId) {
                // Update
                const { error } = await supabase.from('news').update(payload).eq('id', editingId);
                if (error) throw error;
                alert('Notícia atualizada!');
            } else {
                // Create
                const { data, error } = await supabase.from('news').insert([payload]).select().single();
                if (error) throw error;
                newsId = data.id;
                alert('Notícia criada!');
            }

            // Trigger Email Blast if requested
            if (sendEmailNow && newsId) {
                // Instead of manual loop, add to queue for processing
                try {
                    // 1. Get Segments (All active for now)
                    // 2. Add to queue
                    const { data: contacts } = await supabase.from('email_contacts').select('id').eq('status', 'ativo');

                    if (contacts && contacts.length > 0) {
                        const queueItems = contacts.map(c => ({
                            contato_id: c.id,
                            // We should have a template for news, or create one on the fly
                            // For now, let's create a generic entry in the queue
                            status: 'pendente',
                            scheduled_for: new Date().toISOString()
                        }));

                        // Since we don't have a specific template ID here, we might want to create one first.
                        // Optimization: For simplicity in this step, I'll just refactor the blast to use the queue.
                        await handleEmailBlast(newsId, payload.title, payload.summary || '', payload.content || '');
                    }
                } catch (err) {
                    console.error('Queue error:', err);
                }
            }

            setIsModalOpen(false);
            resetForm();
            fetchNews();

        } catch (error: any) {
            alert('Erro: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    const handleEmailBlast = async (newsId: string, title: string, summary: string, content: string) => {
        if (!confirm('ATENÇÃO: Isso enviará um email para TODOS os contatos ativos. Deseja continuar?')) return;

        try {
            // 1. Fetch Recipients from the new Email Marketing base
            const { data: recipientsArray, error: rError } = await supabase
                .from('email_contacts')
                .select('id, email, nome')
                .eq('status', 'ativo');

            if (rError) throw rError;
            if (!recipientsArray || recipientsArray.length === 0) throw new Error('Nenhum destinatário ativo encontrado.');

            // 2. Create a template for this news item
            const { data: template, error: tError } = await supabase.from('email_templates').insert({
                nome_template: `Notícia: ${title.substring(0, 30)}...`,
                tipo: 'noticia',
                assunto: `[Nova Notícia] ${title}`,
                corpo_html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #3a7ad1;">{{titulo}}</h2>
                        <p>{{resumo}}</p>
                        <hr style="border:0; border-top:1px solid #eee; margin: 20px 0;">
                        <div style="color: #555;">{{conteudo}}</div>
                        <br/>
                        <a href="{{link}}" style="display:inline-block; padding: 10px 20px; background: #3a7ad1; color: white; text-decoration: none; border-radius: 5px;">Ler no Site</a>
                    </div>
                `,
                variaveis: ['titulo', 'resumo', 'conteudo', 'link']
            }).select().single();

            if (tError) throw tError;

            // 3. Add everyone to queue
            const queuePayload = recipientsArray.map(r => ({
                contato_id: r.id,
                template_id: template.id,
                status: 'pendente',
                scheduled_for: new Date().toISOString()
            }));

            // Chunk inserts if too many
            for (let i = 0; i < queuePayload.length; i += 100) {
                await supabase.from('email_queue').insert(queuePayload.slice(i, i + 100));
            }

            // 4. Mark as sent
            await supabase.from('news').update({ sent_by_email: true }).eq('id', newsId);

            alert(`Adicionado à fila de envio para ${recipientsArray.length} contatos com sucesso!`);

        } catch (error: any) {
            console.error('Blast Error:', error);
            alert('Erro ao agendar envio de email: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza?')) return;
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (!error) fetchNews();
    };

    const openEdit = (item: NewsItem) => {
        setEditingId(item.id);
        setFormData(item);
        setIsModalOpen(true);
        setSendEmailNow(false);
    };

    const openNew = () => {
        setEditingId(null);
        setFormData({ id: '', title: '', slug: '', summary: '', content: '', published: true });
        setIsModalOpen(true);
        setSendEmailNow(false);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ id: '', title: '', slug: '', summary: '', content: '', published: true });
        setSendEmailNow(false);
    };

    // --- AI Generation Logic ---
    const handleGenerateContent = async () => {
        if (!aiTopic) return alert('Por favor, descreva o tema.');
        if (!apiKey) return alert('API Key do Gemini não configurada. Adicione ao .env ou configure aqui.');

        setAiGenerating(true);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `
                Crie um artigo de blog completo e profissional sobre: "${aiTopic}".
                O artigo deve ser focado no mercado de leilões, investimentos ou mercado imobiliário (conforme o tema).
                Retorne APENAS um objeto JSON (sem markdown code blocks em volta) com o seguinte formato:
                {
                    "title": "Um título chamativo e otimizado para SEO",
                    "summary": "Um resumo curto e engajador de 2 parágrafos",
                    "content": "O conteúdo completo do artigo em HTML (use <h3>, <p>, <ul>, <li>, <strong>). NÃO use tags <h1> ou <h2> no conteúdo."
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean markdown chunks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanText);

            setFormData(prev => ({
                ...prev,
                title: data.title,
                summary: data.summary,
                content: data.content
            }));

            setIsAiModalOpen(false);
            setAiTopic('');
            alert('Conteúdo gerado com sucesso! Revise antes de publicar.');

        } catch (error: any) {
            console.error('GenAI Error:', error);
            alert('Erro ao gerar conteúdo: ' + error.message);
        } finally {
            setAiGenerating(false);
        }
    };

    const filteredNews = news.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!isAdmin) return <div className="p-8">Acesso restrito.</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-[#3a7ad1]" /> Gestão de Notícias
                    </h2>
                    <p className="text-gray-500">Publique novidades e notifique toda a base.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={openNew} className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a61b0]">
                        <Plus size={20} /> Nova Notícia
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            placeholder="Buscar notícias..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-[#3a7ad1]"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
                            <tr>
                                <th className="p-4">Título</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Email Enviado?</th>
                                <th className="p-4">Data</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Carregando...</td></tr>
                            ) : filteredNews.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhuma notícia encontrada.</td></tr>
                            ) : (
                                filteredNews.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 group">
                                        <td className="p-4 font-medium text-gray-800">{item.title}</td>
                                        <td className="p-4">
                                            {item.published ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Publicado</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">Rascunho</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {item.sent_by_email ? (
                                                <span className="flex items-center gap-1 text-blue-600 text-sm"><Send size={14} /> Sim</span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Não</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {new Date(item.created_at || '').toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Edição */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Notícia' : 'Nova Notícia'}>
                <form onSubmit={handleSave} className="space-y-4">

                    {/* Botão AI */}
                    <div className="p-4 bg-purple-50 rounded-lg flex justify-between items-center border border-purple-100 mb-4">
                        <div className="flex items-center gap-2">
                            <Wand2 size={24} className="text-purple-600" />
                            <span className="text-purple-900 font-bold text-sm">Sem ideias? Deixe a IA escrever para você!</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAiModalOpen(true)}
                            className="bg-purple-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm"
                        >
                            Gerar com IA
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Título *</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:border-[#3a7ad1]"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Resumo (opcional)</label>
                        <textarea
                            className="w-full border rounded-lg p-2 outline-none focus:border-[#3a7ad1] h-20"
                            value={formData.summary}
                            onChange={e => setFormData({ ...formData, summary: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Conteúdo (HTML aceito)</label>
                        <textarea
                            className="w-full border rounded-lg p-2 outline-none focus:border-[#3a7ad1] h-40 font-mono text-sm"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-4 py-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.published}
                                onChange={e => setFormData({ ...formData, published: e.target.checked })}
                                className="w-5 h-5 accent-[#3a7ad1]"
                            />
                            <span className="text-gray-700 font-medium">Publicar no Site</span>
                        </label>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sendEmailNow}
                                onChange={e => setSendEmailNow(e.target.checked)}
                                className="w-5 h-5 accent-[#3a7ad1] mt-0.5"
                                disabled={!!editingId && formData.sent_by_email}
                            />
                            <div>
                                <span className="text-gray-800 font-bold block mb-1">Enviar Email Automático?</span>
                                <span className="text-sm text-gray-600">Se marcado, ao salvar, um email será disparado para TODA a base (leads + usuários) com o conteúdo desta notícia.</span>
                                {formData.sent_by_email && <p className="text-xs text-orange-600 mt-1 font-bold">Atenção: Esta notícia já foi enviada anteriormente.</p>}
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="bg-[#3a7ad1] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#2a61b0] disabled:opacity-50 flex items-center gap-2"
                        >
                            {sending ? 'Processando...' : <><Save size={18} /> Salvar e Continuar</>}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal AI */}
            <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Gerador de Conteúdo IA">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        Digite um tema abaixo (ex: "5 Dicas para investir em leilões") e a Inteligência Artificial escreverá o artigo para você com formatação HTML pronta.
                    </p>

                    {!import.meta.env.VITE_GEMINI_API_KEY && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">API Key (Gemini)</label>
                            <input
                                type="password"
                                className="w-full border rounded-lg p-2 text-sm"
                                placeholder="Cole sua API Key do Google aqui..."
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                            />
                            <p className="text-xs text-gray-400 mt-1">Nós não salvaremos sua chave, ela é usada apenas nesta sessão.</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Sobre o que é o artigo?</label>
                        <textarea
                            className="w-full border rounded-lg p-3 h-24 outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: Guia completo sobre como arrematar imóveis com segurança..."
                            value={aiTopic}
                            onChange={e => setAiTopic(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleGenerateContent}
                            disabled={aiGenerating}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 w-full justify-center"
                        >
                            {aiGenerating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>
                                    Escrevendo Mágica...
                                </>
                            ) : (
                                <><Wand2 size={18} /> Gerar Artigo</>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default News;
