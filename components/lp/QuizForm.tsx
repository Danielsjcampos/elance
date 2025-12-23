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
        <div id="quiz-section" className="py-20 px-4 bg-[#1a2342] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#3a7ad1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mb-8 overflow-hidden">
                        <div
                            className="bg-[#3a7ad1] h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>

                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                1. Você já conhece algo sobre leilões?
                            </h3>
                            <div className="space-y-4">
                                {[
                                    "Nunca ouvi falar, estou curioso",
                                    "Sei o básico, mas nunca participei",
                                    "Já participei ou acompanho o setor"
                                ].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswer('knowledge', option)}
                                        className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-[#3a7ad1] hover:bg-[#3a7ad1]/10 bg-white/5 text-gray-200 hover:text-white transition-all group flex items-center justify-between"
                                    >
                                        {option}
                                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-[#3a7ad1]" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                2. Qual seu principal objetivo?
                            </h3>
                            <div className="space-y-4">
                                {[
                                    "Atuar como leiloeiro profissional",
                                    "Investir ou arrematar imóveis",
                                    "Empreender com uma Franquia E-Lance"
                                ].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswer('interest', option)}
                                        className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-[#3a7ad1] hover:bg-[#3a7ad1]/10 bg-white/5 text-gray-200 hover:text-white transition-all group flex items-center justify-between"
                                    >
                                        {option}
                                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-[#3a7ad1]" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                3. Qual sua disponibilidade de investimento?
                            </h3>
                            <div className="space-y-4">
                                {[
                                    "R$ 5.000 a R$ 20.000",
                                    "R$ 20.000 a R$ 50.000",
                                    "Acima de R$ 50.000"
                                ].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswer('investment', option)}
                                        className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-[#3a7ad1] hover:bg-[#3a7ad1]/10 bg-white/5 text-gray-200 hover:text-white transition-all group flex items-center justify-between"
                                    >
                                        {option}
                                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-[#3a7ad1]" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-[#3a7ad1]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="w-8 h-8 text-[#3a7ad1]" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">
                                    Perfil Analisado!
                                </h3>
                                <p className="text-gray-400 mt-2">
                                    Preencha seus dados para receber o plano personalizado de acordo com suas respostas.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Seu nome completo"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-gray-500 focus:border-[#3a7ad1] focus:ring-1 focus:ring-[#3a7ad1] outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input
                                        type="email"
                                        placeholder="Seu melhor e-mail"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-gray-500 focus:border-[#3a7ad1] focus:ring-1 focus:ring-[#3a7ad1] outline-none transition-all"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input
                                        type="tel"
                                        placeholder="Seu WhatsApp (com DDD)"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-gray-500 focus:border-[#3a7ad1] focus:ring-1 focus:ring-[#3a7ad1] outline-none transition-all"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#3a7ad1] to-[#2a61b0] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Enviando...' : 'Receber Acesso Agora'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>

                            <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-2">
                                <Lock className="w-3 h-3" />
                                Seus dados estão 100% seguros. Não enviamos spam.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizForm;
