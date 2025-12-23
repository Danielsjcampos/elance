import React, { useRef } from 'react';
import LpHero from '../components/lp/LpHero';
import QuizForm from '../components/lp/QuizForm';
import LpBio from '../components/lp/LpBio';
import LpFAQ from '../components/lp/LpFAQ';
import LpSEO from '../components/lp/LpSEO';
import { Logo } from '../components/Logo';

const LpElance: React.FC = () => {
    const quizRef = useRef<HTMLDivElement>(null);

    const scrollToQuiz = () => {
        quizRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-[#0f152a] min-h-screen text-white font-sans selection:bg-[#3a7ad1] selection:text-white">
            <LpSEO />
            {/* Minimal Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f152a]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <Logo className="h-8 md:h-10" />
                    <button
                        onClick={scrollToQuiz}
                        className="text-sm font-bold text-[#3a7ad1] hover:text-white transition-colors"
                    >
                        JÁ QUERO ME INSCREVER
                    </button>
                </div>
            </header>

            <main>
                <LpHero onStartQuiz={scrollToQuiz} />

                <LpBio />
                <LpFAQ />

                {/* Scroll Target for Quiz */}
                <div ref={quizRef}>
                    <QuizForm />
                </div>
            </main>

            <footer className="bg-[#0b0f1e] py-8 text-center border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} E-Lance. Todos os direitos reservados.
                    </p>
                    <p className="text-gray-600 text-xs mt-2">
                        CNPJ: 00.000.000/0001-00
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LpElance;
