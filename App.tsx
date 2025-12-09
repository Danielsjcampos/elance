import React, { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import LawyerCta from './components/LawyerCta';
import Footer from './components/Footer';
import Franchise from './components/Franchise';
import FranchiseBroker from './components/FranchiseBroker';
import Contact from './components/Contact';
import Consultoria from './components/Consultoria';
import Escola from './components/Escola';
import CourseImoveis from './components/CourseImoveis';
import Downloads from './components/Downloads';
import CursoAdvogados from './components/CursoAdvogados';
import EscolaLeiloeiros from './components/EscolaLeiloeiros';
import Mentoria from './Mentoria';
import Ecossistema from './Ecossistema';
import Indique from './Indique';
import BidInvest from './components/BidInvest';
import { ModalProvider } from './contexts/ModalContext';
import LeadCaptureModal from './components/LeadCaptureModal';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#eff0f1] font-sans text-[#151d38]">
      <HelmetProvider>
        <ModalProvider>
          <Navbar onNavigate={handleNavigate} />
          <main>
            {currentPage === 'home' && (
              <>
                <Hero onNavigate={handleNavigate} />
                <About />
                <Services onNavigate={handleNavigate} />
                <LawyerCta onNavigate={handleNavigate} />
              </>
            )}
            {currentPage === 'franchise' && (
              <Franchise />
            )}
            {currentPage === 'franchise-broker' && (
              <FranchiseBroker />
            )}
            {currentPage === 'contact' && (
              <Contact />
            )}
            {currentPage === 'consultoria' && (
              <Consultoria />
            )}
            {currentPage === 'escola' && (
              <Escola />
            )}
            {currentPage === 'escola-leiloeiros' && (
              <EscolaLeiloeiros />
            )}
            {currentPage === 'curso-imoveis' && (
              <CourseImoveis />
            )}
            {currentPage === 'downloads' && (
              <Downloads />
            )}
            {currentPage === 'curso-advogados' && (
              <CursoAdvogados />
            )}
            {currentPage === 'mentoria' && (
              <Mentoria />
            )}
            {currentPage === 'ecossistema' && (
              <Ecossistema />
            )}
            {currentPage === 'indique' && (
              <Indique />
            )}
            {currentPage === 'bid-invest' && (
              <BidInvest />
            )}
          </main>
          <Footer />
          <LeadCaptureModal />
        </ModalProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;