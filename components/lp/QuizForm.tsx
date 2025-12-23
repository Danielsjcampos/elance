import React, { useState } from 'react';
import { Check, ArrowRight, User, Mail, Phone, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface QuizFormProps {
    onComplete?: () => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [franchiseId, setFranchiseId] = React.useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    React.useEffect(() => {
        const fetchFranchise = async () => {
            const { data } = await supabase
                .from('franchise_units')
                .select('id')
                .limit(1)
                .single();
            if (data) setFranchiseId(data.id);
        };
        fetchFranchise();
    }, []);

    const handleAnswer = (key: string, value: string) => {
        setAnswers({ ...answers, [key]: value });
        setStep(step + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Compile quiz data into a readable string
            const quizSummary = `
                Conhecimento: ${answers.knowledge}
                Interesse: ${answers.interest}
                Investimento: ${answers.investment}
            `.trim();

            // Send to Webhook
            try {
                await fetch('https://webhook.2b.app.br/webhook/formelance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        timestamp: new Date().toISOString(),
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        quiz_data: {
                            knowledge: answers.knowledge,
                            interest: answers.interest,
                            investment: answers.investment
                        },
                        source: 'LP E-Lance'
                    })
                });
            } catch (webhookError) {
                console.error('Error sending to webhook:', webhookError);
                // Continue execution even if webhook fails, to ensure data is saved in Supabase
            }

            if (!franchiseId) {
                throw new Error('Erro de configuração: Franquia não identificada.');
            }

            const { error } = await supabase.from('leads').insert([
                {
                    franchise_id: franchiseId,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    status: 'new', // Default status
                    source: 'LP Franquia (Quiz)',
                    notes: quizSummary // Storing quiz answers in notes or message
                }
            ]);

            if (error) throw error;

            if (onComplete) onComplete();
            alert('Cadastro recebido com sucesso! Entraremos em contato em breve.');
            // Optionally redirect to thank you page
        } catch (error: any) {
            console.error('Error submitting form:', error);
            alert('Erro ao enviar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="quiz-section" className="py-24 px-4 bg-[#0b0f1e] relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#3a7ad1]/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">

                {/* Irresistible Headline */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <span className="inline-block px-4 py-1 rounded-full bg-[#3a7ad1]/10 text-[#3a7ad1] text-sm font-bold tracking-wider mb-4 border border-[#3a7ad1]/20">
                        OPORTUNIDADE EXCLUSIVA
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                        Descubra se você tem o perfil para <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3a7ad1] to-purple-400">
                            faturar alto com leilões
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Responda a 3 perguntas rápidas e receba um <strong>Plano de Negócios Personalizado</strong> para ingressar neste mercado bilionário ainda este ano.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group hover:border-[#3a7ad1]/30 transition-all duration-500">

                    {/* Animated Glow Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3a7ad1]/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800/50 h-2 rounded-full mb-10 overflow-hidden relative">
                        <div
                            className="bg-gradient-to-r from-[#3a7ad1] to-cyan-400 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(58,122,209,0.5)]"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>

                    {step === 1 && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                                1. Qual seu nível de conhecimento atual sobre leilões?
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { text: "Nunca ouvi falar, mas quero aprender", icon: "🌱" },
                                    { text: "Sei o básico, mas nunca participei", icon: "📚" },
                                    { text: "Já participei ou acompanho o setor", icon: "💎" }
                                ].map((option) => (
                                    <button
                                        key={option.text}
                                        onClick={() => handleAnswer('knowledge', option.text)}
                                        className="w-full text-left p-6 rounded-2xl border border-white/5 hover:border-[#3a7ad1] bg-white/5 hover:bg-[#3a7ad1]/10 text-gray-200 hover:text-white transition-all duration-300 group flex items-center justify-between hover:translate-x-1"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">{option.icon}</span>
                                            <span className="font-medium text-lg">{option.text}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#3a7ad1] group-hover:border-transparent transition-all">
                                            <ArrowRight className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                                2. Qual é o seu principal objetivo hoje?
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { text: "Tornar-me um Leiloeiro Oficial", icon: "⚖️" },
                                    { text: "Investir para multiplicar capital", icon: "📈" },
                                    { text: "Empreender com uma Franquia E-Lance", icon: "🚀" }
                                ].map((option) => (
                                    <button
                                        key={option.text}
                                        onClick={() => handleAnswer('interest', option.text)}
                                        className="w-full text-left p-6 rounded-2xl border border-white/5 hover:border-[#3a7ad1] bg-white/5 hover:bg-[#3a7ad1]/10 text-gray-200 hover:text-white transition-all duration-300 group flex items-center justify-between hover:translate-x-1"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">{option.icon}</span>
                                            <span className="font-medium text-lg">{option.text}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#3a7ad1] group-hover:border-transparent transition-all">
                                            <ArrowRight className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                                3. Qual sua disponibilidade para investir no seu futuro?
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { text: "R$ 5.000 a R$ 20.000", badge: "Iniciante" },
                                    { text: "R$ 20.000 a R$ 50.000", badge: "Recomendado" },
                                    { text: "Acima de R$ 50.000", badge: "Expert" }
                                ].map((option) => (
                                    <button
                                        key={option.text}
                                        onClick={() => handleAnswer('investment', option.text)}
                                        className="w-full text-left p-6 rounded-2xl border border-white/5 hover:border-[#3a7ad1] bg-white/5 hover:bg-[#3a7ad1]/10 text-gray-200 hover:text-white transition-all duration-300 group flex items-center justify-between hover:translate-x-1"
                                    >
                                        <span className="font-medium text-lg">{option.text}</span>
                                        <span className={`text-xs px-3 py-1 rounded-full border ${option.badge === 'Recomendado' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-white/10 text-gray-400'}`}>
                                            {option.badge}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-gradient-to-br from-[#3a7ad1] to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 animate-pulse-slow">
                                    <Lock className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-2">
                                    Análise Concluída!
                                </h3>
                                <p className="text-gray-300">
                                    Liberamos um acesso exclusivo para você. Preencha abaixo para receber seu <span className="text-[#3a7ad1] font-bold">Plano Personalizado</span>.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div className="group relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-[#3a7ad1] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Seu nome completo"
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-gray-500 focus:border-[#3a7ad1] focus:ring-1 focus:ring-[#3a7ad1] outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="group relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-[#3a7ad1] transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="Seu melhor e-mail profissional"
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-gray-500 focus:border-[#3a7ad1] focus:ring-1 focus:ring-[#3a7ad1] outline-none transition-all"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="group relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-[#3a7ad1] transition-colors" />
                                    <input
                                        type="tel"
                                        placeholder="Seu WhatsApp (Link de acesso será enviado aqui)"
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-gray-500 focus:border-[#3a7ad1] focus:ring-1 focus:ring-[#3a7ad1] outline-none transition-all"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#3a7ad1] to-[#2a61b0] hover:from-[#2a61b0] hover:to-[#1a4a8d] text-white font-bold py-5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg uppercase tracking-wide"
                            >
                                {loading ? 'Gerando Plano...' : 'QUERO MEU ACESSO AGORA'}
                                {!loading && <ArrowRight className="w-6 h-6" />}
                            </button>

                            <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-2">
                                <Lock className="w-3 h-3" />
                                Seus dados estão criptografados e 100% seguros.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizForm;
