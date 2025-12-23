import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { sendMessageToGemini } from '../../lib/gemini';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Plus, MessageSquare, Scale, Loader2, Trash2 } from 'lucide-react';

interface Message {
    id?: string;
    role: 'user' | 'model';
    content: string;
    created_at?: string;
}

interface ChatSession {
    id: string;
    title: string;
    created_at: string;
}

const AiAssistant: React.FC = () => {
    const { user } = useAuth();
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true); // Responsive sidebar
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) fetchChats();
    }, [user]);

    useEffect(() => {
        if (currentChatId) {
            fetchMessages(currentChatId);
        } else {
            setMessages([]);
        }
    }, [currentChatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchChats = async () => {
        const { data, error } = await supabase
            .from('ai_chats')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });
        if (error) console.error(error);
        else {
            setChats(data || []);
            if (data && data.length > 0 && !currentChatId) {
                // Optionally auto-select first chat? No, start fresh or let user pick.
            }
        }
    };

    const fetchMessages = async (chatId: string) => {
        const { data, error } = await supabase
            .from('ai_messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });
        if (error) console.error(error);
        else setMessages(data || []);
    };

    const createNewChat = async () => {
        const { data, error } = await supabase
            .from('ai_chats')
            .insert({ user_id: user?.id, title: 'Nova Conversa' })
            .select()
            .single();
        if (error) {
            console.error(error);
            alert('Erro ao criar conversa.');
            return;
        }
        setChats([data, ...chats]);
        setCurrentChatId(data.id);
        setMessages([]);
    };

    const deleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        if (!confirm('Excluir esta conversa?')) return;

        await supabase.from('ai_chats').delete().eq('id', chatId);
        setChats(chats.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
            setCurrentChatId(null);
            setMessages([]);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        if (loading) return;

        const userMsg = input.trim();
        setInput('');
        setLoading(true);

        const tempMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(tempMessages as Message[]); // Optimistic update

        try {
            let activeChatId = currentChatId;

            // Create chat if none exists
            if (!activeChatId) {
                const { data, error } = await supabase
                    .from('ai_chats')
                    .insert({
                        user_id: user?.id,
                        title: userMsg.slice(0, 30) + '...' // First msg title
                    })
                    .select()
                    .single();
                if (error) throw error;
                activeChatId = data.id;
                setChats([data, ...chats]);
                setCurrentChatId(data.id);
            }

            // Save User Message
            await supabase.from('ai_messages').insert({
                chat_id: activeChatId,
                role: 'user',
                content: userMsg
            });

            // Call Gemini
            const aiResponseText = await sendMessageToGemini(messages, userMsg);

            // Save AI Message
            await supabase.from('ai_messages').insert({
                chat_id: activeChatId,
                role: 'model',
                content: aiResponseText
            });

            // Update UI
            await fetchMessages(activeChatId!);

        } catch (error: any) {
            console.error(error);
            alert('Erro: ' + error.message);
            // Rollback optimistic? For simple chat, maybe just alert.
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-4">
            {/* Sidebar */}
            <div className={`w-80 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col ${!sidebarOpen ? 'hidden md:flex' : ''}`}>
                <div className="p-4 border-b">
                    <button
                        onClick={createNewChat}
                        className="w-full bg-[#3a7ad1] text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-[#2a61b0] transition"
                    >
                        <Plus size={20} /> Nova Conversa
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setCurrentChatId(chat.id)}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${currentChatId === chat.id ? 'bg-blue-50 border-blue-100 text-[#3a7ad1]' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <MessageSquare size={18} />
                                <span className="truncate text-sm font-medium">{chat.title}</span>
                            </div>
                            <button
                                onClick={(e) => deleteChat(e, chat.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {chats.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-8">Nenhuma conversa salva.</p>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                    <div className="bg-[#3a7ad1] p-2 rounded-lg text-white">
                        <Scale size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800">I.A. Jurídica - Especialista Imobiliário</h2>
                        <p className="text-xs text-gray-500">Tire dúvidas sobre Leis, Leilões e Penhoras.</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                            <Scale size={64} className="text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-500">Como posso ajudar hoje?</h3>
                            <p className="text-gray-400 max-w-md mt-2">Pergunte sobre Lei do Inquilinato, processos de despejo, regras de leilão ou análise de penhoras.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-[#3a7ad1] text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    {/* Simple formatting for AI response parsing could be added (markdown) */}
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 rounded-tl-none flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-[#3a7ad1]" />
                                <span className="text-gray-400 text-xs">Analisando legislação...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t">
                    <div className="flex gap-2">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            placeholder="Digite sua dúvida jurídica aqui..."
                            className="flex-1 border rounded-xl p-3 focus:ring-2 focus:ring-[#3a7ad1] outline-none resize-none h-14 max-h-32 shadow-sm text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-[#3a7ad1] text-white rounded-xl w-14 flex items-center justify-center hover:bg-[#2a61b0] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                        A I.A. pode cometer erros. Sempre verifique as informações com a legislação oficial.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AiAssistant;
