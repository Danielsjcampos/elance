import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, PlayCircle, Trophy, BookOpen, HelpCircle, CheckCircle, Video, FileText, X, Award, Medal, MonitorPlay, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// --- Types ---
interface QuizQuestion {
    question: string;
    options: string[];
    correct: number;
}

interface Training {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'ebook' | 'quiz';
    content_url?: string;
    points: number;
    quiz_data?: QuizQuestion[];
    completed?: boolean; // For UI state
}

interface LeaderboardEntry {
    profile_id: string;
    full_name: string;
    total_points: number;
    trainings_completed: number;
    avatar_url?: string;
}

const Training: React.FC = () => {
    const { isAdmin, user } = useAuth();
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'video' | 'ebook' | 'quiz' | 'ranking'>('all');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(null); // For viewing/playing

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchTrainings(), fetchLeaderboard()]);
        setLoading(false);
    };

    const fetchTrainings = async () => {
        try {
            // 1. Fetch Trainings contents (Priority)
            const { data: trainingData, error: tError } = await supabase
                .from('trainings')
                .select('*')
                .order('created_at', { ascending: false });

            if (tError) {
                console.error('Error fetching trainings content:', tError);
                throw tError;
            }

            // 2. Try to fetch completions (Secondary)
            let completedIds = new Set();
            if (user?.id) {
                try {
                    const { data: completionData, error: cError } = await supabase
                        .from('training_completions')
                        .select('training_id')
                        .eq('user_id', user.id);

                    if (completionData) {
                        completedIds = new Set(completionData.map(c => c.training_id));
                    }
                } catch (err) {
                    console.warn('Could not fetch completions (ignoring):', err);
                }
            }

            const formatted = (trainingData || []).map(t => ({
                ...t,
                completed: completedIds.has(t.id)
            }));

            // console.log('Loaded trainings:', formatted); 
            setTrainings(formatted);
        } catch (error: any) {
            console.error('Critical error fetching trainings:', error);
            alert('Erro ao carregar treinamentos: ' + error.message);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            // Use RPC to bypass RLS and get global ranking
            const { data, error } = await supabase
                .rpc('get_leaderboard');

            if (error) throw error;
            // RPC returns distinct types, map if necessary or just set
            setLeaderboard(data?.slice(0, 100) || []);
        } catch (error) {
            console.error('Leaderboard error:', error);
        }
    };

    // --- Actions ---
    const handleCreate = async (data: Partial<Training>) => {
        try {
            const { error } = await supabase.from('trainings').insert([data]);
            if (error) throw error;
            setShowCreateModal(false);
            fetchData();
            alert('Treinamento criado com sucesso!');
        } catch (error: any) {
            alert('Erro ao criar: ' + error.message);
        }
    };

    const handleComplete = async (trainingId: string, score?: number) => {
        try {
            const { error } = await supabase.from('training_completions').insert([{
                user_id: user?.id,
                training_id: trainingId,
                score: score || 0
            }]);

            if (error) {
                if (error.code === '23505') return; // Already completed (Unique constraint)
                throw error;
            }

            // Refresh to show points update
            fetchData();
            // Close modal if open
            setSelectedTraining(null);
            alert(`Parabéns! Você completou este treinamento.`);
        } catch (error: any) {
            console.error(error);
            alert('Erro ao registrar conclusão: ' + error.message);
        }
    };

    // --- Render Helpers ---
    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video size={20} />;
            case 'ebook': return <BookOpen size={20} />;
            case 'quiz': return <HelpCircle size={20} />;
            default: return <PlayCircle size={20} />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'video': return 'text-blue-500 bg-blue-50';
            case 'ebook': return 'text-orange-500 bg-orange-50';
            case 'quiz': return 'text-purple-500 bg-purple-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    const filteredTrainings = activeTab === 'all' ? trainings : trainings.filter(t => t.type === activeTab);

    return (
        <div className="space-y-8">
            {/* Header & Leaderboard */}
            <div className="bg-gradient-to-r from-[#151d38] to-[#2a3b6e] rounded-2xl p-6 text-white shadow-lg">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <Trophy className="text-yellow-400" size={32} />
                            Ranking de Excelência
                        </h2>
                        <p className="text-blue-200 mt-2">Complete treinamentos, ganhe pontos e destaque-se na rede E-Lance.</p>

                        <div className="mt-6 flex flex-wrap gap-4">
                            {leaderboard.slice(0, 3).map((entry, idx) => (
                                <div key={entry.profile_id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${idx === 0 ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-white/10 border-white/10'}`}>
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-300 text-black' : 'bg-orange-400 text-black'}`}>
                                            {idx + 1}
                                        </div>
                                        {idx === 0 && <Award className="absolute -top-2 -right-2 text-yellow-500" size={20} fill="currentColor" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{entry.full_name || 'Usuário'}</p>
                                        <p className="text-xs text-yellow-200 font-mono">{entry.total_points} pts</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['all', 'video', 'ebook', 'quiz', 'ranking'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-white shadow text-[#3a7ad1]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab === 'all' ? 'Todos' : tab === 'ranking' ? 'Ranking Geral' : tab + 's'}
                        </button>
                    ))}
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a61b0] transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Novo Conteúdo
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'ranking' ? (
                    <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Trophy className="text-yellow-500" size={20} />
                                Ranking Geral
                            </h3>
                            <p className="text-sm text-gray-500">Veja a pontuação de todos os franqueados e colaboradores.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4 w-20 text-center">Posição</th>
                                        <th className="px-6 py-4">Usuário</th>
                                        <th className="px-6 py-4 text-center">Treinamentos</th>
                                        <th className="px-6 py-4 text-right">Pontuação Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leaderboard.map((entry, idx) => (
                                        <tr key={entry.profile_id} className={`hover:bg-gray-50 transition-colors ${entry.profile_id === user?.id ? 'bg-blue-50/50' : ''}`}>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        idx === 1 ? 'bg-gray-100 text-gray-700' :
                                                            idx === 2 ? 'bg-orange-100 text-orange-700' :
                                                                'text-gray-500'
                                                    }`}>
                                                    {idx + 1}º
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                                        {entry.avatar_url ? (
                                                            <img src={entry.avatar_url} alt={entry.full_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            entry.full_name?.charAt(0).toUpperCase() || 'U'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium ${entry.profile_id === user?.id ? 'text-[#3a7ad1]' : 'text-gray-800'}`}>
                                                            {entry.full_name || 'Usuário sem nome'}
                                                            {entry.profile_id === user?.id && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Você</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle size={12} />
                                                    {entry.trainings_completed} concluídos
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-lg font-bold text-[#3a7ad1]">{entry.total_points}</span> <span className="text-xs text-gray-400">pts</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : loading ? (
                    <p className="text-gray-500 col-span-3 text-center py-10">Carregando...</p>
                ) : filteredTrainings.length === 0 ? (
                    <p className="text-gray-500 col-span-3 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Nenhum conteúdo encontrado nesta categoria.
                    </p>
                ) : (
                    filteredTrainings.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                            <div className="h-40 bg-gray-200 relative cursor-pointer overflow-hidden" onClick={() => setSelectedTraining(item)}>
                                {item.content_url?.includes('youtube') ? (
                                    <img
                                        src={`https://img.youtube.com/vi/${item.content_url.split('v=')[1]}/0.jpg`}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center ${getColor(item.type)} bg-opacity-20`}>
                                        {getIcon(item.type)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    {item.completed ? (
                                        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg transform scale-100">
                                            <CheckCircle size={32} />
                                        </div>
                                    ) : (
                                        <div className="bg-white/90 text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            <PlayCircle size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                    <Trophy size={12} className="text-yellow-400" />
                                    {item.points} pts
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getColor(item.type)}`}>
                                        {item.type}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800 mb-2 leading-tight">{item.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{item.description}</p>

                                <button
                                    onClick={() => setSelectedTraining(item)}
                                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors mt-auto ${item.completed ? 'bg-green-100 text-green-700' : 'bg-[#3a7ad1] text-white hover:bg-[#2a61b0]'}`}
                                >
                                    {item.completed ? 'Concluído' : 'Iniciar'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && <CreateTrainingModal onClose={() => setShowCreateModal(false)} onSave={handleCreate} />}

            {/* Player/Quiz Modal */}
            {selectedTraining && (
                <PlayerModal
                    training={selectedTraining}
                    onClose={() => setSelectedTraining(null)}
                    onComplete={handleComplete}
                />
            )}
        </div>
    );
};

// --- Sub-Components ---

const CreateTrainingModal = ({ onClose, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<Training>>({ type: 'video', points: 10 });
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

    const addQuestion = () => {
        setQuizQuestions([...quizQuestions, { question: '', options: ['', '', '', ''], correct: 0 }]);
    };

    const updateQuestion = (idx: number, field: string, value: any) => {
        const newQs = [...quizQuestions];
        const q: any = newQs[idx];
        if (field === 'options') {
            // Handle options differently? No, simpler to just assume value is array or handle index
        } else {
            q[field] = value;
        }
        setQuizQuestions(newQs);
    };

    const handleSave = () => {
        onSave({ ...formData, quiz_data: formData.type === 'quiz' ? quizQuestions : null });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="font-bold text-xl">Novo Treinamento</h3>
                    <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Título</label>
                            <input className="w-full border rounded p-2" onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Tipo</label>
                            <select className="w-full border rounded p-2" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                                <option value="video">Vídeo</option>
                                <option value="ebook">Ebook (PDF)</option>
                                <option value="quiz">Quiz</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Descrição</label>
                        <textarea className="w-full border rounded p-2" rows={3} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Pontos</label>
                            <input type="number" className="w-full border rounded p-2" value={formData.points} onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) })} />
                        </div>
                        {formData.type !== 'quiz' && (
                            <div>
                                <label className="block text-sm font-bold mb-1">URL do Conteúdo</label>
                                <input className="w-full border rounded p-2" placeholder="Youtube URL ou PDF Link" onChange={e => setFormData({ ...formData, content_url: e.target.value })} />
                            </div>
                        )}
                    </div>

                    {formData.type === 'quiz' && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="font-bold flex justify-between items-center">
                                Perguntas do Quiz
                                <button onClick={addQuestion} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">+ Add</button>
                            </h4>
                            <div className="space-y-4 mt-4">
                                {quizQuestions.map((q, qIdx) => (
                                    <div key={qIdx} className="bg-white p-3 rounded shadow-sm">
                                        <input
                                            placeholder="Pergunta"
                                            className="w-full border-b mb-2 p-1 font-medium"
                                            value={q.question}
                                            onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex gap-1">
                                                    <input
                                                        type="radio"
                                                        name={`q${qIdx}`}
                                                        checked={q.correct === oIdx}
                                                        onChange={() => updateQuestion(qIdx, 'correct', oIdx)}
                                                    />
                                                    <input
                                                        className="border rounded px-2 w-full text-sm"
                                                        value={opt}
                                                        onChange={e => {
                                                            const newOpt = [...q.options];
                                                            newOpt[oIdx] = e.target.value;
                                                            const newQs = [...quizQuestions];
                                                            newQs[qIdx].options = newOpt;
                                                            setQuizQuestions(newQs);
                                                        }}
                                                        placeholder={`Opção ${oIdx + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t flex justify-end">
                    <button onClick={handleSave} className="bg-[#3a7ad1] text-white px-6 py-2 rounded-lg font-bold">Salvar Treinamento</button>
                </div>
            </div>
        </div>
    );
};

const PlayerModal = ({ training, onClose, onComplete }: { training: Training, onClose: () => void, onComplete: (id: string, score?: number) => void }) => {
    // Basic Quiz Runner State
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [finishedQuiz, setFinishedQuiz] = useState(false);
    const [score, setScore] = useState(0);

    const handleQuizSubmit = () => {
        if (!training.quiz_data) return;
        let correct = 0;
        training.quiz_data.forEach((q, idx) => {
            if (answers[idx] === q.correct) correct++;
        });
        const finalScore = Math.round((correct / training.quiz_data.length) * 100);
        setScore(finalScore);
        setFinishedQuiz(true);
        if (finalScore >= 70) { // Pass threshold
            onComplete(training.id, finalScore);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-xl overflow-hidden flex flex-col">
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        {training.type === 'video' ? <Video size={20} /> : <BookOpen size={20} />}
                        {training.title}
                    </h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <div className="flex-1 bg-black overflow-y-auto flex items-center justify-center">
                    {training.type === 'video' && training.content_url && (
                        training.content_url.includes('youtube') ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${training.content_url.split('v=')[1]}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <video src={training.content_url} controls className="max-h-full max-w-full" />
                        )
                    )}

                    {training.type === 'ebook' && (
                        <div className="text-white text-center">
                            <FileText size={64} className="mx-auto mb-4 text-gray-500" />
                            <p className="mb-4">Clique abaixo para abrir o material PDF.</p>
                            <a
                                href={training.content_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#3a7ad1] text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto w-fit hover:bg-blue-600"
                            >
                                <ExternalLink size={20} /> Abrir eBook
                            </a>
                        </div>
                    )}

                    {training.type === 'quiz' && training.quiz_data && (
                        <div className="bg-white w-full h-full p-8 text-gray-800 overflow-y-auto">
                            {!finishedQuiz ? (
                                <div className="max-w-xl mx-auto">
                                    <div className="mb-6 flex justify-between items-center text-sm text-gray-500">
                                        <span>Questão {currentQ + 1} de {training.quiz_data.length}</span>
                                        <span>Progresso: {Math.round(((currentQ) / training.quiz_data.length) * 100)}%</span>
                                    </div>

                                    <h2 className="text-2xl font-bold mb-6">{training.quiz_data[currentQ].question}</h2>

                                    <div className="space-y-3">
                                        {training.quiz_data[currentQ].options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    const newAns = [...answers];
                                                    newAns[currentQ] = idx;
                                                    setAnswers(newAns);
                                                }}
                                                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${answers[currentQ] === idx ? 'border-[#3a7ad1] bg-blue-50 text-blue-800' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-8 flex justify-between">
                                        <button
                                            disabled={currentQ === 0}
                                            onClick={() => setCurrentQ(curr => curr - 1)}
                                            className="text-gray-500 hover:text-gray-800 disabled:opacity-30"
                                        >
                                            Anterior
                                        </button>

                                        {currentQ < training.quiz_data.length - 1 ? (
                                            <button
                                                disabled={answers[currentQ] === undefined}
                                                onClick={() => setCurrentQ(curr => curr + 1)}
                                                className="bg-[#3a7ad1] text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                                            >
                                                Próxima
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleQuizSubmit}
                                                className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold"
                                            >
                                                Finalizar Quiz
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <h2 className="text-3xl font-bold mb-4">{score >= 70 ? 'Parabéns! 🏆' : 'Tente Novamente 😕'}</h2>
                                    <p className="text-xl mb-6">Sua nota: <span className={score >= 70 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{score}%</span></p>

                                    {score >= 70 ? (
                                        <div className="text-green-700 bg-green-50 p-4 rounded-lg inline-block">
                                            Você completou o treinamento e ganhou <span className="font-bold">{training.points} pontos</span>!
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setFinishedQuiz(false);
                                                setCurrentQ(0);
                                                setAnswers([]);
                                            }}
                                            className="bg-[#3a7ad1] text-white px-6 py-2 rounded-lg"
                                        >
                                            Refazer Quiz
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white border-t flex justify-end gap-4 h-20 items-center">
                    {training.type !== 'quiz' && (
                        <>
                            <p className="text-sm text-gray-500 mr-auto">Assista ou leia o conteúdo completo para marcar como concluído.</p>
                            {!training.completed && (
                                <button
                                    onClick={() => onComplete(training.id)}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
                                >
                                    <CheckCircle size={20} />
                                    Marcar como Concluído
                                </button>
                            )}
                        </>
                    )}
                    {training.completed && training.type !== 'quiz' && (
                        <span className="text-green-600 font-bold flex items-center gap-2">
                            <CheckCircle size={20} />
                            Concluído
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Training;
