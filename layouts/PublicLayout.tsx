
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadCaptureModal from '../components/LeadCaptureModal';
import FloatingLeadButton from '../components/FloatingLeadButton';

const PublicLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (pageId: string) => {
        switch (pageId) {
            case 'home':
                navigate('/');
                break;
            case 'franchise':
                navigate('/franchise');
                break;
            case 'franchise-broker':
                navigate('/franchise-broker');
                break;
            case 'contact':
                navigate('/contact');
                break;
            case 'consultoria':
                navigate('/consultoria');
                break;
            case 'escola':
                navigate('/escola');
                break;
            case 'escola-leiloeiros':
                navigate('/escola-leiloeiros');
                break;
            case 'curso-imoveis':
                navigate('/curso-imoveis');
                break;
            case 'downloads':
                navigate('/downloads');
                break;
            case 'curso-advogados':
                navigate('/curso-advogados');
                break;
            case 'mentoria':
                navigate('/mentoria');
                break;
            case 'ecossistema':
                navigate('/ecossistema');
                break;
            case 'indique':
                navigate('/indique');
                break;
            case 'bid-invest':
                navigate('/bid-invest');
                break;
            case 'portal':
                navigate('/portal');
                break;
            default:
                if (['about', 'services'].includes(pageId)) {
                    navigate(`/#${pageId}`);
                } else {
                    navigate(`/${pageId}`);
                }
                break;
        }
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen bg-[#eff0f1] font-sans text-[#151d38]">
            <Navbar onNavigate={handleNavigate} />
            <main>
                <Outlet context={{ onNavigate: handleNavigate }} />
            </main>
            <Footer />
            <LeadCaptureModal />
            <FloatingLeadButton />
        </div>
    );
};

export default PublicLayout;
