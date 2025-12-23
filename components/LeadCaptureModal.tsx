import React, { useState } from 'react';
import { X, ArrowRight, Check, MessageCircle, Mail, User } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

const LeadCaptureModal: React.FC = () => {
    const { isOpen, closeModal, source } = useModal();
    const { branding } = useTheme();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            nextStep();
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Save Lead to CRM
            if (branding?.id) {
                await supabase.from('leads').insert([{
                    franchise_id: branding.id,
                    name: formData.name,
                    phone: formData.whatsapp, // Mapping whatsapp to phone
                    email: formData.email,
                    status: 'new',
                    source: source || 'Floating Widget',
                    notes: 'Lead captured via WhatsApp Modal'
                }]);
            }

            // 2. Generate WhatsApp message based on source
            let message = `Olá! Meu nome é ${formData.name}. Gostaria de saber mais sobre a E-lance.`;

            if (source) {
                // Remove "Consultoria - " prefix if present for cleaner message
                const cleanSource = source.replace('Consultoria - ', '');
                message = `Olá! Meu nome é ${formData.name}. Tenho interesse em: *${cleanSource}*. Gostaria de mais informações.`;
            }

            // Encode message for URL
            const encodedMessage = encodeURIComponent(message);
            // Use contact number from branding or fallback
            // Assuming branding.phone exists or we have a context for it? 
            // ThemeContext/BrandingSettings currently has basic info. 
            // Let's stick to the existing hardcoded or a better configured one.
            // For now, keeping the original hardcoded number or improving if possible.
            // But wait, the original file had '5514998536254'. Ideally this should come from settings too.
            // Let's use the hardcoded one for now to avoid breaking if settings are empty.
            const phoneNumber = '5514998536254';
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

            // Redirect to WhatsApp
            window.open(whatsappUrl, '_blank');

            closeModal();
            setStep(1);
            setFormData({ name: '', whatsapp: '', email: '' });
        } catch (error) {
            console.error('Error submitting form', error);
            alert('Ocorreu um erro. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (formData.name.trim()) setStep(2);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#151d38]/80 backdrop-blur-sm transition-opacity"
                onClick={closeModal}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all animate-fade-in-up">
                {/* Header */}
                <div className="bg-[#151d38] p-6 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <MessageCircle size={100} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">Fale com um Especialista</h3>
                        <p className="text-gray-300 text-sm mt-1">Estamos prontos para te ajudar.</p>
                    </div>
                    <button onClick={closeModal} className="text-white/70 hover:text-white transition-colors z-10">
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-gray-100">
                    <div
                        className="h-full bg-[#3a7ad1] transition-all duration-300"
                        style={{ width: step === 1 ? '50%' : '100%' }}
                    ></div>
                </div>

                {/* Body */}
                <div className="p-8">
                    <form onSubmit={handleSubmit}>
                        {step === 1 ? (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#3a7ad1]">
                                        <User size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800">Qual é o seu nome?</h4>
                                    <p className="text-gray-500 text-sm">Para começarmos nosso atendimento.</p>
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Digite seu nome completo"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3a7ad1] focus:ring-2 focus:ring-[#3a7ad1]/20 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!formData.name.trim()}
                                    className="w-full py-3 px-6 rounded-xl bg-[#151d38] text-white font-bold hover:bg-[#3a7ad1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Continuar
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                        <MessageCircle size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800">Como podemos te contatar?</h4>
                                    <p className="text-gray-500 text-sm">Prometemos não enviar spam.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <MessageCircle className="absolute top-3.5 left-4 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                            placeholder="Seu WhatsApp (com DDD)"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#3a7ad1] focus:ring-2 focus:ring-[#3a7ad1]/20 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute top-3.5 left-4 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Seu melhor e-mail"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#3a7ad1] focus:ring-2 focus:ring-[#3a7ad1]/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.whatsapp || !formData.email}
                                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#3a7ad1] to-[#2a61b0] text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Receber Contato'}
                                    {!isSubmitting && <Check size={20} />}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-[#3a7ad1] transition-colors"
                                >
                                    Voltar
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LeadCaptureModal;
